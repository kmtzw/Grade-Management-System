const router    = require('express').Router();
const auth      = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const ctrl      = require('./lecturers.controller');

router.use(auth);

// All authenticated users can list lecturers
// (needed for the course creation dropdown)
router.get('/',      ctrl.getAll);
router.get('/:id',   ctrl.getById);
router.put('/:id',   authorize('admin'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;