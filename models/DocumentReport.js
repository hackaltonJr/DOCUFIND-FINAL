const mongoose = require("mongoose");

const documentReportSchema = new mongoose.Schema(
  {
    documentType: { type: String, required: true },
    description: { type: String },
    dateLost: { type: Date },
    dateFound: { type: Date },
    location: { type: String },
    whereFound: { type: String },
    lastSeenLocation: { type: String },
    status: {
      type: String,
      enum: ["lost", "found", "claimed", "verified", "handed_over"],
      default: "lost",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reporterName: { type: String },
    imageFile: { type: Buffer },
    imageUrl: { type: String },
    holderName: { type: String },
    documentNumber: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    claimedAt: { type: Date },
    isClaimed: { type: Boolean, default: false },
    reportDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

documentReportSchema.index({ description: "text", location: "text" });

module.exports = mongoose.model("DocumentReport", documentReportSchema);
