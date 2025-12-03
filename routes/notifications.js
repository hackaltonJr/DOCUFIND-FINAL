const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const asyncHandler = require('../utils/asyncHandler');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/user/:userId', validateObjectId, asyncHandler(notificationController.getNotificationsForUser));
router.put('/:id/read', validateObjectId, asyncHandler(notificationController.markNotificationRead));
router.put('/user/:userId/read-all', validateObjectId, asyncHandler(notificationController.markAllReadForUser));

module.exports = router;
