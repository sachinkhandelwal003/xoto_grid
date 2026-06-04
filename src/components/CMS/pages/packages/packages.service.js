// src/api/package.service.js

import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../../manageApi/utils/toast";

// Base endpoint for all package routes
const BASE_URL = "/packages";

const packageAPI = {
  // GET all packages (optional pagination or filters)
  getPackages: (params = {}) => apiService.get(BASE_URL, params),

  // GET single package
  getPackageById: (id) => apiService.get(`${BASE_URL}/${id}`),

  // CREATE package
  createPackage: (data) => apiService.post(BASE_URL, data),

  // UPDATE package
  updatePackage: (id, data) => apiService.put(`${BASE_URL}/${id}`, data),

  // SOFT DELETE package
  deletePackage: (id) => apiService.delete(`${BASE_URL}/${id}`),

  // RESTORE soft-deleted package
  restorePackage: (id) => apiService.patch(`${BASE_URL}/${id}/restore`),

  // PERMANENT DELETE
  permanentDeletePackage: (id) =>
    apiService.delete(`${BASE_URL}/${id}/permanent`),
};

// WRAP API WITH ERROR HANDLER
export const packageService = {
  ...packageAPI,

  handleError(err, fallback = "Something went wrong") {
    const msg = err.response?.data?.message || err.message || fallback;
    showToast(msg, "error");
    throw err;
  },
};
