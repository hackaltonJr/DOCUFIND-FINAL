const Joi = require("joi");

const createDocumentSchema = Joi.object({
  documentType: Joi.string().required(),
  description: Joi.string().required(),
  dateLost: Joi.string().required(),
  reportDate: Joi.string().required(),
  location: Joi.string().required(),
  status: Joi.string().valid("lost", "found", "claimed").required(),
  reportedBy: Joi.string().required(),
  imageUrl: Joi.string().uri().optional(),
  imageFile: Joi.any().optional(),
  escalationReason: Joi.string().required(),
  claimRequest: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
    .optional(),
});

const updateDocumentSchema = Joi.object({
  documentType: Joi.string().optional(),
  description: Joi.string().optional(),
  dateLost: Joi.string().optional(),
  reportDate: Joi.string().optional(),
  location: Joi.string().optional(),
  status: Joi.string().valid("lost", "found", "claimed").optional(),
  imageUrl: Joi.string().uri().optional(),
  imageFile: Joi.any().optional(),
  escalationReason: Joi.string().optional(),
  claimRequest: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
    .optional(),
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
