const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_secret";

router.get("/", async (req, res) => {
  try {
    let Notification;
    try {
      Notification = require("../../models/Notification");
    } catch (err) {
      return res.json([]);
    }

    // look for token in Authorization header OR cookie (httpOnly cookie named "token")
    const authHeader = req.header("Authorization") || "";
    let token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    // req.cookies is populated by cookie-parser in server.js
    if (!token && req.cookies) {
      token = req.cookies.token || null;
    }

    let user = null;
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        const User = require("../../models/User");
        user = await User.findById(payload.id).lean().select("-password");
      } catch (err) {
        // when the token is invalid, treat as anonymous
        user = null;
      }
    }

    const baseQuery = {};
    if (user) {
      const role = user.role || null;
      baseQuery.$or = [
        { audience: "all" },
        ...(role ? [{ audience: role }] : []),
        { user: user._id },
      ];
    } else {
      baseQuery.$or = [
        { audience: "all" },
        { audience: { $exists: false } },
        { audience: null },
      ];
    }

    const items = await Notification.find(baseQuery)
      .sort({ createdAt: -1 })
      .lean();
    res.json(items);
  } catch (err) {
    console.error("notifications error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
