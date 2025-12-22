const { string } = require("joi");
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: { type: String, required: false },
    message: { type: String, required: true },
    rating: { type: Number, required: false },
    status: { type: String, enum: ["pending", "resolved"], default: "pending" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
