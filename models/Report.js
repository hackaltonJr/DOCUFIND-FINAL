const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    documentType: { type: String, required: true },
    documentNumber: { type: String, required: true },
    holderName: { type: String, required: true },
    description: { type: String, required: true },
    lastSeenLocation: { type: String, required: true },
    dateLost: { type: Date, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    rcStaffMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

reportSchema.index({ type: 1, status: 1, dateLost: -1 });
reportSchema.index({ documentNumber: 1 });

module.exports = mongoose.model("Report", reportSchema);
