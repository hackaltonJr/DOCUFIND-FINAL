const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const asyncHandler = require("../utils/asyncHandler");
const validateObjectId = require("../middleware/validateObjectId");
const Joi = require("joi");

function validateFeedbackBody(req, res, next) {
  const schema = Joi.object({
    user: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    subject: Joi.string().optional(),
    message: Joi.string().required(),
    rating: Joi.number().min(0).max(5).optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }
  next();
}

router.get("/", asyncHandler(feedbackController.listFeedback));
router.post(
  "/",
  validateFeedbackBody,
  asyncHandler(feedbackController.createFeedback)
);
router.put(
  "/:id/status",
  validateObjectId,
  asyncHandler(feedbackController.updateFeedbackStatus)
);

module.exports = router;
