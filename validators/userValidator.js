const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  avatarUrl: Joi.string().uri().optional(),
  role: Joi.string()
    .valid("reporter", "finder", "rc_staff", "police", "admin")
    .required(),
  status: Joi.string().valid("active", "suspended", "archived").optional(),
  credibilityScore: Joi.number().min(0).max(100).optional(),
  phoneNumber: Joi.string().optional(),
  preferedContactMethod: Joi.string().valid("email", "phone").optional(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(1).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  avatarUrl: Joi.string().uri().optional(),
  role: Joi.string()
    .valid("reporter", "finder", "rc_staff", "police", "admin")
    .optional(),
  status: Joi.string().valid("active", "suspended", "archived").optional(),
  credibilityScore: Joi.number().min(0).max(100).optional(),
  phoneNumber: Joi.string().optional(),
  preferedContactMethod: Joi.string().valid("email", "phone").optional(),
});

function validateCreateUser(req, res, next) {
  const { error } = createUserSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }
  next();
}

function validateUpdateUser(req, res, next) {
  const { error } = updateUserSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }
  next();
}

module.exports = {
  validateCreateUser,
  validateUpdateUser,
};
