const mongoose = require("mongoose");

const claimRequestSchema = new mongoose.Schema(
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
    claimantName: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "under_review"],
      default: "pending",
    },
    evidence: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

claimRequestSchema.index({ document: 1, claimant: 1, status: 1 });

module.exports = mongoose.model("ClaimRequest", claimRequestSchema);
