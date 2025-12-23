const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
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
});

const documentReportSchema = new mongoose.Schema(
  {
    documentType: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    dateLost: { type: Date },
    status: {
      type: String,
      enum: ["lost", "found", "claimed"],
      default: "lost",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageFile: { type: Buffer },
    imageUrl: { type: String },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    claimedAt: { type: Date },
    claims: [claimSchema], // embedded claims array
    reportDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

documentReportSchema.index({ description: "text", location: "text" });

module.exports = mongoose.model("DocumentReport", documentReportSchema);
