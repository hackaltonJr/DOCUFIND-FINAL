const Enquiry = require('../models/Enquiry');
const paginate = require('../utils/paginate');

exports.listEnquiries = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const total = await Enquiry.countDocuments(filter);
    const list = await Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    const totalPages = Math.ceil(total / limit);
    res.json({ data: list, meta: { page, limit, total, totalPages } });
  } catch (err) {
    next(err);
  }
};

exports.createEnquiry = async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message
    };

    const enq = new Enquiry(payload);
    await enq.save();
    res.status(201).json(enq);
  } catch (err) {
    next(err);
  }
};

exports.updateEnquiryStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const enq = await Enquiry.findById(id);
    if (!enq) {
      const err = new Error('Enquiry not found');
      err.status = 404;
      return next(err);
    }
    if (status) enq.status = status;
    await enq.save();
    res.json(enq);
  } catch (err) {
    next(err);
  }
};
