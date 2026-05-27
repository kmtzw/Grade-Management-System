const service = require('./courses.service');

const getAll   = async (req, res, next) => {
  try { res.json(await service.getAllCourses(req.query)); } catch (e) { next(e); }
};
const getById  = async (req, res, next) => {
  try { res.json(await service.getCourseById(req.params.id)); } catch (e) { next(e); }
};
const create   = async (req, res, next) => {
  try { res.status(201).json(await service.createCourse(req.body)); } catch (e) { next(e); }
};
const update   = async (req, res, next) => {
  try { res.json(await service.updateCourse(req.params.id, req.body)); } catch (e) { next(e); }
};
const enroll = async (req, res, next) => {
  try {
    // If a student is enrolling, use their own profile id automatically
    // If an admin or lecturer is enrolling someone, they pass studentId in the body
    let studentId;

    if (req.user.role === 'student') {
      studentId = req.user.profileId;
    } else {
      studentId = req.body.studentId;
      if (!studentId) {
        return res.status(400).json({ message: 'studentId is required' });
      }
    }

    res.status(201).json(
      await require('./courses.service').enrollStudent(studentId, req.params.id)
    );
  } catch (e) { next(e); }
};
const drop     = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    res.json(await service.dropCourse(studentId, req.params.id));
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, enroll, drop };