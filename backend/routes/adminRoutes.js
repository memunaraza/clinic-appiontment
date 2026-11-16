import { Router } from "express";
import {
  createDoctor,
  deleteUser,
  getAllAppointments,
  getStats,
  getUsers,
  setUserActive
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.use(protect, authorize("admin"));
router.get("/users", asyncHandler(getUsers));
router.post("/doctors", asyncHandler(createDoctor));
router.patch("/users/:id/active", asyncHandler(setUserActive));
router.delete("/users/:id", asyncHandler(deleteUser));
router.get("/appointments", asyncHandler(getAllAppointments));
router.get("/stats", asyncHandler(getStats));

export default router;
