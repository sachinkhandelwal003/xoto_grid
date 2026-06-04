import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Drawer,
  Switch,
  Card,
  Space,
  Tag,
  Tooltip,
  Spin,
  Typography,
  Row,
  Col,
  Progress,
  Badge,
  Statistic,
  Alert
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons';
import CustomTable from '../../pages/custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';
import { showSuccessAlert, showErrorAlert } from '../../../../manageApi/utils/sweetAlert';
import { moduleService } from '../modules/module.service';

// Theme colors
const PURPLE_THEME = {
  primary: '#722ed1',
  primaryLight: '#9254de',
  primaryLighter: '#d3adf7',
  primaryBg: '#f9f0ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
  gray: '#8c8c8c',
  dark: '#1f2937'
};

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const useModulePermission = () => {
  const { permissions } = useSelector(s => s.auth);
  const p = permissions?.['Module→All Modules'] ?? {};
  return {
    canView: !!p.canView,
    canAdd: !!p.canAdd,
    canEdit: !!p.canEdit,
    canDelete: !!p.canDelete,
    canViewAll: !!p.canViewAll,
  };
};

const ProCard = ({ children, title, extra, headerStyle, bodyStyle, className = '', ...props }) => (
  <Card
    {...props}
    className={`shadow-sm border-0 ${className}`}
    title={
      title && (
        <div className="flex items-center justify-between" style={headerStyle}>
          <span className="font-semibold text-gray-800">{title}</span>
          {extra}
        </div>
      )
    }
    bodyStyle={{ padding: '20px 24px', ...bodyStyle }}
    headStyle={{
      background: PURPLE_THEME.primaryBg,
      borderBottom: `1px solid ${PURPLE_THEME.primaryLighter}`,
      padding: '16px 24px',
      borderRadius: '8px 8px 0 0',
      ...headerStyle
    }}
  >
    {children}
  </Card>
);

const Permission = () => {
  const { token } = useSelector(s => s.auth);
  const perm = useModulePermission();

  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermMap, setRolePermMap] = useState({});
  const [saving, setSaving] = useState(false);

  // ✅ filters must include search
  const [filters, setFilters] = useState({
    search: '',
    isActive: undefined
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  const [stats, setStats] = useState({
    totalPermissions: 0,
    activeRoles: 0,
    grantedPermissions: 0
  });

  const getPermValue = (value) => value === 1 || value === true;

  /* -------------------------- FETCH DATA -------------------------- */
  const fetchData = useCallback(
    async (page = 1, itemsPerPage = 10, filters = {}) => {
      if (!perm.canView) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const search = filters?.search?.trim();
        const isActive = filters?.isActive;

        const roleParams = {
          page,
          limit: itemsPerPage,
          ...(typeof isActive === 'boolean' ? { isActive } : {}),
          ...(search ? { search } : {}),
        };

        const [rolesRes, modulesRes, permissionsRes] = await Promise.all([
          apiService.get('/roles', roleParams),
          moduleService.getAll(),
          apiService.get('/permission', { limit: 100 })
        ]);

        const sortedModules = (modulesRes.data || []).sort(
          (a, b) => a.position - b.position
        );

        setModules(sortedModules);
        setRoles(rolesRes.roles || []);
        setPermissions(permissionsRes.permissions || []);

        setPagination({
          currentPage: rolesRes.pagination?.currentPage || page,
          totalPages: rolesRes.pagination?.totalPages || 1,
          totalResults: rolesRes.pagination?.totalRecords || 0,
          itemsPerPage: rolesRes.pagination?.perPage || itemsPerPage,
        });

        const map = {};
        let grantedCount = 0;

        // Build role permission map
        permissionsRes.permissions?.forEach(p => {
          const roleId = p.role?._id;
          const modId = p.module?._id;
          
          // Handle submodule - check if subModule exists and has _id
          let subId = '__module__';
          if (p.subModule && p.subModule._id) {
            subId = p.subModule._id;
          }

          if (!roleId || !modId) return;

          // Initialize nested structure
          if (!map[roleId]) map[roleId] = {};
          if (!map[roleId][modId]) map[roleId][modId] = {};

          const permObj = {
            id: p._id,
            canAdd: getPermValue(p.permissions?.canAdd),
            canEdit: getPermValue(p.permissions?.canEdit),
            canView: getPermValue(p.permissions?.canView),
            canDelete: getPermValue(p.permissions?.canDelete),
            canViewAll: getPermValue(p.permissions?.canViewAll),
          };

          if (Object.values(permObj).some(Boolean)) grantedCount++;

          map[roleId][modId][subId] = permObj;
        });

        // Calculate total possible permissions
        const totalModulesAndSubmodules = sortedModules.reduce((total, module) => {
          const subModuleCount = module.subModules?.filter(sm => !sm.isDeleted).length || 0;
          return total + 1 + subModuleCount; // +1 for module itself
        }, 0);

        const totalItems = totalModulesAndSubmodules * (rolesRes.roles?.length || 0);

        const activeRoles = rolesRes.roles?.filter(r => r.isActive)?.length || 0;

        setStats({
          totalPermissions: totalItems,
          activeRoles,
          grantedPermissions: grantedCount,
        });

        setRolePermMap(map);
      } catch (err) {
        showToast(
          err.response?.data?.message || 'Failed to load data',
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [perm.canView]
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchData(pagination.currentPage, pagination.itemsPerPage, filters);
    }
  }, [token, fetchData, filters, pagination.currentPage, pagination.itemsPerPage]);

  const handlePageChange = (page, itemsPerPage) => fetchData(page, itemsPerPage, filters);

  // ✅ FIXED FILTER HANDLER
  const handleFilter = (newFilters) => {
    const updated = {
      ...filters,
      ...newFilters,
    };

    setFilters(updated);

    // ✅ search always reset to page 1
    fetchData(1, pagination.itemsPerPage, updated);
  };

  const openDrawer = (role) => {
    setSelectedRole(role);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRole(null);
  };

  /* --------------------- IMMUTABLE UPDATE --------------------- */
  const updatePerm = useCallback((moduleId, subId, type, value) => {
    setRolePermMap(prev => {
      const copy = deepClone(prev);
      const roleId = selectedRole?._id;

      if (!roleId) return copy;

      if (!copy[roleId]) copy[roleId] = {};
      if (!copy[roleId][moduleId]) copy[roleId][moduleId] = {};

      const key = subId || '__module__';
      if (!copy[roleId][moduleId][key]) {
        copy[roleId][moduleId][key] = {
          id: undefined,
          canAdd: false,
          canEdit: false,
          canView: false,
          canDelete: false,
          canViewAll: false,
        };
      }

      copy[roleId][moduleId][key][type] = value;
      return copy;
    });
  }, [selectedRole]);

  /* -------------------------- SAVE -------------------------- */
  const savePermissions = async () => {
    if (!perm.canEdit) {
      showToast('You do not have permission to edit', 'warning');
      return;
    }

    if (!selectedRole) {
      showToast('No role selected', 'error');
      return;
    }

    setSaving(true);

    const roleId = selectedRole._id;
    const rolePerms = rolePermMap[roleId] || {};
    const toCreate = [];
    const toUpdate = [];
    const toDelete = [];

    Object.entries(rolePerms).forEach(([modId, modPerms]) => {
      Object.entries(modPerms).forEach(([key, p]) => {
        const subId = key === '__module__' ? null : key;
        const hasAny = p.canAdd || p.canEdit || p.canView || p.canDelete || p.canViewAll;

        const payload = {
          canAdd: p.canAdd ? 1 : 0,
          canEdit: p.canEdit ? 1 : 0,
          canView: p.canView ? 1 : 0,
          canDelete: p.canDelete ? 1 : 0,
          canViewAll: p.canViewAll ? 1 : 0,
        };

        if (hasAny && p.id) {
          toUpdate.push({ id: p.id, data: payload });
        } else if (hasAny && !p.id) {
          toCreate.push({ 
            roleId, 
            moduleId: modId, 
            subModuleId: subId, 
            ...payload 
          });
        } else if (!hasAny && p.id) {
          toDelete.push(p.id);
        }
      });
    });

    try {
      if (toDelete.length) {
        await Promise.all(toDelete.map(id => apiService.delete(`/permission/${id}`)));
      }
      if (toUpdate.length) {
        await Promise.all(toUpdate.map(({ id, data }) => 
          apiService.put(`/permission/${id}`, data)
        ));
      }
      if (toCreate.length) {
        await apiService.post('/permission', toCreate);
      }

      showSuccessAlert(
        'Success', 
        `${toCreate.length} created, ${toUpdate.length} updated, ${toDelete.length} removed`
      );

      closeDrawer();
      fetchData(pagination.currentPage, pagination.itemsPerPage, filters);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Save failed';
      showErrorAlert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------- COLUMNS -------------------------- */
  const columns = useMemo(() => [
    {
      key: 'name',
      title: 'Role Name',
      sortable: true,
      render: (v, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: PURPLE_THEME.primaryBg }}
          >
            <TeamOutlined style={{ color: PURPLE_THEME.primary, fontSize: '18px' }} />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{v}</div>
            <div className="text-xs text-gray-500">{record.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: v => <span className="text-gray-600">{v || 'No description'}</span>,
    },
    {
      key: 'permissions',
      title: 'Permissions',
      render: (_, r) => {
        const totalModulesAndSubmodules = modules.reduce((total, module) => {
          const subModuleCount = module.subModules?.filter(sm => !sm.isDeleted).length || 0;
          return total + 1 + subModuleCount;
        }, 0);

        const granted = Object.values(rolePermMap[r._id] || {}).reduce(
          (count, mod) =>
            count +
            Object.values(mod).filter(p =>
              p.canAdd || p.canEdit || p.canView || p.canDelete || p.canViewAll
            ).length,
          0
        );

        const percent = totalModulesAndSubmodules > 0 
          ? Math.round((granted / totalModulesAndSubmodules) * 100) 
          : 0;

        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{granted} / {totalModulesAndSubmodules}</span>
              <span className="font-semibold" style={{ color: PURPLE_THEME.primary }}>
                {percent}%
              </span>
            </div>

            <Progress
              percent={percent}
              size="small"
              strokeColor={percent === 100 ? PURPLE_THEME.success : PURPLE_THEME.primary}
              showInfo={false}
            />

            <div className="text-xs text-gray-500">
              {percent === 0 ? 'No access' :
                percent === 100 ? 'Full access' :
                  'Limited access'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterKey: 'isActive',
      filterOptions: [
        { value: true, label: 'Active' },
        { value: false, label: 'Inactive' },
      ],
      render: v => (
        <Badge
          status={v ? "success" : "error"}
          text={
            <span className={v ? "text-green-600" : "text-red-600"}>
              {v ? 'Active' : 'Inactive'}
            </span>
          }
        />
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, r) => (
        <Space>
          <Tooltip title="Manage Permissions">
            <Button
              type="primary"
              ghost
              icon={<SettingOutlined />}
              onClick={() => openDrawer(r)}
              disabled={!perm.canView}
              style={{ borderColor: PURPLE_THEME.primary, color: PURPLE_THEME.primary }}
            >
              Configure
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ], [modules, rolePermMap, perm.canView]);

  if (loading && !roles.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!perm.canView) {
    return (
      <div className="p-8 text-center">
        <div className="mb-4">
          <LockOutlined style={{ fontSize: '64px', color: PURPLE_THEME.gray }} />
        </div>
        <Typography.Title level={4} style={{ color: PURPLE_THEME.dark }}>
          Access Denied
        </Typography.Title>
        <Typography.Text type="secondary">
          You do not have permission to view Role Permissions.
        </Typography.Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Typography.Title
              level={2}
              style={{
                margin: 0,
                color: PURPLE_THEME.dark,
                fontWeight: 600
              }}
            >
              Role Permissions
            </Typography.Title>
            <Typography.Text type="secondary" className="text-gray-600">
              Manage and configure access permissions for all user roles
            </Typography.Text>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: PURPLE_THEME.primaryBg }}>
            <SafetyCertificateOutlined style={{ color: PURPLE_THEME.primary, fontSize: '20px' }} />
            <span className="font-medium" style={{ color: PURPLE_THEME.primary }}>
              {perm.canEdit ? 'Edit Mode' : 'View Mode'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <ProCard className="h-full">
              <Statistic
                title="Total Roles"
                value={pagination.totalResults}
                prefix={<TeamOutlined />}
                valueStyle={{ color: PURPLE_THEME.primary }}
              />
              <div className="mt-2 text-sm text-gray-500">
                {stats.activeRoles} active roles
              </div>
            </ProCard>
          </Col>

          <Col xs={24} sm={8}>
            <ProCard className="h-full">
              <Statistic
                title="Granted Permissions"
                value={stats.grantedPermissions}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: PURPLE_THEME.success }}
              />
              <div className="mt-2 text-sm text-gray-500">
                Out of {stats.totalPermissions} total
              </div>
            </ProCard>
          </Col>

          <Col xs={24} sm={8}>
            <ProCard className="h-full">
              <Statistic
                title="Modules"
                value={modules.length}
                prefix={<SettingOutlined />}
                valueStyle={{ color: PURPLE_THEME.info }}
              />
              <div className="mt-2 text-sm text-gray-500">
                With sub-modules included
              </div>
            </ProCard>
          </Col>
        </Row>
      </div>

      {/* Main Table */}
      <ProCard
        title="Role Management"
        extra={
          <Tag color={PURPLE_THEME.primary} style={{ border: 'none', fontWeight: 500 }}>
            {pagination.totalResults} Total Roles
          </Tag>
        }
        className="shadow-md"
      >
        <CustomTable
          columns={columns}
          data={roles}
          totalItems={pagination.totalResults}
          currentPage={pagination.currentPage}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onFilter={handleFilter}
          loading={loading}
        />
      </ProCard>

      {/* Drawer */}
      <Drawer
        title={
          <div className="pr-8">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: PURPLE_THEME.primaryBg }}
              >
                <TeamOutlined style={{ color: PURPLE_THEME.primary, fontSize: '24px' }} />
              </div>
              <div>
                <Typography.Title level={4} style={{ margin: 0, color: PURPLE_THEME.dark }}>
                  {selectedRole?.name}
                </Typography.Title>
                <div className="flex items-center gap-2">
                  <Tag color="blue" style={{ margin: 0 }}>{selectedRole?.code}</Tag>
                  <Badge
                    status={selectedRole?.isActive ? "success" : "error"}
                    text={selectedRole?.isActive ? "Active" : "Inactive"}
                  />
                </div>
              </div>
            </div>
            <Typography.Text type="secondary">
              Configure module permissions for this role
            </Typography.Text>
          </div>
        }
        placement="right"
        onClose={closeDrawer}
        open={drawerOpen}
        closeIcon={<CloseOutlined />}
        width={1000}
        destroyOnClose
        maskClosable={false}
        styles={{
          body: { background: '#fafafa' },
          header: {
            borderBottom: `1px solid ${PURPLE_THEME.primaryLighter}`,
            background: 'white'
          }
        }}
      >
        {/* Drawer content */}
        <Alert
          message="Permission Configuration"
          description={`Click the switches to enable or disable permissions for ${selectedRole?.name}. Changes are saved when you click "Save Permissions".`}
          type="info"
          showIcon
          style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}
        />

        {/* Modules List with Permissions */}
        <div className="mt-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
          {modules.map(module => {
            const roleId = selectedRole?._id;
            const modulePerms = rolePermMap?.[roleId]?.[module._id] || {};

            return (
              <Card
                key={module._id}
                size="small"
                title={
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{module.name}</span>
                    {module.description && (
                      <Typography.Text type="secondary" className="text-sm">
                        {module.description}
                      </Typography.Text>
                    )}
                  </div>
                }
                className="shadow-sm border border-gray-200"
              >
                {/* Module Level Permissions */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Typography.Text strong style={{ color: PURPLE_THEME.dark }}>
                      Module Permissions
                    </Typography.Text>
                    <Tag color={PURPLE_THEME.primaryLight}>
                      Route: {module.route}
                    </Tag>
                  </div>
                  <Space wrap className="gap-3">
                    {['canView', 'canAdd', 'canEdit', 'canDelete', 'canViewAll'].map(p => (
                      <Tooltip key={p} title={p.replace('can', 'Allow ')}>
                        <div className="flex flex-col items-center">
                          <Switch
                            checked={modulePerms['__module__']?.[p] || false}
                            onChange={val => updatePerm(module._id, null, p, val)}
                            checkedChildren={p.replace('can', '')}
                            unCheckedChildren={p.replace('can', '')}
                            style={{
                              backgroundColor: modulePerms['__module__']?.[p] 
                                ? PURPLE_THEME.primary 
                                : undefined
                            }}
                          />
                          <Typography.Text type="secondary" className="text-xs mt-1">
                            {p.replace('can', '')}
                          </Typography.Text>
                        </div>
                      </Tooltip>
                    ))}
                  </Space>
                </div>

                {/* Sub-Modules */}
                {module.subModules && module.subModules.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Typography.Title level={5} style={{ marginBottom: 16, color: PURPLE_THEME.dark }}>
                      Sub-Modules
                    </Typography.Title>
                    <div className="space-y-4">
                      {module.subModules
                        ?.filter(sm => !sm.isDeleted)
                        .map(sub => {
                          const subPerm = modulePerms[sub._id] || {};
                          return (
                            <Card
                              key={sub._id}
                              size="small"
                              className="bg-gray-50 border border-gray-100"
                              title={
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{sub.name}</span>
                                  <Tag color="blue">{sub.route}</Tag>
                                </div>
                              }
                            >
                              <Space wrap className="gap-3">
                                {['canView', 'canAdd', 'canEdit', 'canDelete', 'canViewAll'].map(p => (
                                  <Tooltip key={p} title={p.replace('can', 'Allow ')}>
                                    <div className="flex flex-col items-center">
                                      <Switch
                                        checked={subPerm[p] || false}
                                        onChange={val => updatePerm(module._id, sub._id, p, val)}
                                        checkedChildren={p.replace('can', '')}
                                        unCheckedChildren={p.replace('can', '')}
                                        style={{
                                          backgroundColor: subPerm[p] 
                                            ? PURPLE_THEME.primary 
                                            : undefined
                                        }}
                                      />
                                      <Typography.Text type="secondary" className="text-xs mt-1">
                                        {p.replace('can', '')}
                                      </Typography.Text>
                                    </div>
                                  </Tooltip>
                                ))}
                              </Space>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-between items-center sticky bottom-0 bg-white p-4 border-t rounded-b-lg shadow-lg">
          <div className="text-sm text-gray-500">
            <CheckCircleOutlined className="mr-2" style={{ color: PURPLE_THEME.success }} />
            Configure permissions carefully
          </div>
          <Space>
            <Button onClick={closeDrawer} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={savePermissions}
              loading={saving}
              disabled={!perm.canEdit || !selectedRole}
              size="large"
              style={{
                background: PURPLE_THEME.primary,
                borderColor: PURPLE_THEME.primary,
              }}
            >
              Save Permissions
            </Button>
          </Space>
        </div>
      </Drawer>
    </div>
  );
};

export default Permission;