import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isObjectBody, isValidEmail, isValidName, isValidPassword } from "../utils/validation.js";

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

export const register = async (req, res) => {
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

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: "An account with that email already exists" });
  }

  const user = await User.create({ name, email: normalizedEmail, password, role: "patient" });
  return res.status(201).json({
    token: createToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  });
};

export const login = async (req, res) => {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ message: "Request body must be an object" });
  }
  const { email, password } = req.body;
  if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if (Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({ message: "Password must not exceed 72 UTF-8 bytes" });
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: "This account is deactivated" });
  }

  return res.status(200).json({
    token: createToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
      experience: user.experience,
      isActive: user.isActive
    }
  });
};
