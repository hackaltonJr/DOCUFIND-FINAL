const express = require("express");
const router = express.Router();

// router.use("/api", require("./routes/api"));
router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/documents", require("./documents"));
router.use("/feedback", require("./feedback"));
router.use("/enquiries", require("./enquiries"));
router.use("/notifications", require("./notifications"));
router.use("/handovers", require("./handovers"));
router.use("/reports", require("./reports"));

module.exports = router;
