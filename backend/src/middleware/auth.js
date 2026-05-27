const jwt = require('jsonwebtoken');

// This middleware runs before any protected route handler.
// It reads the Authorization header, verifies the JWT,
// and attaches the decoded payload to req.user.
// If verification fails, it stops the request immediately.
module.exports = (req, res, next) => {
  // Header format: "Bearer eyJhbGci..."
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }

  try {
    // jwt.verify throws if the token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, profileId, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or has expired' });
  }
};