import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import doctorSeedProfiles from "../seeds/doctors.js";
import { isValidPassword } from "../utils/validation.js";

const seedDoctors = async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Sample doctor accounts can only be seeded outside production");
  }
  if (!isValidPassword(process.env.DOCTOR_SEED_PASSWORD)) {
    throw new Error("Set DOCTOR_SEED_PASSWORD to a password of at least 8 characters and no more than 72 UTF-8 bytes");
  }

  await connectDB();
  await Doctor.init();

  const emails = doctorSeedProfiles.map(({ email }) => email);
  const existingUsers = await User.find({ email: { $in: emails } }).select("email role");
  const usersByEmail = new Map(existingUsers.map((user) => [user.email, user]));
  const conflictingAccounts = existingUsers.filter((user) => user.role !== "doctor");
  if (conflictingAccounts.length) {
    throw new Error(
      `Seed email is already used by a non-doctor account: ${conflictingAccounts.map((user) => user.email).join(", ")}`
    );
  }

  let createdAccounts = 0;
  let createdProfiles = 0;
  for (const profile of doctorSeedProfiles) {
    let user = usersByEmail.get(profile.email);
    if (!user) {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        password: process.env.DOCTOR_SEED_PASSWORD,
        role: "doctor"
      });
      usersByEmail.set(profile.email, user);
      createdAccounts += 1;
    }

    if (await Doctor.exists({ user: user._id })) continue;
    await Doctor.create({
      user: user._id,
      specialization: profile.specialization,
      experience: profile.experience
    });
    createdProfiles += 1;
  }

  console.log(
    `Seeded ${doctorSeedProfiles.length} sample doctors (${createdAccounts} accounts and ${createdProfiles} profiles created).`
  );
  console.log("New sample accounts use the password supplied in DOCTOR_SEED_PASSWORD.");
};

try {
  await seedDoctors();
} catch (error) {
  console.error("Could not seed sample doctors:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
