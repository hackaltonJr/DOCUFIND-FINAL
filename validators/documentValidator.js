const Joi = require("joi");

const createDocumentSchema = Joi.object({
  documentType: Joi.string().required(),
  description: Joi.string().optional(),
  dateLost: Joi.date().optional(),
  dateFound: Joi.date().optional(),
  location: Joi.string().optional(),
  whereFound: Joi.string().optional(),
  lastSeenLocation: Joi.string().optional(),
  status: Joi.string()
    .valid("lost", "found", "claimed", "verified", "handed_over")
    .required(),
  reportedBy: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  reporterName: Joi.string().optional(),
  imageUrl: Joi.string().uri().optional(),
  imageFile: Joi.any().optional(),
  holderName: Joi.string().optional(),
  documentNumber: Joi.string().optional(),
  contactPhone: Joi.string().optional(),
  contactEmail: Joi.string().email().optional(),
  reportDate: Joi.date().optional(),
});

const updateDocumentSchema = Joi.object({
  documentType: Joi.string().optional(),
  description: Joi.string().optional(),
  dateLost: Joi.date().optional(),
  dateFound: Joi.date().optional(),
  location: Joi.string().optional(),
  whereFound: Joi.string().optional(),
  lastSeenLocation: Joi.string().optional(),
  status: Joi.string()
    .valid("lost", "found", "claimed", "verified", "handed_over")
    .optional(),
  reporterName: Joi.string().optional(),
  imageUrl: Joi.string().uri().optional(),
  imageFile: Joi.any().optional(),
  holderName: Joi.string().optional(),
  documentNumber: Joi.string().optional(),
  contactPhone: Joi.string().optional(),
  contactEmail: Joi.string().email().optional(),
  isClaimed: Joi.boolean().optional(),
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
