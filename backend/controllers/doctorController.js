import mongoose from "mongoose";
import User from "../models/User.js";

export const getDoctors = async (req, res) => {
  const filter = { role: "doctor", isActive: true };
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const expression = new RegExp(escapedSearch, "i");
    filter.$or = [{ name: expression }, { specialization: expression }];
  }

  const doctors = await User.find(filter)
    .select("name email specialization experience isActive")
    .sort({ name: 1 });
  return res.status(200).json({ doctors });
};

export const getDoctorById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid doctor identifier" });
  }

  const doctor = await User.findOne({
    _id: req.params.id,
    role: "doctor",
    isActive: true
  }).select("name email specialization experience isActive");
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  return res.status(200).json({ doctor });
};
