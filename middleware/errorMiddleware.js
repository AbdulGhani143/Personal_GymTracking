const ApiError = require("../utils/ApiError");

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid resource identifier.",
    });
  }

  return res.status(statusCode).json({
    message: error.message || "Something went wrong.",
    ...(error.details ? { details: error.details } : {}),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
