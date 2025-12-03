const mongoose = require('mongoose');

module.exports = function validateObjectId(req, res, next) {
  const paramsToCheck = ['id', 'userId'];
  for (const param of paramsToCheck) {
    if (req.params && req.params[param]) {
      const value = req.params[param];
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({ message: `Invalid id for param ${param}` });
      }
    }
  }
  next();
};
