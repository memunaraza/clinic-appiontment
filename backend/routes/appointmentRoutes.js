import { Router } from "express";
import {
  cancelAppointment,
  createAppointmentReview,
  createAppointment,
  getDoctorAppointments,
  getMyAppointments,
  updateAppointmentStatus
} from "../controllers/appointmentController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.use(protect);
router.post("/", authorize("patient"), asyncHandler(createAppointment));
router.get("/my", authorize("patient"), asyncHandler(getMyAppointments));
router.get("/doctor", authorize("doctor"), asyncHandler(getDoctorAppointments));
router.patch("/:id/status", authorize("doctor"), asyncHandler(updateAppointmentStatus));
router.patch("/:id/cancel", authorize("patient"), asyncHandler(cancelAppointment));
router.post("/:id/review", authorize("patient"), asyncHandler(createAppointmentReview));

export default router;
