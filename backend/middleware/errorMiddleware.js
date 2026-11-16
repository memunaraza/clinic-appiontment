export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must contain valid JSON" });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large" });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(error.errors).map((item) => item.message)
    });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource identifier" });
  }
  if (error.code === 11000) {
    if (error.keyPattern?.doctor && error.keyPattern?.appointmentDate) {
      return res.status(409).json({ message: "This doctor already has an appointment at that time" });
    }
    return res.status(409).json({ message: "A record with that value already exists" });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};
