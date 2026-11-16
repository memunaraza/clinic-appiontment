import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? 5000);
const clientOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const trustProxyHops = Number(process.env.TRUST_PROXY ?? 0);

if (!process.env.JWT_SECRET || (isProduction && process.env.JWT_SECRET.length < 32)) {
  throw new Error("JWT_SECRET must be configured and contain at least 32 characters in production");
}
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}
if (!Number.isSafeInteger(trustProxyHops) || trustProxyHops < 0) {
  throw new Error("TRUST_PROXY must be a non-negative integer");
}
if (isProduction && clientOrigins.length === 0) {
  throw new Error("CLIENT_ORIGIN must be configured in production");
}
for (const origin of clientOrigins) {
  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    throw new Error("CLIENT_ORIGIN must contain valid HTTP or HTTPS origins");
  }
  if (!["http:", "https:"].includes(parsedOrigin.protocol) || parsedOrigin.origin !== origin) {
    throw new Error("CLIENT_ORIGIN must contain valid HTTP or HTTPS origins without paths");
  }
  if (isProduction && parsedOrigin.protocol !== "https:") {
    throw new Error("CLIENT_ORIGIN must use HTTPS in production");
  }
}

app.set("trust proxy", trustProxyHops || false);
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: clientOrigins.length ? clientOrigins : !isProduction
  })
);
app.use(express.json({ limit: "10kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." }
});

app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(port, () => {
      console.log(`Clinic API listening on port ${port}`);
    });
    server.on("error", (error) => {
      console.error("API listener failed:", error.message);
      process.exit(1);
    });

    const shutdown = (signal) => {
      console.log(`Received ${signal}; shutting down`);
      server.close(async (error) => {
        try {
          await mongoose.disconnect();
          if (error) process.exitCode = 1;
        } catch (disconnectError) {
          console.error("Could not close MongoDB connection:", disconnectError.message);
          process.exitCode = 1;
        }
      });
    };
    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    if (!isProduction) console.error(error.stack);
    process.exit(1);
  }
};

startServer();
