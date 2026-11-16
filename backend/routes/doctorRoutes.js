import { Router } from "express";
import { getDoctorById, getDoctors } from "../controllers/doctorController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getDoctors));
router.get("/:id", asyncHandler(getDoctorById));

export default router;
