const router    = require('express').Router();
const { body }  = require('express-validator');
const auth      = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const ctrl      = require('./grades.controller');

router.use(auth);

const scoreValidation = [
  body('assignmentScore').isFloat({ min: 0, max: 100 }).withMessage('Assignment score must be 0–100'),
  body('midtermScore').isFloat({ min: 0, max: 100 }).withMessage('Midterm score must be 0–100'),
  body('finalScore').isFloat({ min: 0, max: 100 }).withMessage('Final score must be 0–100'),
];

router.post('/',         authorize('admin','lecturer'), scoreValidation, ctrl.submit);
router.post('/bulk',     authorize('admin','lecturer'), ctrl.bulkSubmit);
router.get('/course/:courseId',   authorize('admin','lecturer'), ctrl.getCourseGrades);
router.get('/student/:studentId', ctrl.getTranscript);

module.exports = router;