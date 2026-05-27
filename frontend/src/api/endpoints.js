// All API calls live here so that if a URL changes,
// you only update it in one place.
import api from './client';

export const authAPI = {
  login:          (data)   => api.post('/auth/login', data),
  register:       (data)   => api.post('/auth/register', data),
  getMe:          ()       => api.get('/auth/me'),
  changePassword: (data)   => api.put('/auth/change-password', data),
};

export const studentsAPI = {
  getAll:   (params)       => api.get('/students', { params }),
  getById:  (id)           => api.get(`/students/${id}`),
  update:   (id, data)     => api.put(`/students/${id}`, data),
  delete:   (id)           => api.delete(`/students/${id}`),
};

export const coursesAPI = {
  getAll:   (params)       => api.get('/courses', { params }),
  getById:  (id)           => api.get(`/courses/${id}`),
  create:   (data)         => api.post('/courses', data),
  update:   (id, data)     => api.put(`/courses/${id}`, data),
  enroll:   (id, data)     => api.post(`/courses/${id}/enroll`, data),
  drop:     (id, data)     => api.post(`/courses/${id}/drop`, data),
};

export const gradesAPI = {
  submit:         (data)   => api.post('/grades', data),
  bulkSubmit:     (data)   => api.post('/grades/bulk', data),
  getCourseGrades:(id)     => api.get(`/grades/course/${id}`),
  getTranscript:  (id)     => api.get(`/grades/student/${id}`),
};

export const reportsAPI = {
  getStats:       ()       => api.get('/reports/stats'),
  getDistribution:(params) => api.get('/reports/distribution', { params }),
  getDepartments: ()       => api.get('/reports/departments'),
  getTopStudents: (params) => api.get('/reports/top-students', { params }),
  getLecturer:    (id)     => api.get(`/reports/lecturer/${id}`),
};

export const lecturersAPI = {
  getAll:   (params)   => api.get('/lecturers', { params }),
  getById:  (id)       => api.get(`/lecturers/${id}`),
  update:   (id, data) => api.put(`/lecturers/${id}`, data),
  delete:   (id)       => api.delete(`/lecturers/${id}`),
};