import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import { isValidEmail, isValidName, isValidPassword } from "../utils/validation.js";

const createAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!isValidName(ADMIN_NAME) || !isValidEmail(ADMIN_EMAIL) || !isValidPassword(ADMIN_PASSWORD)) {
    throw new Error("Set a valid ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 8 characters and no more than 72 UTF-8 bytes");
  }

  await connectDB();
  const email = ADMIN_EMAIL.trim().toLowerCase();
  if (await User.exists({ email })) {
    throw new Error(`An account already exists for ${email}`);
  }

  const admin = await User.create({
    name: ADMIN_NAME.trim(),
    email,
    password: ADMIN_PASSWORD,
    role: "admin"
  });
  console.log(`Created admin account: ${admin.email}`);
};

try {
  await createAdmin();
} catch (error) {
  console.error("Could not create admin account:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
