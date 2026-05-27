const service = require('./students.service');

const getAll    = async (req, res, next) => {
  try { res.json(await service.getAllStudents(req.query)); }
  catch (err) { next(err); }
};

const getById   = async (req, res, next) => {
  try { res.json(await service.getStudentById(req.params.id)); }
  catch (err) { next(err); }
};

const update    = async (req, res, next) => {
  try { res.json(await service.updateStudent(req.params.id, req.body)); }
  catch (err) { next(err); }
};

const remove    = async (req, res, next) => {
  try { res.json(await service.deleteStudent(req.params.id)); }
  catch (err) { next(err); }
};

module.exports = { getAll, getById, update, remove };