const DocumentReport = require("../models/DocumentReport");
const User = require("../models/User");
const ClaimRequest = require("../models/ClaimRequest");

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

// CLAIM document (create a pending claim request)
exports.claimDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, notes } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "User ID is required to request a claim" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const doc = await DocumentReport.findById(id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (doc.status !== "found") {
      return res
        .status(400)
        .json({ error: "Only 'found' documents can be requested for claim" });
    }

    // Prevent duplicate pending request by same user for same document
    const existingPending = await ClaimRequest.findOne({
      document: id,
      claimant: userId,
      status: "pending",
    });
    if (existingPending) {
      return res
        .status(409)
        .json({ error: "A pending claim already exists for this document" });
    }

    const claim = await ClaimRequest.create({
      document: id,
      claimant: userId,
      status: "pending",
      notes,
    });

    await claim.populate("claimant", "name email");
    res.status(201).json({
      message: "Claim request submitted. Awaiting admin approval.",
      data: claim,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// List claim requests for a document
exports.getClaimsForDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await DocumentReport.findById(id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const claims = await ClaimRequest.find({ document: id })
      .sort({ createdAt: -1 })
      .populate("claimant", "name email");
    res.json({ data: claims });
  } catch (err) {
    next(err);
  }
};

// Approve a claim request (admin)
// NOTE: Add your auth/role middleware to restrict this endpoint to admins.
exports.approveClaim = async (req, res, next) => {
  try {
    const { id, claimId } = req.params;

    const claim = await ClaimRequest.findById(claimId);
    if (!claim || String(claim.document) !== String(id)) {
      return res.status(404).json({ error: "Claim request not found" });
    }
    if (claim.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending claims can be approved" });
    }

    const doc = await DocumentReport.findById(id);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    if (doc.status === "claimed") {
      return res.status(400).json({ error: "Document already claimed" });
    }

    // Approve claim and mark document as claimed
    claim.status = "approved";
    await claim.save();

    doc.status = "claimed";
    doc.claimedBy = claim.claimant;
    doc.claimedAt = new Date();
    await doc.save();

    await claim.populate("claimant", "name email");
    res.json({
      message: "Claim approved and document marked as claimed",
      data: { claim, document: doc },
    });
  } catch (err) {
    next(err);
  }
};

// Reject a claim request (admin)
exports.rejectClaim = async (req, res, next) => {
  try {
    const { id, claimId } = req.params;

    const claim = await ClaimRequest.findById(claimId);
    if (!claim || String(claim.document) !== String(id)) {
      return res.status(404).json({ error: "Claim request not found" });
    }
    if (claim.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending claims can be rejected" });
    }

    claim.status = "rejected";
    await claim.save();

    await claim.populate("claimant", "name email");
    res.json({
      message: "Claim rejected",
      data: claim,
    });
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
