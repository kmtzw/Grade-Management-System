const { validationResult } = require('express-validator');
const authService = require('./auth.service');

// Controllers are thin — they handle HTTP concerns (request, response)
// and delegate all business logic to the service layer.

const login = async (req, res, next) => {
  try {
    // Check for validation errors from express-validator middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err) {
    next(err); // passes to errorHandler middleware
  }
};

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    // req.user.id comes from the auth middleware (decoded JWT)
    const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Returns the current user's profile (used by the frontend on page load)
const getMe = async (req, res, next) => {
  try {
    const { query } = require('../../config/db');
    const { rows } = await query(
      `SELECT u.id, u.email, u.role,
         COALESCE(s.first_name, l.first_name) AS first_name,
         COALESCE(s.last_name,  l.last_name)  AS last_name
       FROM users u
       LEFT JOIN students  s ON s.user_id = u.id
       LEFT JOIN lecturers l ON l.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, changePassword, getMe };