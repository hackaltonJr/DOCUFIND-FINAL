const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validateObjectId = require("../middleware/validateObjectId");
const userValidator = require("../validators/userValidator");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", asyncHandler(userController.getUsers));
router.post(
  "/",
  userValidator.validateCreateUser,
  asyncHandler(userController.createUser)
);
router.get("/:id", validateObjectId, asyncHandler(userController.getUserById));
router.put(
  "/:id",
  validateObjectId,
  userValidator.validateUpdateUser,
  asyncHandler(userController.updateUser)
);
router.delete(
  "/:id",
  validateObjectId,
  asyncHandler(userController.deleteUser)
);
router.get(
  "/:id/activity",
  validateObjectId,
  asyncHandler(userController.getUserActivity)
);

module.exports = router;
