const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const paginate = require("../utils/paginate");

function sanitizeUserObj(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  if (obj._id) obj.id = String(obj._id);
  delete obj.__v;
  if (obj.createdAt instanceof Date)
    obj.createdAt = obj.createdAt.toISOString();
  if (obj.updatedAt instanceof Date)
    obj.updatedAt = obj.updatedAt.toISOString();
  return obj;
}

function sanitizeLog(log) {
  if (!log) return null;
  const obj = log.toObject ? log.toObject() : { ...log };
  if (obj._id) obj.id = String(obj._id);
  delete obj.__v;
  if (obj.createdAt instanceof Date)
    obj.createdAt = obj.createdAt.toISOString();
  return obj;
}

exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const { role, status, q } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const sanitized = users.map((u) => {
      if (u._id) u.id = String(u._id);
      if (
        u.createdAt &&
        u.createdAt instanceof Date === false &&
        typeof u.createdAt === "string"
      ) {
      } else if (u.createdAt instanceof Date) {
        u.createdAt = u.createdAt.toISOString();
      }
      if (u.updatedAt instanceof Date) u.updatedAt = u.updatedAt.toISOString();
      if (u.password) delete u.password;
      delete u.__v;
      return u;
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: sanitized,
      meta: { page, limit, total, totalPages },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id) user.id = String(user._id);
    if (user.createdAt instanceof Date)
      user.createdAt = user.createdAt.toISOString();
    if (user.updatedAt instanceof Date)
      user.updatedAt = user.updatedAt.toISOString();
    delete user.__v;

    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      email: req.body.email,
      avatarUrl: req.body.avatarUrl,
      role: req.body.role,
      status: req.body.status,
      preferedContactMethod: req.body.preferedContactMethod,
      credibilityScore: req.body.credibilityScore,
      phoneNumber: req.body.phoneNumber,
    };

    const existing = await User.findOne({ email: payload.email.toLowerCase() });
    if (existing) {
      const err = new Error("Email already exists");
      err.status = 409;
      return next(err);
    }

    const user = new User(payload);
    await user.save();

    const uObj = user.toObject();
    if (uObj._id) uObj.id = String(uObj._id);
    if (uObj.createdAt instanceof Date)
      uObj.createdAt = uObj.createdAt.toISOString();
    if (uObj.updatedAt instanceof Date)
      uObj.updatedAt = uObj.updatedAt.toISOString();
    delete uObj.password;
    delete uObj.__v;

    res.status(201).json(uObj);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }

    const allowed = [
      "name",
      "email",
      "avatarUrl",
      "role",
      "status",
      "phoneNumber",
      "preferedContactMethod",
      "credibilityScore", // this is mock and manual. I would read a little bit about how to automate credibility score based on activities
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();

    const uObj = user.toObject();
    if (uObj._id) uObj.id = String(uObj._id);
    if (uObj.createdAt instanceof Date)
      uObj.createdAt = uObj.createdAt.toISOString();
    if (uObj.updatedAt instanceof Date)
      uObj.updatedAt = uObj.updatedAt.toISOString();
    delete uObj.password;
    delete uObj.__v;

    res.json(uObj);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }

    user.status = "archived";
    await user.save();
    res.json({ message: "User archived" });
  } catch (err) {
    next(err);
  }
};

exports.getUserActivity = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const logs = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const sanitized = logs.map((l) => {
      if (l._id) l.id = String(l._id);
      if (l.createdAt instanceof Date) l.createdAt = l.createdAt.toISOString();
      delete l.__v;
      return l;
    });

    res.json(sanitized);
  } catch (err) {
    next(err);
  }
};
