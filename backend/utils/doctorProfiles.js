import Doctor from "../models/Doctor.js";

export const mergeDoctorProfiles = (users, profiles) => {
  const profilesByUserId = new Map(
    profiles.map((profile) => [profile.user.toString(), profile])
  );

  return users.map((user) => {
    if (!user) return user;
    const userRecord = typeof user.toObject === "function" ? user.toObject() : { ...user };
    delete userRecord.password;
    const profile = profilesByUserId.get(userRecord._id.toString());
    if (!profile) return userRecord;
    return {
      ...userRecord,
      phone: profile.phone,
      profilePicture: profile.profilePicture,
      specialization: profile.specialization,
      qualification: profile.qualification,
      experience: profile.experience,
      consultationFee: profile.consultationFee,
      biography: profile.biography
    };
  });
};

export const attachDoctorProfiles = async (users) => {
  const userIds = users.filter(Boolean).map((user) => user._id);
  if (!userIds.length) return users;

  const profiles = await Doctor.find({ user: { $in: userIds } })
    .select("user phone profilePicture specialization qualification experience consultationFee biography")
    .lean();
  return mergeDoctorProfiles(users, profiles);
};
