const DocumentReport = require("../models/DocumentReport");
const User = require("../models/User");
const Notification = require("../models/Notification");

// helper to create a notification
async function createClaimNotification({ userId, doc, claim, status }) {
  const title =
    status === "approved"
      ? "Claim approved"
      : status === "rejected"
      ? "Claim rejected"
      : "Claim update";
  const message =
    status === "approved"
      ? `Your claim for "${doc.documentType}" has been approved.`
      : `Your claim for "${doc.documentType}" has been rejected.`;

  return Notification.create({
    user: userId,
    title,
    message,
    metadata: {
      documentId: doc._id,
      claimId: claim._id,
      status,
      documentType: doc.documentType,
    },
  });
}

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

// CLAIM document (create embedded claim)
exports.claimDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, notes } = req.body;

    if (!userId) return res.status(400).json({ error: "userId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const doc = await DocumentReport.findById(id);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    if (doc.status !== "found")
      return res
        .status(400)
        .json({ error: "Document not available for claiming" });

    // Check for duplicate pending claim
    const existingPending = doc.claims.find(
      (c) => String(c.claimant) === String(userId) && c.status === "pending"
    );
    if (existingPending)
      return res
        .status(400)
        .json({ error: "You already have a pending claim for this document" });

    doc.claims.push({ claimant: userId, notes, status: "pending" });
    await doc.save();
    await doc.populate("claims.claimant", "name email");

    res
      .status(201)
      .json({
        message: "Claim request submitted",
        data: doc.claims[doc.claims.length - 1],
      });
  } catch (err) {
    next(err);
  }
};

// List claim requests for a document
exports.getClaimsForDocument = async (req, res, next) => {
  try {
    const doc = await DocumentReport.findById(req.params.id).populate(
      "claims.claimant",
      "name email avatarUrl"
    );
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc.claims);
  } catch (err) {
    next(err);
  }
};

// Approve a claim request (admin)
// NOTE: Add your auth/role middleware to restrict this endpoint to admins.
exports.approveClaim = async (req, res, next) => {
  try {
    const { id, claimId } = req.params;

    const doc = await DocumentReport.findById(id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const claim = doc.claims.id(claimId);
    if (!claim) return res.status(404).json({ error: "Claim not found" });
    if (claim.status !== "pending")
      return res
        .status(400)
        .json({ error: "Only pending claims can be approved" });
    if (doc.status === "claimed")
      return res.status(400).json({ error: "Document already claimed" });

    claim.status = "approved";
    claim.updatedAt = new Date();
    doc.status = "claimed";
    doc.claimedBy = claim.claimant;
    doc.claimedAt = new Date();
    await doc.save();

    await createClaimNotification({
      userId: claim.claimant,
      doc,
      claim,
      status: "approved",
    });
    await doc.populate("claims.claimant", "name email");

    res.json({ message: "Claim approved", data: { claim, document: doc } });
  } catch (err) {
    next(err);
  }
};

// Reject a claim request (admin)
exports.rejectClaim = async (req, res, next) => {
  try {
    const { id, claimId } = req.params;

    const doc = await DocumentReport.findById(id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const claim = doc.claims.id(claimId);
    if (!claim) return res.status(404).json({ error: "Claim not found" });
    if (claim.status !== "pending")
      return res
        .status(400)
        .json({ error: "Only pending claims can be rejected" });

    claim.status = "rejected";
    claim.updatedAt = new Date();
    await doc.save();

    await createClaimNotification({
      userId: claim.claimant,
      doc,
      claim,
      status: "rejected",
    });
    await doc.populate("claims.claimant", "name email");

    res.json({ message: "Claim rejected", data: claim });
  } catch (err) {
    next(err);
  }
};

// ADMIN: update document report status (found/lost)
// - only admin can update status to "found"
// - only admin can update status to "lost" if there are no claims or all claims are rejected
exports.updateDocumentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || (status !== "found" && status !== "lost")) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const doc = await DocumentReport.findById(id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Check if trying to set status to "lost" while there are pending/approved claims
    if (status === "lost") {
      const hasActiveClaims = doc.claims.some((c) => c.status !== "rejected");
      if (hasActiveClaims) {
        return res
          .status(400)
          .json({
            error: "Cannot set status to 'lost' while there are active claims",
          });
      }
    }

    doc.status = status;
    await doc.save();

    res.json({ message: `Document status updated to ${status}`, data: doc });
  } catch (err) {
    next(err);
  }
};

// ADMIN: update document report (all fields)
// - only admin can update document reports
exports.updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updates = req.body;
    if (updates.dateLost) updates.dateLost = new Date(updates.dateLost);

    const doc = await DocumentReport.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    res.json({ message: "Document updated", data: doc });
  } catch (err) {
    next(err);
  }
};

// ADMIN: delete document report
// - only admin can delete document reports
exports.deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doc = await DocumentReport.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    res.json({ message: "Document deleted" });
  } catch (err) {
    next(err);
  }
};
