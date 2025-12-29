const express = require("express");
const router = express.Router();
const handoverRouter = require("./handovers");
const reportRouter = require("./reports");

router.use("/users", require("./users"));
router.use("/documents", require("./documents"));
router.use("/feedback", require("./feedback"));
router.use("/enquiries", require("./enquiries"));
router.use("/notifications", require("./notifications"));
router.use("/auth", require("./api/auth"));
router.use("/handovers", handoverRouter);
router.use("/reports", reportRouter);

module.exports = router;
