const mongoose = require("mongoose");

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: { type: String, default: undefined },
    imageFile: { type: Buffer, default: undefined },
    reportDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

documentSchema.index({ description: "text", location: "text" });

module.exports = mongoose.model("DocumentReport", documentSchema);
