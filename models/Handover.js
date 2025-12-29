const mongoose = require("mongoose");

const handoverSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentReport",
      required: true,
    },
    claimantName: { type: String, required: true },
    rcStaffMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "completed",
    },
    handoverDate: { type: Date, required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

handoverSchema.index({ document: 1, handoverDate: -1 });

module.exports = mongoose.model("Handover", handoverSchema);
