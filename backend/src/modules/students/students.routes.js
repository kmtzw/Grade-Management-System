const router    = require('express').Router();
const auth      = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const ctrl      = require('./students.controller');

router.use(auth); // all routes require login

// Students can search the list (needed for transcript lookup)
// but the service only returns meaningful results when used correctly
router.get('/',     ctrl.getAll);

// Any logged-in user can view a student profile
// (the transcript page needs this)
router.get('/:id',  ctrl.getById);

// Only admins can modify or delete
router.put('/:id',  authorize('admin'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;