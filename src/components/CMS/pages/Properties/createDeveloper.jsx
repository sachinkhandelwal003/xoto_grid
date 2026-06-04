import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Button, Modal, Form, Input, Popconfirm, Card, Table,
  Typography, Avatar, Row, Col, Statistic, Space, Divider, message, notification, Tooltip, Grid, Switch, Upload, Select
} from 'antd';
import {
  PlusOutlined, UserOutlined, MailOutlined, PhoneOutlined,
  DeleteOutlined, EditOutlined, SearchOutlined, UsergroupAddOutlined, GlobalOutlined, 
  CheckOutlined, CloseOutlined, LockOutlined, HomeOutlined, EnvironmentOutlined, LinkOutlined, NumberOutlined, LoadingOutlined, EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { TextArea } = Input;
const { Option } = Select;

const THEME = {
  primary: "#7c3aed", 
  success: "#10b981",
  error: "#ef4444",
};

// Defined Country Codes
const COUNTRY_CODES = [
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+91', country: 'IND', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+966', country: 'KSA', flag: '🇸🇦' },
];

const CreateDeveloper = () => {

  
  const screens = useBreakpoint();

  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  
  // --- Upload & Preview States ---
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false); 
  const [previewImage, setPreviewImage] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [form] = Form.useForm();

  // --- 1. GET ALL DEVELOPERS ---
  const fetchDevelopers = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const response = await apiService.get(
  "/property/get-all-developers",
  {
    page,
    limit,
    search: search || undefined
  }
);
      
      const resData = response;
      const rawList = resData?.data || resData || [];
      setDevelopers(rawList);

      const count = resData?.pagination?.total || resData?.total || rawList.length || 0;
      setTotal(count);
      
    } catch (err) {
      message.error("Failed to load developers list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
        fetchDevelopers(currentPage, pageSize, searchText);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, pageSize, searchText]);

  // --- 2. GET SINGLE DEVELOPER BY ID ---
  const fetchDeveloperById = async (id) => {
    setLoading(true);
    try {
      const response = await apiService.get(
  "/property/get-developer-by-id",
  { id }
);
      const dev = response?.data || response;
      if (dev) {
        form.setFieldsValue({
          name: dev.name,
          email: dev.email,
          phone_number: dev.phone_number,
          country_code: dev.country_code || '+971', 
          password: dev.password,
          description: dev.description,
          websiteUrl: dev.websiteUrl,
          country: dev.country,
          city: dev.city,
          address: dev.address,
          reraNumber: dev.reraNumber,
          logo: dev.logo
        });
        
        if (dev.logo) {
            setImageUrl(dev.logo);
        }

        setEditingId(id);
        setModalVisible(true);
      }
    } catch (err) {
      message.error("Failed to fetch developer details.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. CREATE OR UPDATE ---
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        email: values.email,
        phone_number: values.phone_number,
        country_code: values.country_code,
        password: values.password,
        description: values.description || "",
        websiteUrl: values.websiteUrl || "",
        country: values.country || "",
        city: values.city || "",
        address: values.address || "",
        reraNumber: values.reraNumber || "",
        logo: values.logo || "", 
      };

      let response;
      if (editingId) {
        response = await apiService.post(
  `/property/edit-developer?id=${editingId}`,
  payload
);
      } else {
        response = await apiService.post(
  "/property/create-developer",
  payload
);
      }
      
      if (response) {

  notification.success({
    message: editingId ? 'Developer Updated' : 'Developer Created',
    description: `Developer ${values.name} has been successfully ${editingId ? 'updated' : 'registered'}.`,
    placement: 'topRight'
  });

  closeModal();

  fetchDevelopers(currentPage, pageSize, searchText);

}
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to save developer details.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. QUICK STATUS TOGGLE ---
  const handleStatusToggle = async (record, checked) => {
    setActionLoading(record._id || record.id);
    try {
      const payload = {
        ...record, 
        isVerifiedByAdmin: checked
      };
      delete payload._id; 

      await apiService.post(
  `/property/edit-developer?id=${record._id || record.id}`,
  payload
);
      
      message.success(`Developer ${checked ? 'Verified' : 'Unverified'} successfully`);
      fetchDevelopers(currentPage, pageSize, searchText);
    } catch (err) {
      message.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // --- 5. DELETE ---
  const deleteDeveloper = async (id) => {
  try {

    setLoading(true);

    const response = await apiService.post(
      `/property/delete-developer-by-id?id=${id}`
    );

    if (response) {

      message.success("Developer deleted successfully.");

      fetchDevelopers(currentPage, pageSize, searchText);

    }

  } catch (err) {

    message.error(err.response?.data?.message || "Deletion failed.");

  } finally {

    setLoading(false);

  }
};

  // --- 6. IMAGE UPLOAD HANDLER ---
  const handleImageUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadLoading(true);

    try {
        const formData = new FormData();
        formData.append('file', file); 

        const response = await apiService.upload("/upload", formData);

        const uploadedUrl = response.data?.file?.url || response.data?.url; 

        if (uploadedUrl) {
            setImageUrl(uploadedUrl); 
            form.setFieldsValue({ logo: uploadedUrl });
            message.success("Logo uploaded successfully!");
            onSuccess("Ok");
        } else {
            throw new Error("Could not find image URL in response");
        }
    } catch (err) {
        console.error("Upload error:", err);
        message.error("Failed to upload image.");
        onError({ err });
    } finally {
        setUploadLoading(false);
    }
  };

  const handlePreview = (e) => {
    e.stopPropagation(); 
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation(); 
    setImageUrl(null);
    form.setFieldsValue({ logo: '' });
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG/WEBP file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setImageUrl(null); 
    form.resetFields();
  };

  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const columns = [
    {
      title: 'Developer Name',
      dataIndex: 'name',
      key: 'name',
      fixed: screens.md ? 'left' : false, 
      width: 250,
      render: (text, record) => (
        <Space>
          {/* LOGIC UPDATE:
             - Agar Logo hai: Image show karo.
             - Agar Logo nahi hai: Name ka First Letter (Capitalized) show karo.
          */}
          <Avatar 
            shape="square"
            size={50}
            src={record.logo} 
            // Removed icon={<UserOutlined />} so letter can show up
            style={{ 
                backgroundColor: record.isVerifiedByAdmin ? THEME.success : THEME.primary,
                borderRadius: '10px',
                border: '1px solid #f0f0f0',
                fontSize: '24px', // Letter bada dikhane ke liye
                fontWeight: 'bold',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              height: '50px',
              width: '80px',
              
            }} 
          >
             {/* Fallback to First Letter if no logo */}
             {record.logo ? null : record.name?.charAt(0).toUpperCase()}
          </Avatar>

          <div>
            <Text strong style={{ fontSize: '15px' }}>{text}</Text>
            {record.isVerifiedByAdmin && (
               <div className="text-[10px] text-green-600 leading-none mt-1">Verified</div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (email) => (
        <Text type="secondary"><MailOutlined /> {email}</Text>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      width: 180,
      render: (_, record) => (
         <div className="flex flex-col text-xs text-gray-500">
             <span>{record.city}, {record.country}</span>
             <span className="truncate max-w-[150px]">{record.address}</span>
         </div>
      ),
    },
    {
      title: 'Verified',
      dataIndex: 'isVerifiedByAdmin',
      key: 'isVerifiedByAdmin',
      width: 100,
      align: 'center',
      render: (checked, record) => (
        <Switch 
          checked={checked}
          loading={actionLoading === (record._id || record.id)}
          onChange={(val) => handleStatusToggle(record, val)}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          style={{ backgroundColor: checked ? THEME.success : undefined }}
        />
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      align: 'center',
      fixed: screens.md ? 'right' : false,
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: THEME.primary }} />} 
              onClick={() => fetchDeveloperById(record._id || record.id)}
            />
          </Tooltip>
          
          <Popconfirm 
            title="Are you sure you want to delete?" 
            onConfirm={() => deleteDeveloper(record._id || record.id)} 
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
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Developer Management</Title>
          <Text type="secondary">Manage your real estate developers professionally.</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={() => {
              setEditingId(null);
              setImageUrl(null);
              form.resetFields();
              setModalVisible(true);
          }}
          style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
          className="w-full md:w-auto"
        >
          Add New Developer
        </Button>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
            <Statistic 
              title="Total Developers" 
              value={total} 
              prefix={<UsergroupAddOutlined style={{ color: THEME.primary }} />} 
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-md" bodyStyle={{ padding: 0 }}>
        <div className="p-4 border-b bg-white rounded-t-lg">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Search by name or email..." 
            className="w-full md:w-[400px]"
            onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
            }}
            allowClear
            size="large"
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={developers} 
          loading={loading && !actionLoading}
          rowKey={(record) => record._id || record.id}
          scroll={{ x: 1000 }} 
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            position: ['bottomRight']
          }}
        />
      </Card>

      <Modal
        title={<div className="font-bold text-lg">{editingId ? <EditOutlined /> : <PlusOutlined />} {editingId ? 'Edit Developer' : 'Register New Developer'}</div>}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        centered
        destroyOnClose
        width={screens.xs ? '95%' : 700}
      >
        <Divider style={{ margin: '10px 0 25px 0' }} />
        <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleSave} 
            initialValues={{ country_code: '+971' }} 
        >
          {/* SECTION 1: ACCOUNT DETAILS */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Account Details</Text>
          <Row gutter={16}>
             <Col xs={24} md={12}>
                <Form.Item name="name" label="Developer Name" rules={[{ required: true, message: 'Required' }]}>
                    <Input prefix={<UserOutlined />} placeholder="e.g. John Doe" />
                </Form.Item>
             </Col>
             <Col xs={24} md={12}>
                <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Invalid email' }]}>
                    <Input prefix={<MailOutlined />} placeholder="email@example.com" />
                </Form.Item>
             </Col>
             <Col xs={24} md={12}>
                <Form.Item name="password" label="Password" rules={[{ required: !editingId, message: 'Password is required' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="Enter password" />
                </Form.Item>
             </Col>
             <Col xs={24} md={12}>
                <Form.Item name="reraNumber" label="RERA Number">
                    <Input prefix={<NumberOutlined />} placeholder="e.g. RERA123456" />
                </Form.Item>
             </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* SECTION 2: LOGO UPLOAD (WITH HOVER PREVIEW/DELETE) */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Developer Logo</Text>
          <Row gutter={16}>
             <Col span={24}>
                 <Form.Item label="Upload Logo" tooltip="Supports JPG, PNG, WEBP (< 2MB)">
                     <Form.Item name="logo" noStyle>
                        <Input type="hidden" />
                     </Form.Item>

                     <Upload
                        name="file"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}
                        customRequest={handleImageUpload}
                        beforeUpload={beforeUpload}
                        disabled={uploadLoading}
                     >
                        {imageUrl ? (
                           <div className="relative w-full h-full group overflow-hidden rounded-lg">
                              {/* Main Image */}
                              <img src={imageUrl} alt="logo" className="w-full h-full object-contain" />
                              
                              {/* Hover Overlay with Eye & Trash Icons */}
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                 <EyeOutlined 
                                    className="text-white text-lg hover:text-blue-400 cursor-pointer" 
                                    onClick={handlePreview} 
                                 />
                                 <DeleteOutlined 
                                    className="text-white text-lg hover:text-red-400 cursor-pointer" 
                                    onClick={handleRemoveImage} 
                                 />
                              </div>
                           </div>
                        ) : (
                           uploadButton
                        )}
                     </Upload>
                 </Form.Item>
             </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* SECTION 3: CONTACT & LOCATION */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Contact & Location</Text>
          <Row gutter={16}>
            
            <Col xs={8} md={7}>
              <Form.Item name="country_code" label="Code">
                <Select style={{ width: '100%' }}>
                  {COUNTRY_CODES.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.flag} {item.code}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={16} md={17}>
              <Form.Item 
                noStyle 
                shouldUpdate={(prev, current) => prev.country_code !== current.country_code}
              >
                {({ getFieldValue }) => {
                   const code = getFieldValue('country_code') || '+971';
                   let maxLen = 15;
                   let placeholder = "Mobile Number";

                   if (code === '+971') { maxLen = 9; placeholder = "50xxxxxxx (9 digits)"; }
                   if (code === '+91') { maxLen = 10; placeholder = "98xxxxxxxx (10 digits)"; }

                   return (
                     <Form.Item 
                        name="phone_number" 
                        label="Phone Number" 
                        rules={[
                          { required: false, message: 'Phone number is required'  },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              
                              if (code === '+971') {
                                if (!/^\d{9}$/.test(value)) {
                                  return Promise.reject(new Error('UAE number must be exactly 9 digits'));
                                }
                                if (!value.startsWith('5')) {
                                   return Promise.reject(new Error('UAE  mobile usually starts with 5'));
                                   
                                }
                              } else if (code === '+91') {
                                if (!/^\d{10}$/.test(value)) {
                                  return Promise.reject(new Error('India number must be exactly 10 digits'));
                                }
                              } else {
                                if (!/^\d{7,15}$/.test(value)) {
                                   return Promise.reject(new Error('Invalid phone format'));
                                }
                              }
                              return Promise.resolve();
                            }
                          }
                        ]}
                     >
                        <Input 
                          prefix={<PhoneOutlined />} 
                          type="number" 
                          maxLength={maxLen} 
                          placeholder={placeholder}
                          style={{ width: '100%' }}
                          onInput={(e) => {
                             if (e.target.value.length > maxLen) {
                                e.target.value = e.target.value.slice(0, maxLen);
                             }
                          }}
                        />
                     </Form.Item>
                   );
                }}
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
                <Form.Item name="country" label="Country">
                    <Input prefix={<GlobalOutlined />} placeholder="UAE" />
                </Form.Item>
            </Col>
            <Col xs={24} md={12}>
                <Form.Item name="city" label="City">
                    <Input prefix={<EnvironmentOutlined />} placeholder="Dubai" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item name="address" label="Address">
                    <Input prefix={<HomeOutlined />} placeholder="Business Bay, Dubai" />
                </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* SECTION 4: ADDITIONAL INFO */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Additional Info</Text>
          <Row gutter={16}>
            <Col span={24}>
                <Form.Item name="websiteUrl" label="Website URL">
                    <Input prefix={<LinkOutlined />} placeholder="https://example.com" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item name="description" label="Description">
                    <TextArea rows={3} placeholder="About the developer..." />
                </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-4">
            <Button size="large" onClick={closeModal}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              size="large"
              style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
            >
              {editingId ? 'Update' : 'Save'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* --- PREVIEW MODAL --- */}
      <Modal 
        open={previewOpen} 
        title="Logo Preview" 
        footer={null} 
        onCancel={() => setPreviewOpen(false)}
        centered
      >
        <img alt="logo-preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default CreateDeveloper;