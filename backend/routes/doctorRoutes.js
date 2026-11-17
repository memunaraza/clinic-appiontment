import { Router } from "express";
import {
  changeDoctorPassword,
  getDoctorAvailability,
  getDoctorNotifications,
  getDoctorPatients,
  getDoctorProfile,
  getDoctorReviews,
  markAllDoctorNotificationsRead,
  markDoctorNotificationRead,
  updateDoctorAvailability,
  updateDoctorProfile
} from "../controllers/doctorPortalController.js";
import { getDoctorById, getDoctors } from "../controllers/doctorController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getDoctors));
router.get("/:id", asyncHandler(getDoctorById));
router.use("/me", protect, authorize("doctor"));
router.get("/me/profile", asyncHandler(getDoctorProfile));
router.patch("/me/profile", asyncHandler(updateDoctorProfile));
router.patch("/me/password", asyncHandler(changeDoctorPassword));
router.get("/me/patients", asyncHandler(getDoctorPatients));
router.get("/me/availability", asyncHandler(getDoctorAvailability));
router.put("/me/availability", asyncHandler(updateDoctorAvailability));
router.get("/me/reviews", asyncHandler(getDoctorReviews));
router.get("/me/notifications", asyncHandler(getDoctorNotifications));
router.patch("/me/notifications/read-all", asyncHandler(markAllDoctorNotificationsRead));
router.patch("/me/notifications/:id/read", asyncHandler(markDoctorNotificationRead));

export default router;
