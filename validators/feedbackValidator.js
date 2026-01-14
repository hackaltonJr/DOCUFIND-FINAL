const Joi = require("joi");

const createFeedbackSchema = Joi.object({
  user: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  userName: Joi.string().optional(),
  subject: Joi.string().required(),
  message: Joi.string().required(),
  rating: Joi.number().min(1).max(5).optional(),
});

const updateFeedbackSchema = Joi.object({
  status: Joi.string().valid("open", "resolved").optional(),
  response: Joi.string().optional(),
  adminNotes: Joi.string().optional(),
});

function validateCreateFeedback(req, res, next) {
  const { error } = createFeedbackSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }
  next();
}

function validateUpdateFeedback(req, res, next) {
  const { error } = updateFeedbackSchema.validate(req.body, {
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
  validateCreateFeedback,
  validateUpdateFeedback,
};
