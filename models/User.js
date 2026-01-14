const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    role: {
      type: String,
      enum: ["reporter", "finder", "rc_staff", "police", "admin"],
      default: "reporter",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "archived"],
      default: "active",
    },
    credibilityScore: { type: Number, default: 100 },
    phoneNumber: { type: String },
    preferredContactMethod: {
      type: String,
      enum: ["email", "phone"],
      default: "email",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
