// src/pages/admin/CategoryFreelancers.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Button,
  Drawer,
  Switch,
  Space,
  Tag,
  Tooltip,
  Typography,
  Divider,
  Row,
  Col,
  Alert,
  Avatar,
  Popconfirm,
  Input,
  Form,
  Modal,
  Select,
  Tabs,
  Descriptions,
  Statistic,
  Radio
} from 'antd';

import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,DeleteOutlined
} from '@ant-design/icons';

import {
  FiTrash2,
  FiLayers,
  FiTag,
  FiArchive,
  FiRefreshCw
} from 'react-icons/fi';

// Icons Import
import {
  FaLaptopCode, FaMobileAlt, FaPaintBrush, FaBullhorn, FaCamera, FaPenFancy,
  FaVideo, FaChartLine, FaCogs, FaHeadset, FaShieldAlt, FaWordpress, FaReact,
  FaNodeJs, FaPython, FaDatabase, FaCloud, FaShoppingCart, FaUsers, FaBriefcase,
  FaLightbulb, FaRocket, FaStar, FaHeart, FaCertificate
} from 'react-icons/fa';

import CustomTable from '../../../../../../../components/CMS/pages/custom/CustomTable';
import { apiService } from '../../../../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../../../../manageApi/utils/toast';
import { showConfirmDialog, showSuccessAlert, showErrorAlert } from '../../../../../../../manageApi/utils/sweetAlert';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

// --- THEME ---
const PURPLE_THEME = {
  primary: '#722ed1',
  primaryLight: '#9254de',
  primaryBg: '#f9f0ff',
  dark: '#1f2937'
};

const iconOptions = [
  { value: 'FaLaptopCode', label: 'Web Development', icon: <FaLaptopCode /> },
  { value: 'FaMobileAlt', label: 'Mobile App', icon: <FaMobileAlt /> },
  { value: 'FaPaintBrush', label: 'Graphic Design', icon: <FaPaintBrush /> },
  { value: 'FaBullhorn', label: 'Digital Marketing', icon: <FaBullhorn /> },
  { value: 'FaCamera', label: 'Photography', icon: <FaCamera /> },
  { value: 'FaPenFancy', label: 'Content Writing', icon: <FaPenFancy /> },
  { value: 'FaVideo', label: 'Video Editing', icon: <FaVideo /> },
  { value: 'FaChartLine', label: 'SEO', icon: <FaChartLine /> },
  { value: 'FaCogs', label: 'Automation', icon: <FaCogs /> },
  { value: 'FaHeadset', label: 'Virtual Assistant', icon: <FaHeadset /> },
  { value: 'FaShieldAlt', label: 'Cybersecurity', icon: <FaShieldAlt /> },
  { value: 'FaWordpress', label: 'WordPress', icon: <FaWordpress /> },
  { value: 'FaReact', label: 'React.js', icon: <FaReact /> },
  { value: 'FaNodeJs', label: 'Node.js', icon: <FaNodeJs /> },
  { value: 'FaPython', label: 'Python', icon: <FaPython /> },
  { value: 'FaDatabase', label: 'Database', icon: <FaDatabase /> },
  { value: 'FaCloud', label: 'Cloud Services', icon: <FaCloud /> },
  { value: 'FaShoppingCart', label: 'E-commerce', icon: <FaShoppingCart /> },
  { value: 'FaUsers', label: 'Customer Support', icon: <FaUsers /> },
  { value: 'FaBriefcase', label: 'Business Consulting', icon: <FaBriefcase /> },
  { value: 'FaLightbulb', label: 'Strategy & Ideas', icon: <FaLightbulb /> },
  { value: 'FaRocket', label: 'Startup Services', icon: <FaRocket /> },
  { value: 'FaStar', label: 'Premium Service', icon: <FaStar /> },
  { value: 'FaHeart', label: 'Branding', icon: <FaHeart /> },
  { value: 'FaCertificate', label: 'Certified Expert', icon: <FaCertificate /> },
];

// Helper to render icon
const getIconComponent = (iconName) => {
  const map = {
    FaLaptopCode, FaMobileAlt, FaPaintBrush, FaBullhorn, FaCamera, FaPenFancy,
    FaVideo, FaChartLine, FaCogs, FaHeadset, FaShieldAlt, FaWordpress, FaReact,
    FaNodeJs, FaPython, FaDatabase, FaCloud, FaShoppingCart, FaUsers, FaBriefcase,
    FaLightbulb, FaRocket, FaStar, FaHeart, FaCertificate,
  };
  const Icon = map[iconName];
  return Icon ? <Icon /> : <FaLaptopCode />;
};

// --- MODAL: CREATE CATEGORY ---
const CreateCategoryModal = ({ open, onCancel, onSuccess, isSubcategory = false, parentCategory = null }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeCategories, setActiveCategories] = useState([]);

  useEffect(() => {
    if (isSubcategory && open) {
      fetchActiveCategories();
    }
  }, [isSubcategory, open]);

  const fetchActiveCategories = async () => {
    try {
      // Fetch only active categories for the parent dropdown
      const res = await apiService.get('/freelancer/category', { active: true, is_deleted: false, limit: 100 });
      setActiveCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching active categories:', err);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        icon: values.icon || 'FaLaptopCode',
        is_active: true
      };
      
      if (isSubcategory && values.category) {
        payload.category = values.category;
      }
      
      const endpoint = isSubcategory ? '/freelancer/subcategory' : '/freelancer/category';
      await apiService.post(endpoint, payload);
      
      showSuccessAlert('Success', `${isSubcategory ? 'Subcategory' : 'Category'} created successfully`);
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to create ${isSubcategory ? 'subcategory' : 'category'}`;
      showErrorAlert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-purple-700">
          <PlusOutlined />
          <span>Create New {isSubcategory ? 'Subcategory' : 'Category'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ icon: 'FaLaptopCode' }}
      >
        {isSubcategory && (
          <Form.Item
            name="category"
            label="Parent Category"
            rules={[{ required: true, message: 'Please select a parent category' }]}
            initialValue={parentCategory}
          >
            <Select
              placeholder="Select parent category"
              showSearch
              optionFilterProp="children"
            >
              {activeCategories.map(cat => (
                <Option key={cat._id} value={cat._id}>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-600">{getIconComponent(cat.icon)}</span>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter name' }]}
        >
          <Input placeholder={`e.g., ${isSubcategory ? 'React.js Development' : 'Web Development'}`} />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={3} placeholder="Describe this service category..." showCount maxLength={200} />
        </Form.Item>

        <Form.Item
          name="icon"
          label="Icon"
          rules={[{ required: true, message: 'Please select an icon' }]}
        >
          <Select
            showSearch
            optionLabelProp="label"
            placeholder="Select an icon"
          >
            {iconOptions.map(opt => (
              <Option key={opt.value} value={opt.value} label={opt.label}>
                <div className="flex items-center gap-3 py-1">
                  <span className="text-purple-600 text-lg">{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Divider />

        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary }}
          >
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// --- DRAWER: CATEGORY DETAILS (Handles Edit, Delete, Restore) ---
const CategoryDetailsDrawer = ({ open, category, onClose, onEdit, onSuccess, isSubcategory = false }) => {
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description || '',
        icon: category.icon || 'FaLaptopCode',
        is_active: category.is_active !== undefined ? category.is_active : true
      });
    }
    setEditMode(false); // Reset edit mode when opening new category
  }, [category, form, open]);

  // Handle Update
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const endpoint = isSubcategory ? '/freelancer/subcategory' : '/freelancer/category';
      await apiService.put(`${endpoint}/${category._id}`, values);
      showToast(`${isSubcategory ? 'Subcategory' : 'Category'} updated successfully`, 'success');
      setEditMode(false);
      onSuccess(); // Refresh table
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to update`;
      showErrorAlert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Soft Delete
  const handleDelete = async () => {
    try {
      const result = await showConfirmDialog(
        'Confirm Delete',
        `Are you sure you want to delete this ${isSubcategory ? 'subcategory' : 'category'}? It will be moved to trash.`,
        'Delete'
      );
      if (result) {
        setLoading(true);
        const endpoint = isSubcategory ? '/freelancer/subcategory' : '/freelancer/category';
        // Backend expects DELETE request for soft delete
        await apiService.delete(`${endpoint}/${category._id}`);
        
        showToast(`Deleted successfully`, 'success');
        onSuccess();
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete';
      showErrorAlert('Operation Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Restore
  const handleRestore = async () => {
    try {
      const result = await showConfirmDialog(
        'Confirm Restore',
        `Do you want to restore this ${isSubcategory ? 'subcategory' : 'category'} from trash?`,
        'Restore'
      );
      if (result) {
        setLoading(true);
        const endpoint = isSubcategory ? '/freelancer/subcategory' : '/freelancer/category';
        // Backend expects PUT request to /restore endpoint
        await apiService.put(`${endpoint}/${category._id}/restore`);
        
        showToast(`Restored successfully`, 'success');
        onSuccess();
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to restore';
      showErrorAlert('Operation Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  if (!category) return null;

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3">
          <Avatar 
            size={40}
            style={{ background: PURPLE_THEME.primaryBg, color: PURPLE_THEME.primary }}
            icon={getIconComponent(category.icon)}
          />
          <div>
            <div className="font-bold text-gray-800">{category.name}</div>
            <div className="text-xs text-gray-500">{isSubcategory ? 'Subcategory' : 'Category'} Details</div>
          </div>
        </div>
      }
      onClose={onClose}
      open={open}
      width={600}
      extra={
        <Space>
          {!editMode && !category.is_deleted && (
            <Button icon={<EditOutlined />} onClick={() => setEditMode(true)}>Edit</Button>
          )}
        </Space>
      }
    >
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
            <div>
                <span className="text-gray-500 text-sm">Current Status</span>
                <div className="font-medium mt-1">
                    {category.is_deleted ? <Tag color="red">TRASHED</Tag> : category.is_active ? <Tag color="green">ACTIVE</Tag> : <Tag color="orange">INACTIVE</Tag>}
                </div>
            </div>
            <div className="text-right">
                 <span className="text-gray-500 text-sm">Created Date</span>
                 <div className="font-medium mt-1">{new Date(category.created_at || category.createdAt).toLocaleDateString()}</div>
            </div>
        </div>

        {/* Edit Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          disabled={!editMode || loading}
        >
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Icon" name="icon">
            <Select showSearch optionLabelProp="label">
              {iconOptions.map(opt => (
                <Option key={opt.value} value={opt.value} label={opt.label}>
                   <div className="flex items-center gap-2"><span className="text-purple-600">{opt.icon}</span> {opt.label}</div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Status Switch (Only show if not deleted) */}
          {!category.is_deleted && (
            <Form.Item label="Active Status" name="is_active" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          )}

          {editMode && (
            <div className="flex justify-end gap-2">
              <Button onClick={() => setEditMode(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading} style={{ background: PURPLE_THEME.primary }}>Save Changes</Button>
            </div>
          )}
        </Form>

        {/* Info */}
        <Divider orientation="left"><span className="text-gray-400 text-sm">System Information</span></Divider>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="ID">{category._id}</Descriptions.Item>
          {isSubcategory && category.category && (
            <Descriptions.Item label="Parent Category">
                <Tag color="purple">{category.category?.name || 'Unknown'}</Tag>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Danger Zone: Delete or Restore */}
        <div className={`mt-8 p-4 border rounded-lg ${category.is_deleted ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
             <div className={`font-bold mb-2 ${category.is_deleted ? 'text-green-700' : 'text-red-700'}`}>
                {category.is_deleted ? 'Recovery Zone' : 'Danger Zone'}
             </div>
             <div className="flex gap-3">
                {category.is_deleted ? (
                     <Popconfirm title="Restore item?" description="It will become active again." onConfirm={handleRestore}>
                        <Button type="primary" className="bg-green-600 hover:bg-green-500 border-none" icon={<FiRefreshCw />}>Restore Item</Button>
                     </Popconfirm>
                ) : (
                    <Popconfirm title="Delete item?" description="Item will be moved to trash" onConfirm={handleDelete}>
                        <Button danger icon={<DeleteOutlined />}>Delete Item</Button>
                    </Popconfirm>
                )}
             </div>
        </div>
      </div>
    </Drawer>
  );
};

// --- MAIN COMPONENT ---
const CategoryFreelancers = () => {
  const { token } = useSelector(s => s.auth);

  // Data State
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState('categories'); // 'categories', 'subcategories', 'trash'
  const [trashViewType, setTrashViewType] = useState('categories'); // 'categories' or 'subcategories' (only inside trash tab)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoriesFilter, setActiveCategoriesFilter] = useState([]); // For dropdown filter
  const [categoryFilter, setCategoryFilter] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalItems: 0 });

  // --- API CALLS ---

  // Used for the "Filter by Parent Category" dropdown
  const fetchFilterCategories = useCallback(async () => {
    try {
      const res = await apiService.get('/freelancer/category', { active: true, is_deleted: false, limit: 100 });
      setActiveCategoriesFilter(res.data || []);
    } catch (e) { console.error(e); }
  }, []);

  const fetchData = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      // Determine what we are fetching
      let type = activeTab;
      let isDeleted = false;

      if (activeTab === 'trash') {
        type = trashViewType; // 'categories' or 'subcategories' based on toggle
        isDeleted = true;
      } else {
        isDeleted = false; // Regular tabs show active/inactive but NOT deleted
      }

      const endpoint = type === 'categories' ? '/freelancer/category' : '/freelancer/subcategory';
      
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        is_deleted: isDeleted, // Pass boolean or string depending on backend (controller handles string 'true')
        category: (type === 'subcategories' && categoryFilter) ? categoryFilter : undefined
      };

      const res = await apiService.get(endpoint, params);
      
      const dataList = res.data || [];
      const pgn = res.pagination || { page: 1, limit: 10, total: 0 };

      if (type === 'categories') {
        setCategories(dataList);
      } else {
        setSubcategories(dataList);
      }

      setPagination({
        currentPage: pgn.page,
        itemsPerPage: pgn.limit,
        totalItems: pgn.total
      });

    } catch (err) {
      showErrorAlert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, trashViewType, searchQuery, categoryFilter]);

  // --- EFFECTS ---

  useEffect(() => {
    if (token) {
      fetchFilterCategories();
      fetchData(1, 10);
    }
  }, [token, activeTab, trashViewType, searchQuery, categoryFilter]); // Reload on any filter change

  // --- HANDLERS ---
  
  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchQuery('');
    setCategoryFilter(null);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // If switching to trash, default to categories view inside trash
    if (key === 'trash') {
        setTrashViewType('categories');
    }
  };

  const handleTrashTypeChange = (e) => {
    setTrashViewType(e.target.value);
    setSearchQuery('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page, pageSize) => {
    fetchData(page, pageSize);
  };

  const refreshData = () => {
    fetchData(pagination.currentPage, pagination.itemsPerPage);
  };

  // --- COLUMNS ---
  const getColumns = () => {
    const isSub = (activeTab === 'subcategories') || (activeTab === 'trash' && trashViewType === 'subcategories');
    
    return [
      {
        key: 'icon',
        title: 'Icon',
        width: 80,
        render: (_, item) => (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border ${item.is_deleted ? 'bg-red-50 text-red-400 border-red-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
            {getIconComponent(item.icon)}
          </div>
        ),
      },
      {
        key: 'name',
        title: 'Name & Details',
        render: (_, item) => (
          <div>
            <div className={`font-semibold ${item.is_deleted ? 'text-gray-500' : 'text-gray-800'}`}>
                {item.name} {item.is_deleted && <span className="text-red-500 text-xs ml-2">(Deleted)</span>}
            </div>
            <div className="text-xs text-gray-500 line-clamp-1">{item.description || "No description"}</div>
            
            {/* Show Parent Category Tag for Subcategories */}
            {isSub && item.category && (
              <Tag color="purple" className="mt-1 text-[10px] border-0 bg-purple-50 text-purple-700">
                 In: {item.category?.name || "Unknown"}
              </Tag>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        title: 'Status',
        width: 120,
        render: (_, item) => (
          <Tag color={item.is_deleted ? 'red' : item.is_active ? 'green' : 'orange'}>
            {item.is_deleted ? 'TRASHED' : item.is_active ? 'ACTIVE' : 'INACTIVE'}
          </Tag>
        )
      },
      {
        key: 'actions',
        title: '',
        width: 100,
        render: (_, item) => (
          <Space>
            <Tooltip title={item.is_deleted ? "View & Restore" : "View & Edit"}>
                <Button 
                    type="text" 
                    icon={<EyeOutlined style={{ color: PURPLE_THEME.primary }} />} 
                    onClick={() => { setSelectedCategory(item); setDetailsOpen(true); }}
                />
            </Tooltip>
          </Space>
        ),
      },
    ];
  };

  const currentData = activeTab === 'categories' || (activeTab === 'trash' && trashViewType === 'categories') 
    ? categories 
    : subcategories;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
         <div>
            <Title level={3} style={{ margin: 0, color: PURPLE_THEME.dark }}>Service Categories</Title>
            <Text type="secondary">Manage freelancer services structure</Text>
         </div>
         <Space>
            {activeTab !== 'trash' && (
                <Button 
                    type="primary" 
                    size="large" 
                    icon={<PlusOutlined />} 
                    style={{ background: PURPLE_THEME.primary }}
                    onClick={() => setCreateModalOpen(true)}
                >
                    Add {activeTab === 'subcategories' ? 'Subcategory' : 'Category'}
                </Button>
            )}
         </Space>
      </div>

      {/* TABS (Main Navigation) */}
      <Card bodyStyle={{ padding: 0 }} className="overflow-hidden shadow-sm mb-4">
         <Tabs 
           activeKey={activeTab} 
           onChange={handleTabChange} 
           type="card" 
           size="large"
           tabBarStyle={{ margin: 0, background: '#fff', borderBottom: '1px solid #f0f0f0' }}
         >
            <TabPane tab={<span className="px-4"><FiLayers className="inline mr-2"/>Categories</span>} key="categories" />
            <TabPane tab={<span className="px-4"><FiTag className="inline mr-2"/>Subcategories</span>} key="subcategories" />
            <TabPane tab={<span className="px-4 text-red-500"><FiTrash2 className="inline mr-2"/>Trash Bin</span>} key="trash" />
         </Tabs>
      </Card>

      {/* FILTER BAR / TRASH TOGGLE */}
      <Card bodyStyle={{ padding: '16px' }} className="mb-4 shadow-sm border-t-0">
         <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center flex-1">
               
               {/* Trash View Switcher */}
               {activeTab === 'trash' && (
                   <Radio.Group value={trashViewType} onChange={handleTrashTypeChange} buttonStyle="solid">
                      <Radio.Button value="categories">Deleted Categories</Radio.Button>
                      <Radio.Button value="subcategories">Deleted Subcategories</Radio.Button>
                   </Radio.Group>
               )}

               {/* Parent Category Filter (Only for subcategories view) */}
               {((activeTab === 'subcategories') || (activeTab === 'trash' && trashViewType === 'subcategories')) && (
                   <Select 
                       placeholder="Filter by Parent Category" 
                       style={{ width: 220 }}
                       allowClear
                       value={categoryFilter}
                       onChange={setCategoryFilter}
                   >
                       {activeCategoriesFilter.map(c => (
                           <Option key={c._id} value={c._id}>{c.name}</Option>
                       ))}
                   </Select>
               )}
            </div>

            {activeTab === 'trash' && (
                 <Alert type="warning" message="Items in trash can be restored or will be permanently deleted eventually." showIcon className="py-1" />
            )}
         </div>
      </Card>

      {/* TABLE */}
      <Card bodyStyle={{ padding: 0 }} className="shadow-sm">
         <CustomTable 
           columns={getColumns()}
           data={currentData}
           loading={loading}
           totalItems={pagination.totalItems}
           currentPage={pagination.currentPage}
           itemsPerPage={pagination.itemsPerPage}
           onPageChange={handlePageChange}
         />
      </Card>

      {/* CREATE MODAL */}
      <CreateCategoryModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={refreshData}
        isSubcategory={activeTab === 'subcategories'}
      />
      
      {/* DETAILS DRAWER (Edit/Delete/Restore) */}
      <CategoryDetailsDrawer
        open={detailsOpen}
        category={selectedCategory}
        onClose={() => { setDetailsOpen(false); setSelectedCategory(null); }}
        onSuccess={refreshData}
        isSubcategory={
            activeTab === 'subcategories' || 
            (activeTab === 'trash' && trashViewType === 'subcategories')
        }
      />

    </div>
  );
};

export default CategoryFreelancers;