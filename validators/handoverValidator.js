const Joi = require("joi");

const createHandoverSchema = Joi.object({
  documentId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  claimantName: Joi.string().required(),
  handoverDate: Joi.date().required(),
  notes: Joi.string().optional(),
});

const updateHandoverSchema = Joi.object({
  status: Joi.string().valid("pending", "completed").optional(),
  handoverDate: Joi.date().optional(),
  notes: Joi.string().optional(),
});

function validateCreateHandover(req, res, next) {
  const { error } = createHandoverSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }
  next();
}

function validateUpdateHandover(req, res, next) {
  const { error } = updateHandoverSchema.validate(req.body, {
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
  validateCreateHandover,
  validateUpdateHandover,
};
