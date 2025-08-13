const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database errors
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      message: 'A record with this identifier already exists'
    });
  }

  if (err.code === '23503') { // Foreign key constraint violation
    return res.status(400).json({
      success: false,
      error: 'Invalid reference',
      message: 'Referenced record does not exist'
    });
  }

  if (err.code === '22P02') { // Invalid input syntax
    return res.status(400).json({
      success: false,
      error: 'Invalid data format',
      message: 'Please check your input data format'
    });
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File too large',
      message: 'File size exceeds the maximum allowed limit'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Invalid file',
      message: 'Unexpected file field or too many files'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

module.exports = { errorHandler, notFound };