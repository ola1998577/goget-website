const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(400).json({ error: 'Duplicate entry. This record already exists.' });
      case 'P2025':
        return res.status(404).json({ error: 'Record not found.' });
      default:
        return res.status(500).json({ error: 'Database error occurred.' });
    }
  }

  // Validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details.map(d => d.message)
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
