// This middleware is used AFTER the auth middleware.
// It checks that the logged-in user has one of the required roles.
//
// Usage in a route file:
//   router.post('/grades', auth, authorize('admin', 'lecturer'), ctrl.submit)
//
// authorize() returns a middleware function. The ...roles syntax
// means you can pass one or many roles as arguments.
module.exports = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(', ')}`
      });
    }
    next();
  };
};