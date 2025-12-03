const Joi = require("joi");

const createDocumentSchema = Joi.object({
  documentType: Joi.string().required(),
  description: Joi.string().required(),
  dateLost: Joi.date().required(),
  location: Joi.string().required(),
  status: Joi.string().valid("lost", "found", "claimed").required(),
  reportedBy: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  imageUrl: Joi.string().uri().optional(),
  imageFile: Joi.any().optional(),
});

const updateDocumentSchema = Joi.object({
  documentType: Joi.string().optional(),
  description: Joi.string().optional(),
  dateLost: Joi.date().optional(),
  location: Joi.string().optional(),
  status: Joi.string().valid("lost", "found", "claimed").optional(),
  imageUrl: Joi.string().uri().optional(),
  imageFile: Joi.any().optional(),
});

function validateCreateDocument(req, res, next) {
  const { error } = createDocumentSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }
  next();
}

function validateUpdateDocument(req, res, next) {
  const { error } = updateDocumentSchema.validate(req.body, {
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
  validateCreateDocument,
  validateUpdateDocument,
};
