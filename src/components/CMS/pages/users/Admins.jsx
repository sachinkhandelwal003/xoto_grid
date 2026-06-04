import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  IconButton,
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  Icon
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import CustomTable from '../../pages/custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';
import { showConfirmDialog, showSuccessAlert, showErrorAlert } from '../../../../manageApi/utils/sweetAlert';

const Admins = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({});

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  // Fetch admins
  const fetchAdmins = async (page = 1, itemsPerPage = 10, filters = {}) => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage };
      if (filters.status) params.status = filters.status;
      if (filters.isActive !== undefined) params.isActive = filters.isActive;
      if (filters.email) params.email = filters.email;
      
      const response = await apiService.get('/auth', params);
      setAdmins(response.users || []);
      setPagination({
        currentPage: response.pagination.currentPage || 1,
        totalPages: response.pagination.totalPages || 1,
        totalResults: response.pagination.totalRecords || 0,
        itemsPerPage: response.pagination.perPage || 10,
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles for dropdown
  const fetchRoles = async () => {
    try {
      const response = await apiService.get('/roles', { limit: 100 });
      // Filter out superadmin role (code 0)
      const filteredRoles = (response.roles || []).filter(role => role.code !== "0");
      setRoles(filteredRoles);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch roles', 'error');
    }
  };

  // Handle page change
  const handlePageChange = (page, itemsPerPage) => {
    fetchAdmins(page, itemsPerPage, filters);
  };

  // Handle filter change
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchAdmins(1, pagination.itemsPerPage, newFilters);
  };

  // Open modal for adding new admin
  const openAddModal = () => {
    setEditingAdmin(null);
    setIsModalOpen(true);
  };

  // Open modal for editing admin
  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  // Open password reset modal
  const openPasswordModal = (admin) => {
    setEditingAdmin(admin);
    setIsPasswordModalOpen(true);
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Handle password modal cancel
  const handlePasswordCancel = () => {
    setIsPasswordModalOpen(false);
  };

  // Submit admin form (create or update)
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = {
      email: formData.get('email'),
      role: formData.get('role'),
      status: parseInt(formData.get('status')),
      isActive: formData.get('isActive') === 'on',
      ...(!editingAdmin && { password: formData.get('password') })
    };

    try {
      setSubmitting(true);
      
      if (editingAdmin) {
        // Update existing admin
        await apiService.put(`/auth/users/${editingAdmin._id}`, values);
        showSuccessAlert('Success', 'Admin updated successfully');
      } else {
        // Create new admin
        await apiService.post('/auth/', values);
        showSuccessAlert('Success', 'Admin created successfully');
      }
      
      setIsModalOpen(false);
      fetchAdmins(pagination.currentPage, pagination.itemsPerPage, filters);
    } catch (error) {
      showErrorAlert('Error', error.response?.data?.message || 'Failed to save admin');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset password
  const handlePasswordReset = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = {
      password: formData.get('password')
    };

    try {
      setSubmitting(true);
      
      await apiService.put(`/auth/users/${editingAdmin._id}/password`, values);
      
      showSuccessAlert('Success', 'Password reset successfully');
      setIsPasswordModalOpen(false);
    } catch (error) {
      showErrorAlert('Error', error.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete admin
  const handleDelete = async (admin) => {
    const result = await showConfirmDialog(
      'Confirm Delete',
      `Are you sure you want to delete the admin "${admin.email}"? This action cannot be undone.`,
      'Delete'
    );
    
    if (result.isConfirmed) {
      try {
        await apiService.delete(`/auth/${admin._id}`);
        showSuccessAlert('Success', 'Admin deleted successfully');
        fetchAdmins(pagination.currentPage, pagination.itemsPerPage, filters);
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to delete admin');
      }
    }
  };

  // Toggle admin active status
  const toggleActiveStatus = async (admin) => {
    try {
      await apiService.put(`/auth/users/${admin._id}`, { isActive: !admin.isActive });
      showSuccessAlert('Success', `Admin ${!admin.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchAdmins(pagination.currentPage, pagination.itemsPerPage, filters);
    } catch (error) {
      showErrorAlert('Error', error.response?.data?.message || 'Failed to update admin status');
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAdmins(pagination.currentPage, pagination.itemsPerPage, filters);
    fetchRoles();
  }, []);

  // Admin table columns
  const adminColumns = useMemo(() => [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      filterable: true,
      render: (value) => <span className="font-medium text-gray-900">{value || '--'}</span>,
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      filterable: true,
      render: (value) => <span className="text-gray-900">{value}</span>,
    },
    {
      key: 'role.name',
      title: 'Role',
      sortable: true,
      filterable: true,
      filterOptions: roles.map(r => ({ value: r._id, label: r.name })),
      render: (value, item) => <span className="text-gray-900">{item.role?.name || '--'}</span>,
    },
    {
      key: 'status',
      title: 'Verification Status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: '0', label: 'Pending' },
        { value: '1', label: 'Verified' },
      ],
      render: (value) => (
        <Chip 
          label={value === 1 ? 'Verified' : 'Pending'} 
          color={value === 1 ? 'primary' : 'warning'}
          size="small"
        />
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
      render: (value, item) => (
        <Chip 
          label={value ? 'Active' : 'Inactive'} 
          color={value ? 'success' : 'error'}
          size="small"
          onClick={() => toggleActiveStatus(item)}
          style={{ cursor: 'pointer' }}
        />
      ),
    },
    {
      key: 'createdAt',
      title: 'Created At',
      sortable: true,
      render: (value) => <span className="text-gray-900">{value ? new Date(value).toLocaleDateString() : '--'}</span>,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, item) => (
        <div className="flex gap-2">
          <IconButton
            onClick={() => openEditModal(item)}
            color="primary"
            title="Edit"
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => openPasswordModal(item)}
            color="warning"
            title="Reset Password"
            size="small"
          >
            <KeyIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(item)}
            color="error"
            title="Delete"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ], [roles]);

  // Find the Vendor role ID for default selection
  const adminRole = roles.find(role => role.name.toLowerCase() === 'admin');
  const defaultRoleId = editingAdmin?.role?._id || adminRole?._id || '';

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937' }}>Admin Management</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddModal}
          sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}
        >
          Add Admin
        </Button>
      </Box>
      
      <CustomTable
        columns={adminColumns}
        data={admins}
        totalItems={pagination.totalResults}
        currentPage={pagination.currentPage}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={handlePageChange}
        onFilter={handleFilter}
        loading={loading}
      />
      
      {/* Admin Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCancel}
        aria-labelledby="admin-dialog-title"
        sx={{ '& .MuiDialog-paper': { width: 600, maxWidth: '90vw' } }}
      >
        <DialogTitle
          id="admin-dialog-title"
          sx={{
            borderLeft: '5px solid #1976d2',
            borderRadius: 0,
            pl: 1,
            bgcolor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {editingAdmin ? "Edit Admin" : "Add New Admin"}
          <IconButton aria-label="close" onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
           
            <TextField
              name="email"
              label="Email"
              type="email"
              defaultValue={editingAdmin?.email || ''}
              fullWidth
              required
              variant="outlined"
              size="small"
            />
            
            {!editingAdmin && (
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                required
                variant="outlined"
                size="small"
              />
            )}
            
            <FormControl fullWidth size="small">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                name="role"
                labelId="role-label"
                label="Role"
                value={defaultRoleId}
                required
              >
                {roles.map(role => (
                  <MenuItem key={role._id} value={role._id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel id="status-label">Verification Status</InputLabel>
              <Select
                name="status"
                labelId="status-label"
                label="Verification Status"
                defaultValue={editingAdmin?.status?.toString() || '1'}
                required
              >
                <MenuItem value="0">Pending</MenuItem>
                <MenuItem value="1">Verified</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Checkbox 
                  name="isActive" 
                  defaultChecked={editingAdmin?.isActive || false} 
                />
              }
              label="Active"
            />
            
            <DialogActions sx={{ p: 0, mt: 2 }}>
              <Button onClick={handleCancel}    className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-lg shadow-sm"
>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
              >
                {editingAdmin ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Password Reset Modal */}
      <Dialog
        open={isPasswordModalOpen}
        onClose={handlePasswordCancel}
        aria-labelledby="password-dialog-title"
        sx={{ '& .MuiDialog-paper': { width: 400, maxWidth: '90vw' } }}
      >
        <DialogTitle
          id="password-dialog-title"
          sx={{
            borderLeft: '5px solid #1976d2',
            borderRadius: 0,
            pl: 1,
            bgcolor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Reset Password
          <IconButton aria-label="close" onClick={handlePasswordCancel}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box component="form" onSubmit={handlePasswordReset} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="password"
              label="New Password"
              type="password"
              fullWidth
              required
              variant="outlined"
              size="small"
            />
            
            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              fullWidth
              required
              variant="outlined"
              size="small"
            />
            
            <DialogActions sx={{ p: 0, mt: 2 }}>
              <Button onClick={handlePasswordCancel}     className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-lg shadow-sm"
>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
              >
                Reset Password
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Admins;