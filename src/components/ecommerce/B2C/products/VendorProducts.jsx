import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import axios from 'axios';
import {
  Button, Modal, Form, Input, Popconfirm, Card, Table,
  Typography, Row, Col, Statistic, Space, Divider, App,
  InputNumber, Select, Switch, Tag, Upload
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined,
  ShoppingOutlined, CheckOutlined, CloseOutlined
} from '@ant-design/icons';
import CustomTable from '../../../CMS/pages/custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const THEME = { primary: "#7c3aed" };
const BASE_URL = "https://xoto.ae";
// const BASE_URL = "http://localhost:5000";

// Standard Color Options for Preview
const COLOR_OPTIONS = [
  { label: 'Black', value: 'Black', hex: '#000000' },
  { label: 'White', value: 'White', hex: '#ffffff' },
  { label: 'Grey', value: 'Grey', hex: '#808080' },
  { label: 'Walnut', value: 'Walnut', hex: '#5d4037' },
  { label: 'Oak', value: 'Oak', hex: '#b5835a' },
  { label: 'Beige', value: 'Beige', hex: '#f5f5dc' },
  { label: 'Blue', value: 'Blue', hex: '#1d4ed8' },
  { label: 'Red', value: 'Red', hex: '#dc2626' },
];

const ProductManagementContent = () => {
  const { message, notification } = App.useApp();
  const [form] = Form.useForm();
    const { user } = useSelector((state) => state.auth);
        const vendor_id=user.id

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/products/get-all-brand`, { params: { limit: 100 } });
      setBrands(response.data?.data || response.data?.brands || []);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/products/get-all-category`, { params: { limit: 100 } });
      setCategories(response.data?.data || response.data?.categories || []);
    } catch (err) { console.error(err); }
  };

 const fetchProducts = async (page = 1, limit = 10, search = '') => {
  const vendor_id = user._id || user.id;

  setLoading(true);
  try {
    const response = await apiService.get('/products/get-all-products', {
      page,
      limit,
      vendor_id,
      search
    });

    setProducts(response?.data?.products || []);
    setTotal(response?.data?.pagination?.total || 0);
  } catch (err) {
    showToast("error", "Failed to load products");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(currentPage, pageSize, searchText);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, pageSize, searchText]);


  const customUploadRequest = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${BASE_URL}/api/upload`, formData);
      
      const imageUrl = response.data?.url || response.data?.secure_url || response.data?.data?.url || response.data;
            

      onSuccess(imageUrl);
      message.success("Uploaded");
    } catch (err) {
      onError(err);
      message.error("Upload failed");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const extractUrl = (f) => {
        if (typeof f === 'string') return f;
        const res = f.response;
        if (res) return typeof res === 'string' ? res : (res.url || res.secure_url || res.file?.url);
        return f.url || null;
      };


      const payload = {
        product: {
          name: values.name,
          photos: values.mainImage ? values.mainImage.map(extractUrl).filter(Boolean).slice(0, 1) : [""],
          category: values.category,
          brandName: values.brandName,
          description: values.description || "",
          price: Number(values.price) || 0,
          discountedPrice: Number(values.discountedPrice) || 0,
          currency: "AED",
          quantity: Number(values.quantity) || 0,
          warrantyYears: Number(values.warrantyYears) || 0,
          returnPolicyDays: Number(values.returnPolicyDays) || 0,
          noCostEmiAvailable: !!values.noCostEmiAvailable,
          isActive: values.isActive ?? true,
          isFeatured: values.isFeatured ?? true,
          finish: values.finish || "",
          originCountry: values.originCountry || "",
          careInstructions: values.careInstructions || "",
          assemblyRequired: !!values.assemblyRequired,
          assemblyToolsProvided: !!values.assemblyToolsProvided,
          keyFeatures: typeof values.keyFeatures === 'string' 
            ? values.keyFeatures.split(',').map(s => s.trim()).filter(Boolean) 
            : [],
          material: typeof values.material === 'string' 
            ? values.material.split(',').map(s => s.trim()).filter(Boolean) 
            : [],
        },
        colours: (values.colours || []).map(col => ({
          colourName: col.colourName || "",
          photos: col.photos ? col.photos.map(extractUrl).filter(Boolean) : [],
          isActive: col.isActive ?? true
        })),
        vendorId:vendor_id
      };

      const url = editingId 
        ? `${BASE_URL}/api/products/edit-product-by-id?id=${editingId}`
        : `${BASE_URL}/api/products/create-products`;

     const response = await apiService.post(url, payload);

if (response.success) {
  showToast("success", editingId ? "Product updated" : "Product created");
  closeModal();
  fetchProducts(currentPage, pageSize);
}
    } catch (err) {
      message.error(err.response?.data?.message || "Format Error: Check your fields");
    } finally { setSaving(false); }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, r) => (
        <Space>
          <div className="border rounded bg-white flex justify-center items-center shadow-sm" style={{ width: '50px', height: '50px' }}>
            <img src={r.photos?.[0]} alt="p" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = "https://placehold.co/50"; }} />
          </div>
          <div>
            <Text strong className="block">{r.name}</Text>
            <Tag color="blue" className="text-xs">{r.brandName?.brandName || 'No Brand'}</Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Pricing & Stock',
      key: 'pricing',
      render: (_, r) => (
        <div>
          <Text strong>AED {r.price}</Text> 
          <div className="mt-1"><Tag color={r.quantity > 5 ? 'success' : 'warning'}>{r.quantity} in Stock</Tag></div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'} icon={isActive ? <CheckOutlined /> : <CloseOutlined />}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Action',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined className="text-blue-600" />} onClick={() => {
            setEditingId(record._id);
            form.setFieldsValue({
              ...record,
              brandName: record.brandName?._id || record.brandName,
              category: record.category?._id || record.category,
              mainImage: (record.photos || []).map((url, i) => ({ uid: i, name: `img`, status: 'done', url })),
              keyFeatures: record.keyFeatures?.join(', '),
              material: record.material?.join(', '),
              colours: (record.ProductColors || []).map((col, i) => ({
                ...col,
                photos: (col.photos || []).map((url, pi) => ({ uid: `${i}-${pi}`, status: 'done', url }))
              }))
            });
            setModalVisible(true);
          }} />
          <Popconfirm title="Delete Product?" onConfirm={async () => { await axios.post(`${BASE_URL}/api/products/delete-product-by-id?id=${record._id}`); fetchProducts(); }}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>Product Management</Title>
          <Text type="secondary">Create and manage your furniture inventory in AED.</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />}
          onClick={() => { setEditingId(null); form.resetFields(); setModalVisible(true); }} 
          style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
          className="w-full md:w-auto"
        >
          Add New Product
        </Button>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
            <Statistic title="Total Products" value={total} prefix={<ShoppingOutlined style={{ color: THEME.primary }} />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-md" bodyStyle={{ padding: 0 }}>
        <div className="p-4 border-b bg-white rounded-t-lg">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Search products..." 
            className="w-full md:max-w-md"
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="large"
          />
        </div>
       <CustomTable
  columns={columns}
  data={products}
  loading={loading}
  rowKey="_id"
  pagination={{
    current: currentPage,
    pageSize: pageSize,
    total: total,
    onChange: (p) => setCurrentPage(p)
  }}
/>
      </Card>

      <Modal 
        title={<div className="font-bold text-lg">{editingId ? 'Edit Product' : 'Create New Product'}</div>} 
        open={modalVisible} 
        onCancel={closeModal} 
        footer={null} 
        centered 
        width={1000} 
        destroyOnClose
      >
        <Divider style={{ margin: '10px 0 25px 0' }} />
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ isActive: true, isFeatured: true }}>
          
          <Text strong className="text-gray-400 text-xs mb-4 block uppercase tracking-wider">Basic Information</Text>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="mainImage" label="Main Product Image" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload customRequest={customUploadRequest} listType="picture-card" maxCount={1}>
                  <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. Modern Wooden Dining Table" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="brandName" label="Brand" rules={[{ required: true }]}>
                <Select showSearch size="large" placeholder="Select Brand">
                  {brands.map(b => <Option key={b._id} value={b._id}>{b.brandName}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select Category">
                  {categories.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="price" label="MRP (AED)">
                <InputNumber size="large" className="w-full" prefix="AED" min={0} />
              </Form.Item>
            </Col>
            
            <Col span={6}>
              <Form.Item name="quantity" label="Stock Quantity">
                <InputNumber size="large" className="w-full" min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '20px 0' }} />
          <Text strong className="text-gray-400 text-xs mb-4 block uppercase tracking-wider">Specifications & Policy</Text>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Tell us about the product..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="careInstructions" label="Care Instructions">
                <TextArea rows={3} placeholder="e.g. Clean with a dry cloth..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={12} md={6}><Form.Item name="warrantyYears" label="Warranty (Years)"><InputNumber className="w-full" size="large" min={0}/></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="returnPolicyDays" label="Return Policy (Days)"><InputNumber className="w-full" size="large" min={0}/></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="finish" label="Finish"><Input size="large" placeholder="Matte/Glossy" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="originCountry" label="Origin Country"><Input size="large" placeholder="India/UAE" /></Form.Item></Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}><Form.Item name="keyFeatures" label="Key Features (Comma Separated)"><Input size="large" placeholder="Scratch Resistant, 6 Seater..." /></Form.Item></Col>
            <Col span={12}><Form.Item name="material" label="Materials (Comma Separated)"><Input size="large" placeholder="Solid Wood, Fabric..." /></Form.Item></Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}><Form.Item name="noCostEmiAvailable" label="No Cost EMI" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col span={8}><Form.Item name="assemblyRequired" label="Assembly Required" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col span={8}><Form.Item name="assemblyToolsProvided" label="Tools Provided" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>

          {/* UPDATED VARIANTS SECTION WITH COLOR PREVIEW */}
          <Divider orientation="left" className="text-gray-400 uppercase text-xs">Variants & Colors</Divider>
          <Form.List name="colours">
            {(fields, { add, remove }) => (
              <div className="flex flex-col gap-4">
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    size="small" 
                    title={
                      <Space>
                        <div 
                          className="w-4 h-4 rounded-full border shadow-sm" 
                          style={{ 
                            backgroundColor: COLOR_OPTIONS.find(c => c.value === form.getFieldValue(['colours', name, 'colourName']))?.hex || '#e5e7eb' 
                          }} 
                        />
                        <span className="text-sm">Color Variant: {form.getFieldValue(['colours', name, 'colourName']) || 'New'}</span>
                      </Space>
                    } 
                    extra={<DeleteOutlined className="text-red-500 hover:text-red-700 cursor-pointer" onClick={() => remove(name)} />} 
                    className="bg-gray-50 border-dashed"
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item 
                          {...restField} 
                          name={[name, 'colourName']} 
                          label="Select Color" 
                          rules={[{required: true}]}
                        >
                          <Select 
                            placeholder="Pick color" 
                            onChange={() => setProducts([...products])} // Simple trick to refresh the card title preview
                            options={COLOR_OPTIONS.map(c => ({
                              label: (
                                <Space>
                                  <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: c.hex, border: '1px solid #ccc' }} />
                                  {c.label}
                                </Space>
                              ),
                              value: c.value
                            }))}
                          />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'isActive']} valuePropName="checked" initialValue={true}>
                          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item 
                          {...restField} 
                          name={[name, 'photos']} 
                          label="Variant Images" 
                          valuePropName="fileList" 
                          getValueFromEvent={normFile}
                        >
                          <Upload 
                            customRequest={customUploadRequest} 
                            listType="picture-card" 
                            multiple
                          >
                            <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload Photos</div></div>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="large">
                  Add Colour Variant
                </Button>
              </div>
            )}
          </Form.List>

          <div className="flex justify-end gap-3 mt-8 border-t pt-4">
            <Button size="large" onClick={closeModal}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving} size="large" style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}>
              {editingId ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

const VendorProducts = () => (
  <App><ProductManagementContent /></App>
);

export default VendorProducts;