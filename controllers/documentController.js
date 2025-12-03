const DocumentReport = require("../models/DocumentReport");
const User = require("../models/User");

// CREATE document report
exports.createDocument = async (req, res, next) => {
  try {
    // Log for debugging
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const {
      documentType,
      description,
      location,
      dateLost,
      status,
      reportedBy,
      imageUrl,
    } = req.body;

    // Validate reporting user exists
    const reporter = await User.findById(reportedBy);
    if (!reporter) {
      return res.status(404).json({ error: "Reported user not found" });
    }

    const doc = new DocumentReport({
      documentType,
      description,
      location,
      dateLost: new Date(dateLost),
      status,
      reportedBy,
      imageFile: req.file ? req.file.buffer : undefined,
      imageUrl,
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// GET all documents with pagination + filters
exports.getDocuments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, documentType, startDate, endDate, q } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (documentType) filter.documentType = documentType;
    if (startDate || endDate) {
      filter.dateLost = {};
      if (startDate) filter.dateLost.$gte = new Date(startDate);
      if (endDate) filter.dateLost.$lte = new Date(endDate);
    }
    if (q) filter.$text = { $search: q };

    const total = await DocumentReport.countDocuments(filter);
    const docs = await DocumentReport.find(filter)
      .sort({ reportDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reportedBy", "name email role avatarUrl");

    res.json({
      data: docs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET single document
exports.getDocumentById = async (req, res, next) => {
  try {
    const doc = await DocumentReport.findById(req.params.id).populate(
      "reportedBy",
      "name email role avatarUrl"
    );
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

// UPDATE document
exports.updateDocument = async (req, res, next) => {
  try {
    const doc = await DocumentReport.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const allowedFields = [
      "documentType",
      "description",
      "dateLost",
      "location",
      "status",
      "imageUrl",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) doc[field] = req.body[field];
    });

    await doc.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

// DELETE document
exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await DocumentReport.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
