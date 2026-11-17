import mongoose from "mongoose";
import User from "../models/User.js";
import { attachDoctorProfiles } from "../utils/doctorProfiles.js";

export const getDoctors = async (req, res) => {
  const filter = { role: "doctor", isActive: true };
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  let expression;
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    expression = new RegExp(escapedSearch, "i");
  }

  const users = await User.find(filter)
    .select("name email isActive")
    .sort({ name: 1 });
  const doctorsWithProfiles = await attachDoctorProfiles(users);
  const doctors = doctorsWithProfiles.filter((doctor) =>
    doctor.specialization && (!expression || expression.test(doctor.name) || expression.test(doctor.specialization))
  );
  return res.status(200).json({ doctors });
};

export const getDoctorById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid doctor identifier" });
  }

  const user = await User.findOne({
    _id: req.params.id,
    role: "doctor",
    isActive: true
  }).select("name email isActive");
  if (!user) return res.status(404).json({ message: "Doctor not found" });
  const [doctor] = await attachDoctorProfiles([user]);
  if (!doctor.specialization) return res.status(404).json({ message: "Doctor not found" });
  return res.status(200).json({ doctor });
};
