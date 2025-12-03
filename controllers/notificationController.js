const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");

// I got stuck here, need to finish later. gives me a real headache. don't any part of my code without my permission please

exports.getNotificationsForUser = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.query.userId;
    if (!userId) {
      const err = new Error("userId is required");
      err.status = 400;
      return next(err);
    }
    const list = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const id = req.params.id;
    const notification = await Notification.findById(id);
    if (!notification) {
      const err = new Error("Notification not found");
      err.status = 404;
      return next(err);
    }
    notification.isRead = true;
    await notification.save();

    const log = new ActivityLog({
      user: notification.user,
      action: "notification_read",
      meta: { notificationId: id },
      ip: req.ip,
    });
    await log.save();

    res.json(notification);
  } catch (err) {
    next(err);
  }
};

exports.markAllReadForUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      const err = new Error("userId is required");
      err.status = 400;
      return next(err);
    }
    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );
    const modified = result.modifiedCount || result.nModified || 0;

    const log = new ActivityLog({
      user: userId,
      action: "notifications_mark_all_read",
      meta: { count: modified },
      ip: req.ip,
    });
    await log.save();

    res.json({ modifiedCount: modified });
  } catch (err) {
    next(err);
  }
};
