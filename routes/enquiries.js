const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const asyncHandler = require('../utils/asyncHandler');
const validateObjectId = require('../middleware/validateObjectId');
const Joi = require('joi');

function validateCreateEnquiry(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    subject: Joi.string().required(),
    message: Joi.string().required()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
  next();
}

router.get('/', asyncHandler(enquiryController.listEnquiries));
router.post('/', validateCreateEnquiry, asyncHandler(enquiryController.createEnquiry));
router.put('/:id/status', validateObjectId, asyncHandler(enquiryController.updateEnquiryStatus));

module.exports = router;
