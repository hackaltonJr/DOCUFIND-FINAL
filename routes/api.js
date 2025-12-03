const express = require("express");
const router = express.Router();

router.use("/users", require("./users"));
router.use("/documents", require("./documents"));
router.use("/feedback", require("./feedback"));
router.use("/enquiries", require("./enquiries"));
router.use("/notifications", require("./notifications"));
router.use("/auth", require("./api/auth"));

module.exports = router;
