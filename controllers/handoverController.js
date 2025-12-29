const Handover = require("../models/Handover");
const asyncHandler = require("../utils/asyncHandler");

// GET all handovers
exports.getHandovers = asyncHandler(async (req, res) => {
  const { status, documentId, limit = 50, skip = 0 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (documentId) filter.document = documentId;

  const handovers = await Handover.find(filter)
    .populate("document")
    .populate("rcStaffMember", "name email")
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ handoverDate: -1 });

  res.json(handovers);
});

// POST create handover
exports.createHandover = asyncHandler(async (req, res) => {
  const { documentId, claimantName, handoverDate, notes } = req.body;

  if (!documentId || !claimantName || !handoverDate) {
    return res.status(400).json({
      error: "Missing required fields: documentId, claimantName, handoverDate",
    });
  }

  const handover = new Handover({
    document: documentId,
    claimantName,
    handoverDate: new Date(handoverDate),
    notes: notes || "",
    status: "completed",
    rcStaffMember: req.user ? req.user._id : null,
  });

  await handover.save();

  await handover.populate([
    { path: "document" },
    { path: "rcStaffMember", select: "name email" },
  ]);

  res.status(201).json(handover);
});

// GET single handover
exports.getHandoverById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const handover = await Handover.findById(id)
    .populate("document")
    .populate("rcStaffMember", "name email");

  if (!handover) {
    return res.status(404).json({ error: "Handover not found" });
  }

  res.json(handover);
});

// PUT update handover
exports.updateHandover = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  delete updateData.document;

  const handover = await Handover.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "document" },
    { path: "rcStaffMember", select: "name email" },
  ]);

  if (!handover) {
    return res.status(404).json({ error: "Handover not found" });
  }

  res.json(handover);
});

// DELETE handover
exports.deleteHandover = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const handover = await Handover.findByIdAndDelete(id);

  if (!handover) {
    return res.status(404).json({ error: "Handover not found" });
  }

  res.json({ message: "Handover deleted successfully", id });
});
