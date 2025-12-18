const mongoose = require("mongoose");

const ClaimRequestSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentReport",
      required: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClaimRequest", ClaimRequestSchema);
