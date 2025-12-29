const express = require("express");
const router = express.Router();
const handoverController = require("../controllers/handoverController");
const validateObjectId = require("../middleware/validateObjectId");

// GET all handovers
router.get("/", handoverController.getHandovers);

// CREATE new handover (no auth required)
router.post("/", handoverController.createHandover);

// GET single handover
router.get("/:id", validateObjectId, handoverController.getHandoverById);

// UPDATE handover (no auth required)
router.put("/:id", validateObjectId, handoverController.updateHandover);

// DELETE handover (no auth required)
router.delete("/:id", validateObjectId, handoverController.deleteHandover);

module.exports = router;
