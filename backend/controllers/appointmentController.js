import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import DoctorAvailability from "../models/DoctorAvailability.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { populateAppointment, populateAppointments } from "../utils/appointmentPopulation.js";
import { createNotification } from "../utils/notifications.js";
import { isObjectBody } from "../utils/validation.js";

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

  const [doctor, doctorProfile] = await Promise.all([
    User.findOne({ _id: doctorId, role: "doctor", isActive: true }).select("_id"),
    Doctor.exists({ user: doctorId })
  ]);
  if (!doctor || !doctorProfile) return res.status(404).json({ message: "Active doctor not found" });

  const day = weekDays[appointmentDate.getUTCDay()];
  const availability = await DoctorAvailability.findOne({ doctor: doctorId, day }).lean();
  if (availability && !availability.slots.some(
    (slot) => appointmentTime >= slot.startTime && appointmentTime < slot.endTime
  )) {
    return res.status(409).json({ message: "The doctor is not available at this time" });
  }

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
  await createNotification({
    recipient: doctorId,
    type: "new_appointment",
    title: "New appointment request",
    message: `${req.user.name} requested an appointment.`,
    appointment: appointment._id
  });
  return res.status(201).json({ appointment: await populateAppointment(appointment) });
};

export const getMyAppointments = async (req, res) => {
  const appointments = await populateAppointments(
    Appointment.find({ patient: req.user.id }).sort({ appointmentDate: 1, appointmentTime: 1 })
  );
  const reviews = await Review.find({
    patient: req.user.id,
    appointment: { $in: appointments.map((appointment) => appointment._id) }
  }).select("appointment").lean();
  const reviewedAppointments = new Set(reviews.map((review) => review.appointment.toString()));
  return res.status(200).json({
    appointments: appointments.map((appointment) => ({
      ...appointment,
      hasReview: reviewedAppointments.has(appointment._id.toString())
    }))
  });
};

export const getDoctorAppointments = async (req, res) => {
  const appointments = await populateAppointments(
    Appointment.find({ doctor: req.user.id }).sort({ appointmentDate: 1, appointmentTime: 1 })
  );
  return res.status(200).json({ appointments });
};

export const updateAppointmentStatus = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ message: "Request body must be an object" });
  }
  const { status } = req.body;
  if (!["approved", "rejected", "completed"].includes(status)) {
    return res.status(400).json({ message: "Doctors may approve, reject, or complete appointments" });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid appointment identifier" });
  }

  const appointment = await Appointment.findOneAndUpdate(
    {
      _id: req.params.id,
      doctor: req.user.id,
      status: status === "completed" ? "approved" : "pending"
    },
    { status },
    { new: true, runValidators: true }
  );
  if (!appointment) {
    const exists = await Appointment.exists({ _id: req.params.id });
    return res.status(exists ? 409 : 404).json({
      message: exists
        ? "Appointment is not assigned to you or cannot transition to that status"
        : "Appointment not found"
    });
  }
  return res.status(200).json({ appointment: await populateAppointment(appointment) });
};

export const createAppointmentReview = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid appointment identifier" });
  }
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ message: "Request body must be an object" });
  }
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be a whole number between 1 and 5" });
  }
  if (req.body.comment !== undefined && (
    typeof req.body.comment !== "string" || req.body.comment.trim().length > 1000
  )) {
    return res.status(400).json({ message: "Review comment must be 1000 characters or fewer" });
  }

  const appointment = await Appointment.findOne({
    _id: req.params.id,
    patient: req.user.id
  });
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  if (appointment.status !== "completed") {
    return res.status(409).json({ message: "Only completed appointments can be reviewed" });
  }
  if (await Review.exists({ appointment: appointment._id })) {
    return res.status(409).json({ message: "This appointment has already been reviewed" });
  }

  const review = await Review.create({
    appointment: appointment._id,
    patient: req.user.id,
    doctor: appointment.doctor,
    rating,
    comment: req.body.comment?.trim() || ""
  });
  await createNotification({
    recipient: appointment.doctor,
    type: "new_review",
    title: "New patient review",
    message: `${req.user.name} left a ${rating}-star review.`,
    appointment: appointment._id
  });
  await review.populate("patient", "name");
  return res.status(201).json({ review });
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
  return res.status(200).json({ appointment: await populateAppointment(appointment) });
};
