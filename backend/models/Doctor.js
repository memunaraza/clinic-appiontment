import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 32,
      default: ""
    },
    profilePicture: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: ""
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    qualification: {
      type: String,
      trim: true,
      maxlength: 200,
      default: ""
    },
    experience: {
      type: Number,
      required: true,
      min: 0
    },
    consultationFee: {
      type: Number,
      min: 0,
      default: 0
    },
    biography: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    }
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
