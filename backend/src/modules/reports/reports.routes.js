const router    = require('express').Router();
const auth      = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const ctrl      = require('./reports.controller');

router.use(auth);

router.get('/stats',              authorize('admin'), ctrl.getStats);
router.get('/distribution',       authorize('admin', 'lecturer'), ctrl.getDistribution);
router.get('/departments',        authorize('admin'), ctrl.getDeptComparison);
router.get('/top-students',       authorize('admin'), ctrl.getTopStudents);
router.get('/lecturer/:lecturerId', authorize('admin', 'lecturer'), ctrl.getLecturerReport);

module.exports = router;