const Report = require("../models/Report");
const asyncHandler = require("../utils/asyncHandler");

// GET all reports with filters
exports.getReports = asyncHandler(async (req, res) => {
  const { type, status, limit = 50, skip = 0 } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const reports = await Report.find(filter)
    .populate("rcStaffMember", "name email")
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ createdAt: -1 });

  const total = await Report.countDocuments(filter);

  res.json({
    data: reports,
    total,
    limit: parseInt(limit),
    skip: parseInt(skip),
  });
});

// CREATE a new report
exports.createReport = asyncHandler(async (req, res) => {
  const {
    type,
    documentType,
    documentNumber,
    holderName,
    description,
    lastSeenLocation,
    dateLost,
    contactEmail,
    contactPhone,
  } = req.body;

  // Validate required fields
  if (
    !type ||
    !documentType ||
    !documentNumber ||
    !holderName ||
    !description ||
    !lastSeenLocation ||
    !dateLost ||
    !contactEmail ||
    !contactPhone
  ) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  // Validate type
  if (!["lost", "found"].includes(type)) {
    return res.status(400).json({
      error: "Type must be either 'lost' or 'found'",
    });
  }

  const report = new Report({
    type,
    documentType,
    documentNumber,
    holderName,
    description,
    lastSeenLocation,
    dateLost: new Date(dateLost),
    contactEmail,
    contactPhone,
    rcStaffMember: req.user ? req.user._id : null,
    status: "pending",
  });

  await report.save();
  await report.populate("rcStaffMember", "name email");

  res.status(201).json({
    message: "Report created successfully",
    data: report,
  });
});

// GET single report by ID
exports.getReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await Report.findById(id).populate(
    "rcStaffMember",
    "name email"
  );

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  res.json(report);
});

// UPDATE a report
exports.updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Don't allow changing type or documentNumber
  delete updateData.type;
  delete updateData.documentNumber;

  const report = await Report.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("rcStaffMember", "name email");

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  res.json({
    message: "Report updated successfully",
    data: report,
  });
});

// DELETE a report
exports.deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await Report.findByIdAndDelete(id);

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  res.json({ message: "Report deleted successfully", id });
});

// GET report stats
exports.getReportStats = asyncHandler(async (req, res) => {
  const lostCount = await Report.countDocuments({ type: "lost" });
  const foundCount = await Report.countDocuments({ type: "found" });
  const resolvedCount = await Report.countDocuments({ status: "resolved" });
  const pendingCount = await Report.countDocuments({ status: "pending" });

  res.json({
    lost: lostCount,
    found: foundCount,
    resolved: resolvedCount,
    pending: pendingCount,
  });
});
