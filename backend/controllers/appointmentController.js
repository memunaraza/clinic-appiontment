import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { isObjectBody } from "../utils/validation.js";

const populatedAppointment = (query) =>
  query
    .populate("patient", "name email")
    .populate("doctor", "name email specialization");

const parseAppointmentDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
};

export const createAppointment = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ message: "Request body must be an object" });
  }
  const { doctor: doctorId, appointmentDate: dateInput, appointmentTime, reason } = req.body;
  if (!doctorId || !dateInput || !appointmentTime || !reason) {
    return res.status(400).json({
      message: "Doctor, appointmentDate, appointmentTime, and reason are required"
    });
  }
  if (!mongoose.isValidObjectId(doctorId)) {
    return res.status(400).json({ message: "Invalid doctor identifier" });
  }

  const appointmentDate = parseAppointmentDate(dateInput);
  if (!appointmentDate) {
    return res.status(400).json({ message: "appointmentDate must be a valid YYYY-MM-DD date" });
  }
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (appointmentDate < today) {
    return res.status(400).json({ message: "Appointments cannot be booked in the past" });
  }
  if (typeof appointmentTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(appointmentTime)) {
    return res.status(400).json({ message: "appointmentTime must use 24-hour HH:mm format" });
  }
  if (typeof reason !== "string" || !reason.trim() || reason.trim().length > 1000) {
    return res.status(400).json({ message: "Reason must be between 1 and 1000 characters" });
  }

  const doctor = await User.findOne({ _id: doctorId, role: "doctor", isActive: true });
  if (!doctor) return res.status(404).json({ message: "Active doctor not found" });

  const existingAppointment = await Appointment.exists({
    doctor: doctorId,
    appointmentDate,
    appointmentTime,
    status: { $in: ["pending", "approved"] }
  });
  if (existingAppointment) {
    return res.status(409).json({ message: "This doctor already has an appointment at that time" });
  }

  const appointment = await Appointment.create({
    patient: req.user.id,
    doctor: doctorId,
    appointmentDate,
    appointmentTime,
    reason: reason.trim()
  });
  await appointment.populate([
    { path: "patient", select: "name email" },
    { path: "doctor", select: "name email specialization" }
  ]);
  return res.status(201).json({ appointment });
};

export const getMyAppointments = async (req, res) => {
  const appointments = await populatedAppointment(
    Appointment.find({ patient: req.user.id }).sort({ appointmentDate: 1, appointmentTime: 1 })
  );
  return res.status(200).json({ appointments });
};

export const getDoctorAppointments = async (req, res) => {
  const appointments = await populatedAppointment(
    Appointment.find({ doctor: req.user.id }).sort({ appointmentDate: 1, appointmentTime: 1 })
  );
  return res.status(200).json({ appointments });
};

export const updateAppointmentStatus = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ message: "Request body must be an object" });
  }
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Doctors may set status to approved or rejected" });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid appointment identifier" });
  }

  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, doctor: req.user.id, status: "pending" },
    { status },
    { new: true, runValidators: true }
  );
  if (!appointment) {
    const exists = await Appointment.exists({ _id: req.params.id });
    return res.status(exists ? 409 : 404).json({
      message: exists
        ? "Appointment is not assigned to you or is no longer pending"
        : "Appointment not found"
    });
  }
  await appointment.populate([
    { path: "patient", select: "name email" },
    { path: "doctor", select: "name email specialization" }
  ]);
  return res.status(200).json({ appointment });
};

export const cancelAppointment = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid appointment identifier" });
  }

  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, patient: req.user.id, status: "pending" },
    { status: "cancelled" },
    { new: true, runValidators: true }
  );
  if (!appointment) {
    const exists = await Appointment.exists({ _id: req.params.id });
    return res.status(exists ? 409 : 404).json({
      message: exists
        ? "Appointment is not yours or is no longer pending"
        : "Appointment not found"
    });
  }
  await appointment.populate([
    { path: "patient", select: "name email" },
    { path: "doctor", select: "name email specialization" }
  ]);
  return res.status(200).json({ appointment });
};
