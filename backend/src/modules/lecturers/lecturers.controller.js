const service = require('./lecturers.service');

const getAll  = async (req, res, next) => {
  try { res.json(await service.getAllLecturers(req.query)); } catch (e) { next(e); }
};
const getById = async (req, res, next) => {
  try { res.json(await service.getLecturerById(req.params.id)); } catch (e) { next(e); }
};
const update  = async (req, res, next) => {
  try { res.json(await service.updateLecturer(req.params.id, req.body)); } catch (e) { next(e); }
};
const remove  = async (req, res, next) => {
  try { res.json(await service.deleteLecturer(req.params.id)); } catch (e) { next(e); }
};

module.exports = { getAll, getById, update, remove };