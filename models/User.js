const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    avatarUrl: { type: String, required: false },
    role: {
      type: String,
      enum: ["reporter", "finder", "rc_staff", "police", "admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "archived"],
      default: "active",
    },
    credibilityScore: { type: Number, default: 80 },
    phoneNumber: { type: String, required: false },
    preferedContactMethod: {
      type: String,
      enum: ["email", "phone"],
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
