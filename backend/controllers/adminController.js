import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import { populateAppointments } from "../utils/appointmentPopulation.js";
import { attachDoctorProfiles } from "../utils/doctorProfiles.js";
import { normalizeDoctorProfileFields } from "../utils/doctorProfileValidation.js";
import {
  isObjectBody,
  isValidEmail,
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
  return res.status(200).json({ users: await attachDoctorProfiles(users) });
};

export const createDoctor = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ message: "Request body must be an object" });
  }
  const { name, email, password } = req.body;
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
  const { profile, error } = normalizeDoctorProfileFields(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: "An account with that email already exists" });
  }
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "doctor"
  });
  try {
    await Doctor.create({ user: user._id, ...profile });
  } catch (error) {
    await User.deleteOne({ _id: user._id });
    throw error;
  }

  const [doctor] = await attachDoctorProfiles([user]);
  return res.status(201).json({
    doctor: { ...doctor, id: user.id }
  });
};

export const updateDoctor = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid doctor identifier" });
  }
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ message: "Request body must be an object" });
  }

  const user = await User.findOne({ _id: req.params.id, role: "doctor" }).select("-password");
  if (!user) return res.status(404).json({ message: "Doctor not found" });
  const doctorProfile = await Doctor.findOne({ user: user._id });
  if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found" });

  const hasName = Object.prototype.hasOwnProperty.call(req.body, "name");
  const hasEmail = Object.prototype.hasOwnProperty.call(req.body, "email");
  if (!hasName && !hasEmail && !Object.keys(req.body).some((field) => [
    "phone", "profilePicture", "specialization", "qualification", "experience", "consultationFee", "biography"
  ].includes(field))) {
    return res.status(400).json({ message: "Provide at least one editable doctor field" });
  }
  if (hasName && !isValidName(req.body.name)) {
    return res.status(400).json({ message: "Name must be between 2 and 100 characters" });
  }
  if (hasEmail && !isValidEmail(req.body.email)) {
    return res.status(400).json({ message: "A valid email address is required" });
  }
  const { profile, error } = normalizeDoctorProfileFields(req.body, { partial: true });
  if (error) return res.status(400).json({ message: error });

  if (hasEmail) {
    const email = req.body.email.trim().toLowerCase();
    if (await User.exists({ email, _id: { $ne: user._id } })) {
      return res.status(409).json({ message: "An account with that email already exists" });
    }
    user.email = email;
  }
  if (hasName) user.name = req.body.name.trim();

  Object.assign(doctorProfile, profile);
  await Promise.all([user.validate(), doctorProfile.validate()]);
  await user.save();
  await doctorProfile.save();
  const [doctor] = await attachDoctorProfiles([user]);
  return res.status(200).json({ doctor });
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

  if (user.role === "doctor") {
    await Doctor.deleteOne({ user: user._id });
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
  const appointments = await populateAppointments(
    Appointment.find().sort({ appointmentDate: -1, appointmentTime: 1 })
  );
  return res.status(200).json({ appointments });
};

export const getStats = async (req, res) => {
  const [totalPatients, totalDoctors, totalAppointments] = await Promise.all([
    User.countDocuments({ role: "patient" }),
    Doctor.countDocuments(),
    Appointment.countDocuments()
  ]);
  return res.status(200).json({
    stats: { totalPatients, totalDoctors, totalAppointments }
  });
};
