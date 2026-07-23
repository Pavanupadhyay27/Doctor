const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error Trace:', err);

  // Mongoose Bad ObjectID (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { message, statusCode: 404 };
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid authentication token.';
    error = { message, statusCode: 401 };
  }
  if (err.name === 'TokenExpiredError') {
    const message = 'Authentication token has expired.';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
