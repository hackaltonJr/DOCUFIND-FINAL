const Joi = require("joi");

const createReportSchema = Joi.object({
  type: Joi.string().valid("lost", "found").required(),
  documentType: Joi.string().required(),
  documentNumber: Joi.string().required(),
  holderName: Joi.string().required(),
  description: Joi.string().required(),
  lastSeenLocation: Joi.string().required(),
  dateLost: Joi.date().required(),
  contactEmail: Joi.string().email().required(),
  contactPhone: Joi.string().required(),
});

const updateReportSchema = Joi.object({
  documentType: Joi.string().optional(),
  holderName: Joi.string().optional(),
  description: Joi.string().optional(),
  lastSeenLocation: Joi.string().optional(),
  dateLost: Joi.date().optional(),
  contactEmail: Joi.string().email().optional(),
  contactPhone: Joi.string().optional(),
  status: Joi.string().valid("pending", "resolved").optional(),
});

function validateCreateReport(req, res, next) {
  const { error } = createReportSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }
  next();
}

function validateUpdateReport(req, res, next) {
  const { error } = updateReportSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }
  next();
}

module.exports = {
  validateCreateReport,
  validateUpdateReport,
};
