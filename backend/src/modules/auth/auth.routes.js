const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('./auth.controller');
const auth = require('../../middleware/auth');

// Validation rules are defined inline as middleware arrays.
// If any rule fails, the controller reads the errors via validationResult().

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], ctrl.login);

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['admin', 'lecturer', 'student']),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('department').trim().notEmpty(),
], ctrl.register);

// These routes require a valid JWT (auth middleware runs first)
router.get('/me', auth, ctrl.getMe);
router.put('/change-password', auth, [
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
], ctrl.changePassword);

module.exports = router;