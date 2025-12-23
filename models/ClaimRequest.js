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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

claimRequestSchema.index({ document: 1, claimant: 1, status: 1 });

module.exports = mongoose.model("ClaimRequest", claimRequestSchema);
