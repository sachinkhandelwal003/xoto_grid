// src/api/module.service.js
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';

const API = {
  // MODULES with pagination support
  getAll: (params = {}) => apiService.get('/module',  params ),
  getOne: (id) => apiService.get(`/module/${id}`),
  create: (data) => apiService.post('/module', data),
  update: (id, data) => apiService.put(`/module/${id}`, data),
  reorder: (modules) => apiService.put('/module/reorder', { modules }),
  delete: (id) => apiService.delete(`/module/${id}`),
  restore: (id) => apiService.post(`/module/${id}/restore`),

  // SUB-MODULES
  createSub: (moduleId, data) => apiService.post(`/module/${moduleId}/sub-modules`, data),
  updateSub: (moduleId, subId, data) => apiService.put(`/module/${moduleId}/sub-modules/${subId}`, data),
  deleteSub: (moduleId, subId) => apiService.delete(`/module/${moduleId}/sub-modules/${subId}`),
  restoreSub: (moduleId, subId) => apiService.post(`/module/${moduleId}/sub-modules/${subId}/restore`),
  reorderSub: (moduleId, subModules) => apiService.put(`/module/${moduleId}/sub-modules/reorder`, { subModules }),
};

export const moduleService = {
  ...API,
  handleError: (err, fallback) => {
    const msg = err.response?.data?.message || err.message || fallback;
    showToast(msg, 'error');
    throw err;
  },
};