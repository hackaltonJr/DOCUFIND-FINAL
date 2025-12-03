const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "auth_token";

// ---- Helpers ----
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  if (!user) return null;
  const plain = user.toObject ? user.toObject() : user;
  delete plain.password;
  delete plain.__v;
  return plain;
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ---- Routes ----

// REGISTER
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({
        user: null,
        message: "Name, email, and password are required",
      });

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(409)
        .json({ user: null, message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "reporter",
    });

    const token = signToken({ id: user._id });
    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.status(201).json({
      user: sanitizeUser(user),
      message: "Registered successfully",
    });
  } catch (err) {
    next(err);
  }
});

// LOGIN
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ user: null, message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ user: null, message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res
        .status(401)
        .json({ user: null, message: "Invalid credentials" });

    const token = signToken({ id: user._id });
    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.json({
      user: sanitizeUser(user),
      token,
      message: "Login successful",
    });
  } catch (err) {
    next(err);
  }
});

// PROFILE
router.get("/profile", async (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token)
      return res.status(401).json({ user: null, message: "Not authenticated" });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res
        .status(401)
        .json({ user: null, message: "Invalid or expired token" });
    }

    const user = await User.findById(payload.id).select("-password").lean();
    if (!user)
      return res.status(404).json({ user: null, message: "User not found" });

    res.json({
      user,
      message: "Authenticated user fetched successfully",
    });
  } catch (err) {
    next(err);
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.json({ user: null, message: "Logged out successfully" });
});

module.exports = router;
