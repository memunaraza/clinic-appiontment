import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

const isValidLegacyProfile = (user) => {
  const hasExperience = (
    typeof user.experience === "number" && Number.isFinite(user.experience)
  ) || (
    typeof user.experience === "string" &&
    user.experience.trim() !== "" &&
    Number.isFinite(Number(user.experience))
  );
  return typeof user.specialization === "string" &&
    user.specialization.trim().length > 0 &&
    user.specialization.trim().length <= 100 &&
    hasExperience &&
    Number(user.experience) >= 0;
};

const migrateDoctorProfiles = async () => {
  await connectDB();
  await Doctor.init();

  const users = await User.collection
    .find({ role: "doctor" })
    .project({ _id: 1, specialization: 1, experience: 1 })
    .toArray();
  if (!users.length) {
    console.log("No doctor accounts found.");
    return;
  }

  const userIds = users.map((user) => user._id);
  const existingProfiles = await Doctor.find({ user: { $in: userIds } })
    .select("user")
    .lean();
  const existingProfileIds = new Set(
    existingProfiles.map((profile) => profile.user.toString())
  );
  const missingProfiles = users.filter((user) =>
    !existingProfileIds.has(user._id.toString()) && !isValidLegacyProfile(user)
  );
  if (missingProfiles.length) {
    throw new Error(
      `Cannot migrate doctor accounts without valid profile data: ${missingProfiles.map((user) => user._id).join(", ")}`
    );
  }

  const legacyProfiles = users.filter(isValidLegacyProfile);
  if (legacyProfiles.length) {
    await Doctor.bulkWrite(legacyProfiles.map((user) => ({
      updateOne: {
        filter: { user: user._id },
        update: {
          $set: {
            user: user._id,
            phone: "",
            profilePicture: "",
            specialization: user.specialization.trim(),
            qualification: "",
            experience: Number(user.experience),
            consultationFee: 0,
            biography: ""
          }
        },
        upsert: true
      }
    })));
  }

  const migratedCount = await Doctor.countDocuments({ user: { $in: userIds } });
  if (migratedCount !== users.length) {
    throw new Error(`Expected ${users.length} doctor profiles after migration, found ${migratedCount}`);
  }

  await User.collection.updateMany(
    { role: "doctor" },
    { $unset: { specialization: "", experience: "" } }
  );
  console.log(`Migrated ${users.length} doctor profiles to the doctors collection.`);
};

try {
  await migrateDoctorProfiles();
} catch (error) {
  console.error("Could not migrate doctor profiles:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
