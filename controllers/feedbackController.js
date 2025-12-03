// I have not completed the code in the middle. I would do it before the second presentation

const Feedback = require("../models/Feedback");
const paginate = require("../utils/paginate");

exports.listFeedback = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const total = await Feedback.countDocuments(filter);
    const list = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);
    res.json({ data: list, meta: { page, limit, total, totalPages } });
  } catch (err) {
    next(err);
  }
};

exports.createFeedback = async (req, res, next) => {
  try {
    const payload = {
      user: req.body.user,
      message: req.body.message,
      rating: req.body.rating,
    };

    const feedback = new Feedback(payload);
    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    next(err);
  }
};

exports.updateFeedbackStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      const err = new Error("Feedback not found");
      err.status = 404;
      return next(err);
    }
    if (status) feedback.status = status;
    await feedback.save();
    res.json(feedback);
  } catch (err) {
    next(err);
  }
};
