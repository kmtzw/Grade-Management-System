const router    = require('express').Router();
const auth      = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const ctrl      = require('./courses.controller');

router.use(auth);

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/',   authorize('admin'), ctrl.create);
router.put('/:id', authorize('admin'), ctrl.update);

// Students can enroll themselves — the controller handles
// who the studentId is based on role
router.post('/:id/enroll', ctrl.enroll);
router.post('/:id/drop',   ctrl.drop);

module.exports = router;