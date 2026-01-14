const Joi = require("joi");

const createEnquirySchema = Joi.object({
  user: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  name: Joi.string().optional(),
  email: Joi.string().email().required(),
  subject: Joi.string().required(),
  question: Joi.string().required(),
});

const updateEnquirySchema = Joi.object({
  status: Joi.string().valid("open", "resolved").optional(),
  response: Joi.string().optional(),
});

function validateCreateEnquiry(req, res, next) {
  const { error } = createEnquirySchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }
  next();
}

function validateUpdateEnquiry(req, res, next) {
  const { error } = updateEnquirySchema.validate(req.body, {
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
  validateCreateEnquiry,
  validateUpdateEnquiry,
};
