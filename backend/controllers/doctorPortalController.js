import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import DoctorAvailability from "../models/DoctorAvailability.js";
import Notification from "../models/Notification.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { populateAppointments } from "../utils/appointmentPopulation.js";
import { attachDoctorProfiles } from "../utils/doctorProfiles.js";
import { normalizeDoctorProfileFields } from "../utils/doctorProfileValidation.js";
import { isObjectBody, isValidEmail, isValidName, isValidPassword } from "../utils/validation.js";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const loadAvailability = async (doctorId) => {
  const savedDays = await DoctorAvailability.find({ doctor: doctorId }).lean();
  const byDay = new Map(savedDays.map((day) => [day.day, day.slots]));
  return weekDays.map((day) => ({ day, slots: byDay.get(day) || [] }));
};

const validateAvailability = (days) => {
  if (!Array.isArray(days) || days.length !== weekDays.length) {
    return { error: "Provide availability for all seven days of the week." };
  }
  const seenDays = new Set();
  for (const entry of days) {
    if (!isObjectBody(entry) || !weekDays.includes(entry.day) || seenDays.has(entry.day)) {
      return { error: "Each weekday must be included exactly once." };
    }
    seenDays.add(entry.day);
    if (!Array.isArray(entry.slots) || entry.slots.length > 12) {
      return { error: "Each day can have up to 12 time slots." };
    }
    const ranges = [];
    for (const slot of entry.slots) {
      if (!isObjectBody(slot) || !timePattern.test(slot.startTime) || !timePattern.test(slot.endTime)) {
        return { error: "Time slots must use 24-hour HH:mm format." };
      }
      const start = Number(slot.startTime.slice(0, 2)) * 60 + Number(slot.startTime.slice(3));
      const end = Number(slot.endTime.slice(0, 2)) * 60 + Number(slot.endTime.slice(3));
      if (start >= end) return { error: "A time slot must end after it starts on the same day." };
      ranges.push({ start, end });
    }
    ranges.sort((left, right) => left.start - right.start);
    if (ranges.some((range, index) => index > 0 && ranges[index - 1].end > range.start)) {
      return { error: `${entry.day} has overlapping time slots.` };
    }
  }
  return { error: "" };
};

export const getDoctorProfile = async (req, res) => {
  const [doctor] = await attachDoctorProfiles([req.user]);
  return res.status(200).json({ doctor });
};

export const updateDoctorProfile = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ message: "Request body must be an object" });
  }

  const user = await User.findById(req.user.id).select("-password");
  const doctorProfile = await Doctor.findOne({ user: req.user.id });
  if (!user || !doctorProfile) return res.status(404).json({ message: "Doctor profile not found" });

  const hasName = Object.prototype.hasOwnProperty.call(req.body, "name");
  const hasEmail = Object.prototype.hasOwnProperty.call(req.body, "email");
  if (!hasName && !hasEmail && !Object.keys(req.body).some((field) => [
    "phone", "profilePicture", "specialization", "qualification", "experience", "consultationFee", "biography"
  ].includes(field))) {
    return res.status(400).json({ message: "Provide at least one editable profile field" });
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

export const changeDoctorPassword = async (req, res) => {
  if (!isObjectBody(req.body) || typeof req.body.currentPassword !== "string") {
    return res.status(400).json({ message: "Current password and new password are required" });
  }
  if (!isValidPassword(req.body.newPassword)) {
    return res.status(400).json({
      message: "New password must be at least 8 characters and no more than 72 UTF-8 bytes"
    });
  }

  const user = await User.findById(req.user.id).select("+password");
  if (!user || !(await user.comparePassword(req.body.currentPassword))) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }
  user.password = req.body.newPassword;
  await user.save();
  return res.status(200).json({ message: "Password updated successfully" });
};

export const getDoctorPatients = async (req, res) => {
  const appointments = await populateAppointments(
    Appointment.find({ doctor: req.user.id })
      .sort({ appointmentDate: -1, appointmentTime: 1 })
  );
  const patientsById = new Map();
  for (const appointment of appointments) {
    const patient = appointment.patient;
    if (!patient) continue;
    const id = patient._id.toString();
    if (!patientsById.has(id)) patientsById.set(id, { ...patient, appointments: [] });
    patientsById.get(id).appointments.push(appointment);
  }
  return res.status(200).json({ patients: [...patientsById.values()] });
};

export const getDoctorAvailability = async (req, res) => {
  const availability = await loadAvailability(req.user.id);
  return res.status(200).json({ availability });
};

export const updateDoctorAvailability = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ message: "Request body must be an object" });
  }
  const { error } = validateAvailability(req.body.days);
  if (error) return res.status(400).json({ message: error });

  await DoctorAvailability.bulkWrite(req.body.days.map(({ day, slots }) => ({
    updateOne: {
      filter: { doctor: req.user.id, day },
      update: { $set: { doctor: req.user.id, day, slots } },
      upsert: true
    }
  })));
  const availability = await loadAvailability(req.user.id);
  return res.status(200).json({ availability });
};

export const getDoctorReviews = async (req, res) => {
  const reviews = await Review.find({ doctor: req.user.id })
    .populate("patient", "name")
    .sort({ createdAt: -1 })
    .limit(100);
  const ratings = await Review.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(req.user.id) } },
    { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);
  return res.status(200).json({
    reviews,
    summary: {
      averageRating: ratings[0]?.average ?? null,
      totalReviews: ratings[0]?.count ?? 0
    }
  });
};

export const getDoctorNotifications = async (req, res) => {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user.id })
      .populate("appointment", "appointmentDate appointmentTime status")
      .sort({ createdAt: -1 })
      .limit(100),
    Notification.countDocuments({ recipient: req.user.id, readAt: null })
  ]);
  return res.status(200).json({ notifications, unreadCount });
};

export const markDoctorNotificationRead = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid notification identifier" });
  }
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { readAt: new Date() },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  return res.status(200).json({ notification });
};

export const markAllDoctorNotificationsRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, readAt: null },
    { readAt: new Date() }
  );
  return res.status(200).json({ message: "Notifications marked as read" });
};
