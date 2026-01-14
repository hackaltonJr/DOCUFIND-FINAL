const Joi = require("joi");

const createClaimSchema = Joi.object({
  userId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  claimantName: Joi.string().optional(),
  evidence: Joi.string().optional(),
  notes: Joi.string().optional(),
});

const updateClaimSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "approved", "rejected", "under_review")
    .optional(),
  evidence: Joi.string().optional(),
  notes: Joi.string().optional(),
});

function validateCreateClaim(req, res, next) {
  const { error } = createClaimSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }
  next();
}

function validateUpdateClaim(req, res, next) {
  const { error } = updateClaimSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }
  next();
}

module.exports = {
  validateCreateClaim,
  validateUpdateClaim,
};
