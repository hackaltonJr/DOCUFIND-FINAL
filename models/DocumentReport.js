const mongoose = require("mongoose");
const ClaimRequest = require("./ClaimRequest");

const documentSchema = new mongoose.Schema(
  {
    documentType: { type: String, required: true },
    description: { type: String, required: true },
    dateLost: { type: Date, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["lost", "found", "claimed"],
      required: true,
    },
    reportedBy: {
      type: String,
      required: true,
    },
    imageUrl: { type: String, default: undefined },
    imageFile: { type: Buffer, default: undefined },
    reportDate: { type: String, default: Date.now.toString() },
    claimRequest: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "ClaimRequest",
      default: null,
    },
    escalationReason: { type: String },
  },
  { timestamps: true }
);

documentSchema.index({ description: "text", location: "text" });

module.exports = mongoose.model("DocumentReport", documentSchema);
