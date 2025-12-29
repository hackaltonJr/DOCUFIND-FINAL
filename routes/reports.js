const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const validateObjectId = require("../middleware/validateObjectId");

// GET all reports with filters
router.get("/", reportController.getReports);

// GET report stats
router.get("/stats", reportController.getReportStats);

// CREATE new report
router.post("/", reportController.createReport);

// GET single report
router.get("/:id", validateObjectId, reportController.getReportById);

// UPDATE report
router.put("/:id", validateObjectId, reportController.updateReport);

// DELETE report
router.delete("/:id", validateObjectId, reportController.deleteReport);

module.exports = router;
