import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must use HH:mm format"]
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "End time must use HH:mm format"]
    }
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true
    },
    slots: {
      type: [timeSlotSchema],
      default: []
    }
  },
  { timestamps: true }
);

availabilitySchema.index({ doctor: 1, day: 1 }, { unique: true });

const DoctorAvailability = mongoose.model("DoctorAvailability", availabilitySchema);

export default DoctorAvailability;
