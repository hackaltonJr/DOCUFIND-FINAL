const express = require("express");
const multer = require("multer");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const validateObjectId = require("../middleware/validateObjectId");
const documentValidator = require("../validators/documentValidator");
const documentController = require("../controllers/documentController");

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Optional file validation middleware
function validateImageFile(req, res, next) {
  if (req.file) {
    const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ message: "File too large (max 5MB)" });
    }
  }
  next();
}

// Routes

// GET all documents
router.get("/", asyncHandler(documentController.getDocuments));

// CREATE document
router.post(
  "/",
  upload.single("imageFile"), // handle file upload
  documentValidator.validateCreateDocument, // Joi validation for body
  validateImageFile, // optional file validation
  asyncHandler(documentController.createDocument) // controller
);

// GET single document by ID
router.get(
  "/:id",
  validateObjectId,
  asyncHandler(documentController.getDocumentById)
);

// CLAIM document (creates a pending claim request)
router.post(
  "/:id/claim",
  validateObjectId,
  asyncHandler(documentController.claimDocument)
);

// LIST claim requests for a document
router.get(
  "/:id/claims",
  validateObjectId,
  asyncHandler(documentController.getClaimsForDocument)
);

// APPROVE a claim request (admin)
router.put(
  "/:id/claims/:claimId/approve",
  validateObjectId,
  asyncHandler(documentController.approveClaim)
);

// REJECT a claim request (admin)
router.put(
  "/:id/claims/:claimId/reject",
  validateObjectId,
  asyncHandler(documentController.rejectClaim)
);

// UPDATE document
router.put(
  "/:id",
  validateObjectId,
  upload.single("imageFile"), // allow updating file
  documentValidator.validateUpdateDocument, // Joi validation
  validateImageFile, // optional file check
  asyncHandler(documentController.updateDocument)
);

// DELETE document
router.delete(
  "/:id",
  validateObjectId,
  asyncHandler(documentController.deleteDocument)
);

module.exports = router;
