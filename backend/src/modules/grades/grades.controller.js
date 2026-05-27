const service = require('./grades.service');
const { validationResult } = require('express-validator');

const submit = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const result = await service.submitGrade({ ...req.body, gradedBy: req.user.id });
    res.status(201).json(result);
  } catch (e) { next(e); }
};

const bulkSubmit = async (req, res, next) => {
  try {
    const result = await service.bulkSubmitGrades(req.body.grades, req.user.id);
    res.status(201).json(result);
  } catch (e) { next(e); }
};

const getTranscript = async (req, res, next) => {
  try {
    // A student can only view their own transcript.
    // A lecturer or admin can view anyone's.
    const studentId = req.params.studentId;
    if (req.user.role === 'student' && req.user.profileId !== studentId) {
      return res.status(403).json({ message: 'You can only view your own transcript' });
    }
    res.json(await service.getStudentTranscript(studentId));
  } catch (e) { next(e); }
};

const getCourseGrades = async (req, res, next) => {
  try { res.json(await service.getCourseGrades(req.params.courseId)); }
  catch (e) { next(e); }
};

module.exports = { submit, bulkSubmit, getTranscript, getCourseGrades };