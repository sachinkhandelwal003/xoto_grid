// src/components/CMS/pages/materials/AddMaterial.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button,
  Input,
  Modal,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Tabs,
  Space,
  Tooltip,
  Typography,
  Divider,
  Form
} from 'antd';
import {
  ArrowLeftOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  RotateLeftOutlined,
  PlusOutlined,
  RestOutlined,
  CheckCircleOutlined,
  BgColorsOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../../../CMS/pages/custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from '../../../../manageApi/utils/sweetAlert';

const { TextArea } = Input;
const { Title, Text } = Typography;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1", // Purple
  secondary: "#1890ff", // Blue
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const AddMaterial = () => {
  const navigate = useNavigate();

  // --- STATES ---
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  // Data State
  const [materials, setMaterials] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Filter & Pagination
  const [filters, setFilters] = useState({ search: '', status: 1 });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalResults: 0,
  });

  // --- API CALLS ---
  const fetchMaterials = useCallback(
    async (page = 1, itemsPerPage = 10, currentFilters = filters) => {
      setLoadingTable(true);
      try {
        const params = {
          page,
          limit: itemsPerPage,
          status: currentFilters.status,
        };
        if (currentFilters.search) params.search = currentFilters.search;

        const response = await apiService.get('/materials', params);

        setMaterials(response.materials || []);
        setPagination({
          currentPage: response.pagination?.page || 1,
          itemsPerPage: response.pagination?.limit || 10,
          totalResults: response.pagination?.total || 0,
        });
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to fetch materials');
        setMaterials([]);
      } finally {
        setLoadingTable(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMaterials(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [refreshTrigger, fetchMaterials, filters]);

  // --- HANDLERS ---
  const handleTabChange = (key) => {
    setActiveTab(key);
    const newStatus = key === 'active' ? 1 : 0;
    const newFilters = { ...filters, status: newStatus };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchMaterials(1, pagination.itemsPerPage, newFilters);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchMaterials(1, pagination.itemsPerPage, newFilters);
  };

  const handlePageChange = (page, itemsPerPage) => {
    fetchMaterials(page, itemsPerPage, filters);
  };

  // --- CRUD ACTIONS ---
  const handleAddSubmit = async (values) => {
    setIsLoadingForm(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || '',
        properties: values.properties?.filter(p => p?.trim()) || [],
      };

      await apiService.post('/materials', payload);
      showSuccessAlert('Success', 'Material created successfully');
      
      setIsAddModalOpen(false);
      addForm.resetFields();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      showErrorAlert('Error', error.response?.data?.message || 'Failed to create material');
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleEditSubmit = async (values) => {
    setIsLoadingForm(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || '',
        properties: values.properties?.filter(p => p?.trim()) || [],
      };

      await apiService.put(`/materials/${selectedMaterial._id}`, payload);
      showSuccessAlert('Success', 'Material updated successfully');
      
      setShowEditModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      showErrorAlert('Error', error.response?.data?.message || 'Failed to update material');
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleSoftDelete = async (materialId) => {
    const result = await showConfirmDialog(
      'Move to Trash?',
      'This material will be deactivated.',
      'Yes, Trash it'
    );
    if (result.isConfirmed) {
      try {
        await apiService.delete(`/materials/${materialId}`);
        showSuccessAlert('Moved to Trash', 'Material has been deactivated.');
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        showErrorAlert('Error', 'Failed to trash material');
      }
    }
  };

  const handleRestore = async (materialId) => {
    const result = await showConfirmDialog(
      'Restore Material?',
      'This will reactivate the material.',
      'Yes, Restore'
    );
    if (result.isConfirmed) {
      try {
        await apiService.post(`/materials/${materialId}/restore`);
        showSuccessAlert('Restored', 'Material is active again.');
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        showErrorAlert('Error', 'Failed to restore material');
      }
    }
  };

  // --- MODAL OPENERS ---
  const openEditModal = (item) => {
    setSelectedMaterial(item);
    editForm.setFieldsValue({
      name: item.name,
      description: item.description,
      properties: item.properties && item.properties.length > 0 ? item.properties : [''],
    });
    setShowEditModal(true);
  };

  // --- COLUMNS ---
  const columns = useMemo(() => [
    {
      key: 'name',
      title: 'Material Name',
      render: (text) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      key: 'description',
      title: 'Description',
      width: 300,
      render: (v) => <div className="truncate w-64 text-gray-500" title={v}>{v || '--'}</div>
    },
    {
      key: 'properties',
      title: 'Properties',
      render: (properties) => (
        <div className="flex flex-wrap gap-1">
          {properties && properties.length > 0 ? (
            properties.map((prop, index) => (
              <span key={index} className="px-2 py-1 text-xs rounded bg-purple-50 text-purple-700 border border-purple-100">
                {prop}
              </span>
            ))
          ) : (
            <span className="text-gray-400">--</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      title: 'Created',
      render: (v) => {
        if (!v) return <span className="text-gray-400">--</span>;
        const date = new Date(v);
        return isNaN(date.getTime()) ? (
            <span className="text-gray-400">--</span>
        ) : (
            <span className="text-gray-500 text-xs">{format(date, 'dd MMM yyyy')}</span>
        );
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, r) => (
        <Space>
          <Tooltip title="View">
            <Button 
                shape="circle" 
                icon={<EyeOutlined style={{ color: THEME.primary }} />} 
                onClick={() => { setSelectedMaterial(r); setShowViewModal(true); }}
            />
          </Tooltip>
          
          {activeTab === 'active' ? (
            <>
              <Tooltip title="Edit">
                <Button 
                    shape="circle" 
                    icon={<EditOutlined style={{ color: THEME.secondary }} />} 
                    onClick={() => openEditModal(r)}
                />
              </Tooltip>
              <Tooltip title="Trash">
                <Button 
                    shape="circle" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleSoftDelete(r._id)}
                />
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Restore">
                <Button 
                    shape="circle" 
                    icon={<RotateLeftOutlined style={{ color: THEME.success }} />} 
                    onClick={() => handleRestore(r._id)}
                    className="border-green-500"
                />
            </Tooltip>
          )}
        </Space>
      )
    }
  ], [activeTab]);

  // --- TAB CONFIG ---
  const tabItems = [
    { key: 'active', label: <span><BgColorsOutlined /> Active Materials</span> },
    { key: 'trashed', label: <span><DeleteOutlined /> Trashed</span> },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* 1. Header & Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
               
                <div>
                    <Title level={3} style={{ margin: 0 }}>Materials Management</Title>
                    <Text type="secondary">Define materials and their properties.</Text>
                </div>
            </div>
            <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
                onClick={() => setIsAddModalOpen(true)}
            >
                Add Material
            </Button>
        </div>

        <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
                    <Statistic 
                        title="Total Materials" 
                        value={pagination.totalResults} 
                        prefix={<UnorderedListOutlined style={{ color: THEME.primary }} />} 
                    />
                </Card>
            </Col>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.success }}>
                    <Statistic 
                        title="Active Materials" 
                        value={activeTab === 'active' ? pagination.totalResults : '--'} 
                        prefix={<CheckCircleOutlined style={{ color: THEME.success }} />} 
                    />
                </Card>
            </Col>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.error }}>
                    <Statistic 
                        title="Trashed Materials" 
                        value={activeTab === 'trashed' ? pagination.totalResults : '--'} 
                        prefix={<RestOutlined style={{ color: THEME.error }} />} 
                    />
                </Card>
            </Col>
        </Row>
      </div>

      {/* 2. Main Content */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
       
        <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            type="card"
            size="large"
            tabBarStyle={{ margin: 0, paddingLeft: 16, paddingTop: 16, background: '#fafafa' }}
            items={tabItems}
        />

        <div className="p-0">
            <CustomTable
                columns={columns}
                data={materials}
                loading={loadingTable}
                totalItems={pagination.totalResults}
                currentPage={pagination.currentPage}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
            />
        </div>
      </Card>

      {/* 3. ADD MATERIAL MODAL */}
      <Modal
        title={
            <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <PlusOutlined style={{ color: THEME.primary }} /> Add New Material
            </div>
        }
        open={isAddModalOpen}
        onCancel={() => { setIsAddModalOpen(false); addForm.resetFields(); }}
        footer={null}
        width={600}
        destroyOnClose
        centered
      >
        <Divider className="my-4" />
        <Form form={addForm} onFinish={handleAddSubmit} layout="vertical" initialValues={{ properties: [''] }}>
            <Form.Item name="name" label="Material Name" rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. Cotton" />
            </Form.Item>

            <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Describe the material..." />
            </Form.Item>

            <Form.List name="properties">
                {(fields, { add, remove }) => (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-gray-700 font-medium">Properties</label>
                            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">Add</Button>
                        </div>
                        {fields.map((field, index) => (
                            <div key={field.key} className="flex gap-2 mb-2">
                                <Form.Item
                                    {...field}
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[{ required: true, whitespace: true, message: "Required" }]}
                                    noStyle
                                >
                                    <Input placeholder="Property (e.g. Durable)" />
                                </Form.Item>
                                {fields.length > 1 && (
                                    <Button 
                                        type="text" 
                                        danger 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => remove(field.name)} 
                                    />
                                )}
                            </div>
                        ))}
                    </>
                )}
            </Form.List>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button size="large" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={isLoadingForm}
                    size="large"
                    style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
                >
                    Create Material
                </Button>
            </div>
        </Form>
      </Modal>

      {/* 4. EDIT MATERIAL MODAL */}
      <Modal
        title={
            <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <EditOutlined style={{ color: THEME.secondary }} /> Edit Material
            </div>
        }
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
        width={600}
        destroyOnClose
        centered
      >
        <Divider className="my-4" />
        <Form form={editForm} onFinish={handleEditSubmit} layout="vertical">
            <Form.Item name="name" label="Material Name" rules={[{ required: true }]}>
                <Input size="large" />
            </Form.Item>

            <Form.Item name="description" label="Description">
                <TextArea rows={3} />
            </Form.Item>

            <Form.List name="properties">
                {(fields, { add, remove }) => (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-gray-700 font-medium">Properties</label>
                            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">Add</Button>
                        </div>
                        {fields.map((field, index) => (
                            <div key={field.key} className="flex gap-2 mb-2">
                                <Form.Item
                                    {...field}
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[{ required: true, whitespace: true, message: "Required" }]}
                                    noStyle
                                >
                                    <Input placeholder="Property" />
                                </Form.Item>
                                {fields.length > 1 && (
                                    <Button 
                                        type="text" 
                                        danger 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => remove(field.name)} 
                                    />
                                )}
                            </div>
                        ))}
                    </>
                )}
            </Form.List>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button size="large" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={isLoadingForm}
                    size="large"
                    style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
                >
                    Update Material
                </Button>
            </div>
        </Form>
      </Modal>

      {/* 5. VIEW MODAL */}
      <Modal
        title="Material Details"
        open={showViewModal}
        onCancel={() => setShowViewModal(false)}
        footer={[<Button key="close" onClick={() => setShowViewModal(false)}>Close</Button>]}
        centered
      >
        {selectedMaterial && (
            <div>
                <Title level={4} style={{ margin: 0 }}>{selectedMaterial.name}</Title>
                <Divider />
                
                <div className="space-y-4">
                    <div>
                        <Text strong className="block text-gray-600">Description:</Text>
                        <p className="text-gray-700">{selectedMaterial.description || 'No description provided.'}</p>
                    </div>
                    <div>
                        <Text strong className="block text-gray-600 mb-2">Properties:</Text>
                        <div className="flex flex-wrap gap-2">
                            {selectedMaterial.properties && selectedMaterial.properties.length > 0 ? (
                                selectedMaterial.properties.map((prop, idx) => (
                                    <Tag key={idx} color="purple">{prop}</Tag>
                                ))
                            ) : (
                                <Text type="secondary">No properties listed.</Text>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-400 pt-4 border-t">
                        <span>Created: {format(new Date(selectedMaterial.created_at || new Date()), 'dd MMM yyyy')}</span>
                    </div>
                </div>
            </div>
        )}
      </Modal>

    </div>
  );
};

export default AddMaterial;