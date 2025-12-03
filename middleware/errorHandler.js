module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  if (process.env.NODE_ENV === "production") {
    return res.status(500).json({ message: "Internal server error" });
  }

  if (!err) return next();

  // Mongoose validation error... Make it more advanced and better after midterm stress
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ message: "Validation Error", errors: messages });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID" });
  }

  if (err.code && err.code === 11000) {
    const keys = Object.keys(err.keyValue || {});
    return res
      .status(409)
      .json({ message: "Duplicate key error", fields: keys });
  }

  res
    .status(err.status || 500)
    .json({ message: err.message, stack: err.stack });
};
