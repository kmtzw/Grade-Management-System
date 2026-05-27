const service = require('./reports.service');

const getStats     = async (req, res, next) => {
  try { res.json(await service.getInstitutionStats()); } catch (e) { next(e); }
};
const getDistribution = async (req, res, next) => {
  try { res.json(await service.getGradeDistribution(req.query.courseId)); } catch (e) { next(e); }
};
const getDeptComparison = async (req, res, next) => {
  try { res.json(await service.getDepartmentComparison()); } catch (e) { next(e); }
};
const getTopStudents = async (req, res, next) => {
  try { res.json(await service.getTopStudents(req.query.limit)); } catch (e) { next(e); }
};
const getLecturerReport = async (req, res, next) => {
  try { res.json(await service.getLecturerReport(req.params.lecturerId)); } catch (e) { next(e); }
};

module.exports = { getStats, getDistribution, getDeptComparison, getTopStudents, getLecturerReport };