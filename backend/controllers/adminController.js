import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import {
  isObjectBody,
  isValidEmail,
  isValidExperience,
  isValidName,
  isValidPassword
} from "../utils/validation.js";

export const getUsers = async (req, res) => {
  const filter = {};
  if (["admin", "doctor", "patient"].includes(req.query.role)) {
    filter.role = req.query.role;
  }
  if (req.query.isActive === "true" || req.query.isActive === "false") {
    filter.isActive = req.query.isActive === "true";
  }

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 });
  return res.status(200).json({ users });
};

export const createDoctor = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ message: "Request body must be an object" });
  }
  const { name, email, password, specialization, experience } = req.body;
  if (!isValidExperience(experience)) {
    return res.status(400).json({
      message: "Experience must be a non-negative number"
    });
  }
  if (!isValidName(name)) {
    return res.status(400).json({ message: "Name must be between 2 and 100 characters" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "A valid email address is required" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters and no more than 72 UTF-8 bytes"
    });
  }
  if (typeof specialization !== "string" || !specialization.trim() || specialization.trim().length > 100) {
    return res.status(400).json({ message: "Specialization must be between 1 and 100 characters" });
  }
  const parsedExperience = Number(experience);

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: "An account with that email already exists" });
  }
  const doctor = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "doctor",
    specialization: specialization.trim(),
    experience: parsedExperience
  });
  return res.status(201).json({
    doctor: {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      specialization: doctor.specialization,
      experience: doctor.experience,
      isActive: doctor.isActive
    }
  });
};

export const deleteUser = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid user identifier" });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") {
    return res.status(403).json({ message: "Admin accounts cannot be deleted through this endpoint" });
  }

  await User.deleteOne({ _id: user._id });
  return res.status(200).json({ message: "User deleted successfully" });
};

export const setUserActive = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid user identifier" });
  }
  if (!isObjectBody(req.body) || typeof req.body.isActive !== "boolean") {
    return res.status(400).json({ message: "isActive must be a boolean" });
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: { $ne: "admin" } },
    { isActive: req.body.isActive },
    { new: true, runValidators: true }
  ).select("-password");
  if (!user) {
    const existing = await User.exists({ _id: req.params.id });
    return res.status(existing ? 403 : 404).json({
      message: existing ? "Admin accounts cannot be deactivated here" : "User not found"
    });
  }
  return res.status(200).json({ user });
};

export const getAllAppointments = async (req, res) => {
  const appointments = await Appointment.find()
    .populate("patient", "name email")
    .populate("doctor", "name email specialization")
    .sort({ appointmentDate: -1, appointmentTime: 1 });
  return res.status(200).json({ appointments });
};

export const getStats = async (req, res) => {
  const [totalPatients, totalDoctors, totalAppointments] = await Promise.all([
    User.countDocuments({ role: "patient" }),
    User.countDocuments({ role: "doctor" }),
    Appointment.countDocuments()
  ]);
  return res.status(200).json({
    stats: { totalPatients, totalDoctors, totalAppointments }
  });
};
