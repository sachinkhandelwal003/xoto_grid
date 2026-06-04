import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Button,
  Drawer,
  Space,
  Tag,
  Tooltip,
  Spin,
  Typography,
  Divider,
  Row,
  Col,
  Statistic,
  Badge,
  Alert,
  Avatar,
  Popconfirm,
  Empty,
  Input,
  Form,
  Modal,
  List,
  Skeleton
} from 'antd';
import {
  EyeOutlined,
  CloseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RestOutlined,
  SettingOutlined,
  FolderOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  LinkOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import CustomTable from '../../pages/custom/CustomTable'; // Ensure path is correct
import { moduleService } from './module.service';
import { showToast } from '../../../../manageApi/utils/toast';
import { showSuccessAlert, showErrorAlert } from '../../../../manageApi/utils/sweetAlert';

// --- THEME CONFIGURATION ---
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

// --- HELPER COMPONENTS ---

const ProCard = ({ children, title, extra, headerStyle, bodyStyle, className = '', ...props }) => (
  <Card
    {...props}
    className={`shadow-sm border-0 hover:shadow-md transition-shadow ${className}`}
    styles={{
      body: { padding: '20px 24px', ...bodyStyle },
      header: { 
        background: '#fff',
        borderBottom: `1px solid ${PURPLE_THEME.primaryBg}`,
        padding: '16px 24px',
        ...headerStyle
      }
    }}
    title={title && (
      <div className="flex items-center justify-between">
        <Typography.Text strong style={{ color: PURPLE_THEME.dark, fontSize: '16px' }}>
          {title}
        </Typography.Text>
        {extra}
      </div>
    )}
  >
    {children}
  </Card>
);

// --- MODALS ---

// 1. Create Module Modal
const CreateModuleModal = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [subModules, setSubModules] = useState([]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        icon: values.icon || 'fas fa-folder',
        subModules: subModules.map(sub => ({
          ...sub,
          icon: sub.icon || 'fas fa-circle',
          isActive: true
        }))
      };
      await moduleService.create(payload);
      showSuccessAlert('Success', 'Module created successfully');
      form.resetFields();
      setSubModules([]);
      onSuccess();
      onCancel();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create module';
      showErrorAlert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const addSubModule = () => {
    setSubModules([...subModules, { name: '', route: '', icon: '' }]);
  };

  const updateSubModule = (index, field, value) => {
    const updated = [...subModules];
    updated[index] = { ...updated[index], [field]: value };
    setSubModules(updated);
  };

  const removeSubModule = (index) => {
    setSubModules(subModules.filter((_, i) => i !== index));
  };

  return (
    <Modal
      title={<Space><PlusOutlined style={{ color: PURPLE_THEME.primary }} /> Create New Module</Space>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
      maskClosable={false}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ icon: 'fas fa-folder' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Module Name" name="name" rules={[{ required: true, message: 'Required' }]}>
              <Input placeholder="e.g., Products" prefix={<FolderOutlined className="text-gray-400" />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Route" name="route" rules={[{ required: true, message: 'Required' }]}>
              <Input placeholder="/products" prefix={<LinkOutlined className="text-gray-400" />} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Icon (FontAwesome)" name="icon">
              <Input placeholder="fas fa-folder" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Description" name="description">
              <Input placeholder="Optional description" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left"><Tag color="purple">Sub-modules</Tag></Divider>
        
        <div className="max-h-[200px] overflow-y-auto pr-2 mb-4">
          {subModules.map((sub, index) => (
            <div key={index} className="flex gap-2 mb-2 p-3 bg-gray-50 rounded border border-gray-100 items-start">
              <Input 
                placeholder="Name" 
                value={sub.name} 
                onChange={(e) => updateSubModule(index, 'name', e.target.value)} 
                className="w-1/3"
              />
              <Input 
                placeholder="Route" 
                value={sub.route} 
                onChange={(e) => updateSubModule(index, 'route', e.target.value)} 
                className="w-1/3"
              />
              <Input 
                placeholder="Icon" 
                value={sub.icon} 
                onChange={(e) => updateSubModule(index, 'icon', e.target.value)} 
                className="w-1/4"
              />
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeSubModule(index)} />
            </div>
          ))}
        </div>

        <Button type="dashed" block icon={<PlusOutlined />} onClick={addSubModule} className="mb-6">
          Add Sub-module Row
        </Button>

        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading} style={{ background: PURPLE_THEME.primary }}>
            Create Module
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// 2. Create Sub-Module Modal
const CreateSubModuleModal = ({ open, moduleId, moduleName, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = { ...values, icon: values.icon || 'fas fa-circle', isActive: true };
      await moduleService.createSub(moduleId, [payload]);
      showSuccessAlert('Success', 'Sub-module added successfully');
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (err) {
      showErrorAlert('Error', err.response?.data?.message || 'Failed to add sub-module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<Space><ArrowRightOutlined style={{ color: PURPLE_THEME.primary }} /> Add to {moduleName}</Space>}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ icon: 'fas fa-circle' }}>
        <Form.Item label="Sub-module Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="e.g., List" />
        </Form.Item>
        <Form.Item label="Route" name="route" rules={[{ required: true }]}>
          <Input placeholder="/path" />
        </Form.Item>
        <Form.Item label="Icon" name="icon">
          <Input placeholder="fas fa-circle" />
        </Form.Item>
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading} style={{ background: PURPLE_THEME.primary }}>Add</Button>
        </div>
      </Form>
    </Modal>
  );
};

// 3. Edit Sub-Module Modal (THE FIX)
const EditSubModuleModal = ({ open, subModule, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subModule && open) {
      form.setFieldsValue(subModule);
    }
  }, [subModule, open, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    await onSave(subModule._id, values);
    setLoading(false);
  };

  return (
    <Modal
      title="Edit Sub-module"
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Route" name="route" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Icon" name="icon">
          <Input />
        </Form.Item>
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading} style={{ background: PURPLE_THEME.primary }}>
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// --- DRAWER COMPONENT ---

const ModuleDetailsDrawer = ({ open, module, onClose, onEdit, onDelete, onRestore, perm }) => {
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // State for sub-module editing
  const [editingSubModule, setEditingSubModule] = useState(null);

  useEffect(() => {
    if (module) {
      form.setFieldsValue(module);
    }
  }, [module, form]);

  const handleSaveModule = async (values) => {
    setLoading(true);
    try {
      await moduleService.update(module._id, values);
      showToast('Module updated successfully', 'success');
      setEditMode(false);
      onEdit(); // Refresh
    } catch (err) {
      showErrorAlert('Error', err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubModuleUpdate = async (subId, values) => {
    try {
      await moduleService.updateSub(module._id, subId, values);
      showToast('Sub-module updated successfully', 'success');
      setEditingSubModule(null); // Close modal
      onEdit(); // Refresh
    } catch (err) {
      showErrorAlert('Error', err.response?.data?.message || 'Failed to update sub-module');
    }
  };

  const handleSubModuleDelete = async (subId) => {
    try {
      await moduleService.deleteSub(module._id, subId);
      showToast('Sub-module deleted', 'success');
      onEdit();
    } catch (err) {
      showErrorAlert('Error', 'Failed to delete sub-module');
    }
  };

  const handleSubModuleRestore = async (subId) => {
    try {
      await moduleService.restoreSub(module._id, subId);
      showToast('Sub-module restored', 'success');
      onEdit();
    } catch (err) {
      showErrorAlert('Error', 'Failed to restore sub-module');
    }
  };

  if (!module) return null;

  const activeSubModules = module.subModules?.filter(s => !s.isDeleted) || [];
  const deletedSubModules = module.subModules?.filter(s => s.isDeleted) || [];

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <Avatar size={40} style={{ background: PURPLE_THEME.primaryBg, color: PURPLE_THEME.primary }} icon={<FolderOutlined />} />
            <div>
              <Typography.Title level={5} style={{ margin: 0 }}>{module.name}</Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>{module.route}</Typography.Text>
            </div>
          </div>
        }
        placement="right"
        onClose={onClose}
        open={open}
        width={600}
        extra={
          <Space>
            {!editMode && perm.canEdit && !module.isDeleted && (
              <Button icon={<EditOutlined />} onClick={() => setEditMode(true)}>Edit</Button>
            )}
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
          </Space>
        }
      >
        <div className="flex flex-col h-full">
          {/* Module Settings Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
               <Typography.Title level={5}>Module Settings</Typography.Title>
               <Tag color={module.isDeleted ? 'red' : 'green'}>{module.isDeleted ? 'Deleted' : 'Active'}</Tag>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSaveModule} disabled={!editMode}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Route" name="route" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Icon" name="icon"><Input /></Form.Item>
                </Col>
                <Col span={12}>
                   <Form.Item label="Description" name="description"><Input /></Form.Item>
                </Col>
              </Row>
              {editMode && (
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setEditMode(false)}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={loading} style={{ background: PURPLE_THEME.primary }}>Save Module</Button>
                </div>
              )}
            </Form>
          </div>

          <Divider />

          {/* Sub-modules Section */}
          <div className="flex-1">
             <div className="flex justify-between items-center mb-4">
                <Space>
                  <Typography.Title level={5} style={{ margin: 0 }}>Sub-modules</Typography.Title>
                  <Badge count={activeSubModules.length} style={{ background: PURPLE_THEME.primary }} />
                </Space>
             </div>

             <List
                dataSource={activeSubModules}
                locale={{ emptyText: <Empty description="No active sub-modules" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                renderItem={item => (
                   <List.Item
                      className="hover:bg-gray-50 transition-colors px-2 rounded"
                      actions={[
                         perm.canEdit && (
                            <Tooltip title="Edit">
                               <Button size="small" type="text" icon={<EditOutlined />} onClick={() => setEditingSubModule(item)} />
                            </Tooltip>
                         ),
                         perm.canDelete && (
                            <Popconfirm title="Delete this sub-module?" onConfirm={() => handleSubModuleDelete(item._id)}>
                               <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                         )
                      ]}
                   >
                      <List.Item.Meta
                         avatar={<Avatar size="small" style={{ background: '#f0f0f0', color: '#666' }} icon={<FileTextOutlined />} />}
                         title={<span className="font-medium">{item.name}</span>}
                         description={<span className="text-xs text-gray-400">{item.route}</span>}
                      />
                   </List.Item>
                )}
             />

             {/* Deleted Sub-modules (Collapsed view or separate section) */}
             {deletedSubModules.length > 0 && (
                <div className="mt-6">
                   <Divider orientation="left" style={{ fontSize: '12px', color: '#999' }}>Deleted Items</Divider>
                   <List
                      dataSource={deletedSubModules}
                      size="small"
                      renderItem={item => (
                         <List.Item
                            className="opacity-60 hover:opacity-100 transition-opacity px-2"
                            actions={[
                               <Tooltip title="Restore">
                                  <Button size="small" type="link" icon={<RestOutlined />} onClick={() => handleSubModuleRestore(item._id)} />
                               </Tooltip>
                            ]}
                         >
                            <List.Item.Meta
                               title={<span className="line-through text-gray-500">{item.name}</span>}
                            />
                         </List.Item>
                      )}
                   />
                </div>
             )}
          </div>

          {/* Danger Zone (Footer) */}
          <div className="mt-auto pt-4 border-t">
             {module.isDeleted ? (
                <Popconfirm title="Restore module?" onConfirm={() => onRestore(module._id)}>
                   <Button block type="primary" style={{ background: PURPLE_THEME.success }}>Restore Module</Button>
                </Popconfirm>
             ) : (
                <Popconfirm title="Delete module?" description="Soft delete this module?" onConfirm={() => onDelete(module._id)}>
                   <Button block danger icon={<DeleteOutlined />}>Delete Module</Button>
                </Popconfirm>
             )}
          </div>
        </div>
      </Drawer>

      {/* FIXED: Sub-Module Update Modal */}
      <EditSubModuleModal 
        open={!!editingSubModule}
        subModule={editingSubModule}
        onCancel={() => setEditingSubModule(null)}
        onSave={handleSubModuleUpdate}
      />
    </>
  );
};

// --- MAIN PAGE COMPONENT ---

const Modules = () => {
  const { token, permissions } = useSelector(s => s.auth);
  
  // Permission Logic
  const perm = useMemo(() => {
    const p = permissions?.['Module→All Modules'] ?? {};
    return {
      canView: !!p.canView,
      canAdd: !!p.canAdd,
      canEdit: !!p.canEdit,
      canDelete: !!p.canDelete
    };
  }, [permissions]);

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalResults: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stats
  const stats = useMemo(() => ({
    total: modules.length,
    active: modules.filter(m => !m.isDeleted).length,
    deleted: modules.filter(m => m.isDeleted).length,
    withSubs: modules.filter(m => m.subModules?.length > 0).length
  }), [modules]);

  const fetchModules = useCallback(async (page = 1, limit = 10, search = '') => {
    if (!perm.canView) return;
    setLoading(true);
    try {
      const response = await moduleService.getAll({ page, limit, search });
      const data = response.data || [];
      // Sort: Active first, then by position
      setModules(data.sort((a, b) => a.position - b.position));
      
      const meta = response.pagination || {};
      setPagination({
        currentPage: meta.page || page,
        itemsPerPage: meta.limit || limit,
        totalResults: meta.total || data.length
      });
    } catch (err) {
      showErrorAlert('Error', 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    if (token) fetchModules(1, 10);
  }, [token, fetchModules]);

  // Handlers
  const handlePageChange = (page, pageSize) => fetchModules(page, pageSize, searchQuery);
  
  const handleSearch = (val) => {
    setSearchQuery(val);
    fetchModules(1, pagination.itemsPerPage, val);
  };

  const handleModuleDelete = async (id) => {
    try {
      await moduleService.delete(id);
      showToast('Module deleted', 'success');
      fetchModules(pagination.currentPage, pagination.itemsPerPage, searchQuery);
    } catch (err) {
      showErrorAlert('Error', 'Delete failed');
    }
  };

  const handleModuleRestore = async (id) => {
    try {
      await moduleService.restore(id);
      showToast('Module restored', 'success');
      fetchModules(pagination.currentPage, pagination.itemsPerPage, searchQuery);
    } catch (err) {
      showErrorAlert('Error', 'Restore failed');
    }
  };

  // Columns for Table View
  const columns = useMemo(() => [
    {
      key: 'name', title: 'Module Name',
      render: (val, record) => (
        <Space>
           <Avatar shape="square" size="small" style={{ background: PURPLE_THEME.primaryBg, color: PURPLE_THEME.primary }} icon={<FolderOutlined />} />
           <div>
             <div className="font-medium text-gray-800">{val}</div>
             <div className="text-xs text-gray-400">{record.route}</div>
           </div>
        </Space>
      )
    },
    {
      key: 'subModules', title: 'Sub-modules',
      render: (_, r) => <Badge count={r.subModules?.filter(s => !s.isDeleted).length || 0} style={{ background: PURPLE_THEME.primary }} showZero />
    },
    {
      key: 'isDeleted', title: 'Status',
      render: (val) => <Tag color={val ? 'red' : 'green'}>{val ? 'Deleted' : 'Active'}</Tag>
    },
    {
      key: 'actions', title: 'Actions',
      render: (_, r) => (
        <Space>
          <Tooltip title="View/Edit">
             <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedModule(r); setDetailsOpen(true); }} />
          </Tooltip>
          {perm.canEdit && !r.isDeleted && (
             <Tooltip title="Add Sub">
                <Button size="small" icon={<PlusOutlined />} onClick={() => { setSelectedModule(r); setSubModalOpen(true); }} />
             </Tooltip>
          )}
          {perm.canDelete && (
             r.isDeleted ? 
               <Button size="small" type="text" icon={<RestOutlined />} onClick={() => handleModuleRestore(r._id)} /> :
               <Popconfirm title="Delete?" onConfirm={() => handleModuleDelete(r._id)}>
                  <Button size="small" type="text" danger icon={<DeleteOutlined />} />
               </Popconfirm>
          )}
        </Space>
      )
    }
  ], [perm]);

  if (!perm.canView) return <Alert message="Access Denied" description="You do not have permission to view modules." type="error" showIcon className="m-8" />;

  return (
    <div className="min-h-screen p-6 bg-gray-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Typography.Title level={3} style={{ margin: 0, color: PURPLE_THEME.dark }}>Modules Management</Typography.Title>
          <Typography.Text type="secondary">Manage system modules, routes, and navigation structure.</Typography.Text>
        </div>
        <Space>
          <Tooltip title={view === 'table' ? 'Switch to Grid' : 'Switch to Table'}>
            <Button icon={view === 'table' ? <AppstoreOutlined /> : <UnorderedListOutlined />} onClick={() => setView(prev => prev === 'table' ? 'grid' : 'table')} />
          </Tooltip>
          {perm.canAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)} style={{ background: PURPLE_THEME.primary }}>
              Add Module
            </Button>
          )}
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}><ProCard bodyStyle={{ padding: '16px' }}><Statistic title="Total" value={stats.total} prefix={<FolderOutlined />} /></ProCard></Col>
        <Col xs={12} sm={6}><ProCard bodyStyle={{ padding: '16px' }}><Statistic title="Active" value={stats.active} valueStyle={{ color: PURPLE_THEME.success }} prefix={<InfoCircleOutlined />} /></ProCard></Col>
        <Col xs={12} sm={6}><ProCard bodyStyle={{ padding: '16px' }}><Statistic title="Deleted" value={stats.deleted} valueStyle={{ color: PURPLE_THEME.error }} prefix={<DeleteOutlined />} /></ProCard></Col>
        <Col xs={12} sm={6}><ProCard bodyStyle={{ padding: '16px' }}><Statistic title="With Sub-modules" value={stats.withSubs} valueStyle={{ color: PURPLE_THEME.info }} prefix={<AppstoreOutlined />} /></ProCard></Col>
      </Row>

      {/* Content */}
      <ProCard 
        title={view === 'table' ? "Module List" : "Module Grid"}
        extra={<Input.Search placeholder="Search..." onSearch={handleSearch} style={{ width: 250 }} />}
      >
        {loading && modules.length === 0 ? <Skeleton active /> : (
          view === 'table' ? (
            <CustomTable 
              columns={columns} 
              data={modules} 
              loading={loading}
              currentPage={pagination.currentPage}
              itemsPerPage={pagination.itemsPerPage}
              totalItems={pagination.totalResults}
              onPageChange={handlePageChange}
            />
          ) : (
            <Row gutter={[16, 16]}>
              {modules.map(m => (
                <Col key={m._id} xs={24} sm={12} lg={8} xl={6}>
                  <Card 
                    hoverable 
                    className="h-full flex flex-col"
                    actions={[
                      <EyeOutlined key="view" onClick={() => { setSelectedModule(m); setDetailsOpen(true); }} />,
                      perm.canEdit && !m.isDeleted && <PlusOutlined key="add" onClick={() => { setSelectedModule(m); setSubModalOpen(true); }} />,
                      perm.canDelete && (m.isDeleted ? 
                         <RestOutlined key="restore" onClick={() => handleModuleRestore(m._id)} /> : 
                         <Popconfirm title="Delete?" onConfirm={() => handleModuleDelete(m._id)}><DeleteOutlined key="delete" className="text-red-500" /></Popconfirm>
                      )
                    ]}
                  >
                    <Card.Meta 
                      avatar={<Avatar style={{ background: PURPLE_THEME.primaryBg, color: PURPLE_THEME.primary }} icon={<FolderOutlined />} />}
                      title={<div className="flex justify-between">{m.name} <Tag color={m.isDeleted ? 'red' : 'green'}>{m.isDeleted ? 'Del' : 'Act'}</Tag></div>}
                      description={<div className="truncate">{m.route}</div>}
                    />
                    <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs text-gray-500">
                      <span>Sub-modules:</span>
                      <Badge count={m.subModules?.filter(s => !s.isDeleted).length || 0} style={{ background: PURPLE_THEME.primary }} showZero />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )
        )}
      </ProCard>

      {/* Interactive Components */}
      <CreateModuleModal open={createModalOpen} onCancel={() => setCreateModalOpen(false)} onSuccess={() => fetchModules(1, 10)} />
      
      <CreateSubModuleModal 
        open={subModalOpen} 
        moduleId={selectedModule?._id} 
        moduleName={selectedModule?.name} 
        onCancel={() => setSubModalOpen(false)} 
        onSuccess={() => fetchModules(pagination.currentPage, pagination.itemsPerPage)} 
      />
      
      <ModuleDetailsDrawer 
        open={detailsOpen} 
        module={selectedModule} 
        onClose={() => { setDetailsOpen(false); setSelectedModule(null); }} 
        onEdit={() => fetchModules(pagination.currentPage, pagination.itemsPerPage)}
        onDelete={handleModuleDelete}
        onRestore={handleModuleRestore}
        perm={perm}
      />
    </div>
  );
};

export default Modules;