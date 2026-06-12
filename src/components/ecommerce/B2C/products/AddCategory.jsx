import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Modal, Form, Input, Popconfirm, Card,
  Typography, Avatar, Row, Col, Statistic, Space, Divider, message, notification, Tooltip, Switch, Tag, Upload
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined, EditOutlined, AppstoreOutlined, LoadingOutlined, EyeOutlined
} from '@ant-design/icons';
// 👇 Aapki custom table import kar li hai
import CustomTable from '../../../../components/CMS/pages/custom/CustomTable'; 

const { Title, Text } = Typography;
const { TextArea } = Input;

// Theme colors
const THEME = {
  primary: "#7c3aed", 
  success: "#10b981",
  error: "#ef4444",
};

const AddCategory = () => {
  // Base URL
  const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/products`; 
  const UPLOAD_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [iconLoading, setIconLoading] = useState(false);
  const [iconUrl, setIconUrl] = useState(""); 
  const [previewVisible, setPreviewVisible] = useState(false);
  const [form] = Form.useForm();

  // --- 1. GET ALL CATEGORIES ---
  const fetchCategories = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/get-all-category`, {
        params: { 
            page: page, 
            limit: limit, 
            search: search || undefined
        }
      });
      
      const resData = response.data;
      const rawList = resData?.data || resData || [];
      setCategories(rawList);

      const count = resData?.pagination?.total || resData?.total || rawList.length || 0;
      setTotal(count);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
        fetchCategories(currentPage, pageSize, searchText);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, pageSize, searchText]);

  // --- 2. UPLOAD ICON LOGIC (Fixed for S3 Response) ---
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setIconLoading(true);
    try {
      const response = await axios.post(UPLOAD_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const uploadedUrl = response.data?.file?.url;
      
      if (uploadedUrl) {
        setIconUrl(uploadedUrl);
        message.success("Icon uploaded successfully");
      }
    } catch (err) {
      message.error("Icon upload failed.");
      console.error(err);
    } finally {
      setIconLoading(false);
    }
    return false; 
  };

  // --- 3. GET SINGLE CATEGORY ---
  const fetchCategoryById = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/get-category-by-id`, {
        params: { id: id } 
      });
      const cat = response.data?.data || response.data;
      if (cat) {
        form.setFieldsValue({
          name: cat.name,
          description: cat.description,
          isActive: cat.isActive 
        });
        setIconUrl(cat.icon || "");
        setEditingId(id);
        setModalVisible(true);
      }
    } catch (err) {
      message.error("Failed to fetch category details.");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. CREATE OR UPDATE CATEGORY ---
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        description: values.description,
        isActive: values.isActive || false,
        icon: iconUrl,
      };

      let response;
      if (editingId) {
        response = await axios.post(`${BASE_URL}/edit-category-by-id`, payload, {
          params: { id: editingId } 
        });
      } else {
        response = await axios.post(`${BASE_URL}/create-category`, payload);
      }
      
      if (response.status === 200 || response.status === 201) {
        notification.success({
          message: editingId ? 'Category Updated' : 'Category Created',
          description: `Category "${values.name}" has been successfully saved.`,
          placement: 'topRight'
        });
        closeModal();
        fetchCategories(currentPage, pageSize);
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to save category.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 5. DELETE CATEGORY ---
  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/delete-category-by-id?id=${id}`); 

      if (response.status === 200 || response.status === 204) {
          message.success("Category deleted successfully.");
          fetchCategories(currentPage, pageSize, searchText);
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Deletion failed.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setIconUrl("");
    form.resetFields();
  };

  // Table Columns
  const columns = [
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
      render: (url) => (
        <Avatar 
          shape="square" 
          src={url} 
          icon={!url && <AppstoreOutlined />} 
          style={{ backgroundColor: !url ? '#f5f5f5' : 'transparent', color: THEME.primary }} 
        />
      ),
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      sortable: true, // CustomTable supports this
      render: (text, record) => (
        <Space>
          <Avatar 
            size="small" 
            src={record.icon} 
            icon={!record.icon && <AppstoreOutlined />} 
            style={{ backgroundColor: 'transparent', color: THEME.primary }}
          />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Text type="secondary" title={text}>
             {text || "No description"}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? THEME.success : THEME.error}>
          {isActive ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: THEME.primary }} />} 
              onClick={() => fetchCategoryById(record._id || record.id)}
            />
          </Tooltip>
          
          <Popconfirm 
            title="Delete this category?" 
            onConfirm={() => deleteCategory(record._id || record.id)} 
            okText="Yes, Delete" 
            cancelText="No"
            okButtonProps={{ danger: true, loading: loading }}
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Category Management</Title>
          <Text type="secondary">Manage product categories for your store.</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={() => {
              form.resetFields();
              form.setFieldsValue({ isActive: true }); 
              setModalVisible(true);
          }}
          style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
        >
          Add New Category
        </Button>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
            <Statistic 
              title="Total Categories" 
              value={total} 
              prefix={<AppstoreOutlined style={{ color: THEME.primary }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* 👇 Yahan AntD Table hata kar CustomTable lagayi hai */}
      <CustomTable 
        columns={columns}
        data={categories}
        loading={loading}
        totalItems={total}
        currentPage={currentPage}
        itemsPerPage={pageSize}
        onPageChange={(page, size) => {
          setCurrentPage(page);
          setPageSize(size);
        }}
        onFilter={(filters) => {
          setSearchText(filters.search || '');
          setCurrentPage(1); // Jab bhi kuch search ho, page 1 par reset karo
        }}
      />

      <Modal
        title={<div className="font-bold text-lg">{editingId ? <EditOutlined /> : <PlusOutlined />} {editingId ? 'Edit Category' : 'Create Category'}</div>}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        centered
        destroyOnClose
        width={500}
      >
        <Divider style={{ margin: '10px 0 25px 0' }} />
        
        <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleSave} 
            initialValues={{ isActive: true }}
        >
          <Form.Item label="Category Icon">
            <div className="flex items-center gap-4">
              <Upload
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={handleUpload}
              >
                {iconUrl ? (
                  <div className="relative w-full h-full group">
                    <img src={iconUrl} alt="icon" className="w-full h-full object-cover rounded-lg" />
                    {/* Hover Icons: Eye and Trash */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3 rounded-lg">
                      <EyeOutlined className="text-white text-lg cursor-pointer" onClick={(e) => { e.stopPropagation(); setPreviewVisible(true); }} />
                      <DeleteOutlined className="text-red-500 text-lg cursor-pointer" onClick={(e) => { e.stopPropagation(); setIconUrl(""); }} />
                    </div>
                  </div>
                ) : (
                  <div>
                    {iconLoading ? <LoadingOutlined /> : <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </div>
          </Form.Item>

          <Form.Item 
            name="name" 
            label="Category Name" 
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input prefix={<AppstoreOutlined />} placeholder="e.g. ELECTRONICS" size="large" />
          </Form.Item>

          <Form.Item 
            name="description" 
            label="Description" 
            rules={[{ required: false, message: 'Please enter description' }]}
          >
            <TextArea 
                rows={4} 
                placeholder="e.g. All types of home and office furniture..." 
                maxLength={300}
                showCount
            />
          </Form.Item>

          <Form.Item 
            name="isActive" 
            label="Status" 
            valuePropName="checked" 
          >
            <Switch 
                checkedChildren="Active" 
                unCheckedChildren="Inactive" 
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={closeModal}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              size="large"
              style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
            >
              {editingId ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)} centered>
        <img alt="preview" className="w-full h-auto" src={iconUrl} />
      </Modal>
    </div>
  );
};

export default AddCategory;