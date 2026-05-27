// This is the LAST middleware registered in app.js.
// Express automatically sends errors here when you call next(err)
// or when an async function throws.
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(400).json({ message: 'Validation failed', errors: err.errors });
  }

  // PostgreSQL unique constraint violation (e.g. duplicate email)
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Record already exists' });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced record does not exist' });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;