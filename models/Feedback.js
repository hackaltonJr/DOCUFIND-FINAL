const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    rating: { type: Number },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
    response: { type: String },
    adminNotes: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
