// src/components/vendor/UpdateVendorProfile.jsx
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  Upload,
  Avatar,
  Typography,
  Tabs,
  Space,
  Divider,
  message,
  Spin,
  Alert,
  Badge,
  InputNumber
} from "antd";
import {
  ShopOutlined,
  BankOutlined,
  FileProtectOutlined,
  GlobalOutlined,
  ContactsOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  SaveOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../../../manageApi/utils/toast";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  bgLight: "#f9f0ff",
  cardBg: "#ffffff",
};

const UpdateVendorProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendorData, setVendorData] = useState(null);
  
  // Data for Select Options
  const [allCategories, setAllCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  
  const [activeTab, setActiveTab] = useState("business");

  // --- FETCH DATA ---
  useEffect(() => {
    fetchProfile();
    fetchCategories();
    fetchCurrencies();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await apiService.get("/vendor/b2c/profile");
      if (response.success) {
        const data = response.vendor;
        setVendorData(data);
        
        // Pre-fill Form
        form.setFieldsValue({
          first_name: data.name?.first_name,
          last_name: data.name?.last_name,
          email: data.email,
          mobile: data.mobile?.number,
          
          // Store Details
          store_name: data.store_details?.store_name,
          store_type: data.store_details?.store_type,
          store_description: data.store_details?.store_description,
          store_address: data.store_details?.store_address,
          city: data.store_details?.city,
          state: data.store_details?.state,
          country: data.store_details?.country,
          pincode: data.store_details?.pincode,
          website: data.store_details?.website,
          categories: data.store_details?.categories?.map(c => c._id),

          // Social Links
          social_links: data.store_details?.social_links,

          // Registration
          pan_number: data.registration?.pan_number,
          gstin: data.registration?.gstin,
          business_license_number: data.registration?.business_license_number,
          // Note: shop_act_license_number is the text field, shop_act_license is the file field below
          shop_act_license_number: data.registration?.shop_act_license, 

          // Bank Details
          bank_account_number: data.bank_details?.bank_account_number,
          ifsc_code: data.bank_details?.ifsc_code,
          account_holder_name: data.bank_details?.account_holder_name,
          bank_name: data.bank_details?.bank_name,
          branch_name: data.bank_details?.branch_name,
          upi_id: data.bank_details?.upi_id,
          preferred_currency: data.bank_details?.preferred_currency,

          // Contacts
          primary_contact_name: data.contacts?.primary_contact?.name,
          primary_contact_designation: data.contacts?.primary_contact?.designation,
          primary_contact_email: data.contacts?.primary_contact?.email,
          primary_contact_mobile: data.contacts?.primary_contact?.mobile,
          primary_contact_whatsapp: data.contacts?.primary_contact?.whatsapp,

          support_contact_name: data.contacts?.support_contact?.name,
          support_contact_designation: data.contacts?.support_contact?.designation,
          support_contact_email: data.contacts?.support_contact?.email,
          support_contact_mobile: data.contacts?.support_contact?.mobile,
          support_contact_whatsapp: data.contacts?.support_contact?.whatsapp,

          // Operations
          avg_delivery_time_days: data.operations?.avg_delivery_time_days,
          return_policy: data.operations?.return_policy,
          delivery_modes: data.operations?.delivery_modes
        });
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.get('/categories');
      const categoryData = response.data || response; 
      if (categoryData.categories) {
        setAllCategories(categoryData.categories);
      }
    } catch (error) {
      console.error("Categories fetch failed:", error);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await apiService.get('/setting/currency');
      if(response.success) {
         setCurrencies(response.currencies);
      }
    } catch (error) {
      console.error("Currencies fetch failed:", error);
    }
  };

  // --- HELPER FOR UPLOADS ---
  // This ensures standard AntD file list format is passed to form state
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  // --- SUBMIT HANDLER ---
  const onFinish = async (values) => {
    setSaving(true);
    
    const formData = new FormData();

    Object.keys(values).forEach(key => {
        const value = values[key];

        // 1. Handle File Uploads
        // Ant Design returns files in an array (fileList) with an 'originFileObj' property
        if (Array.isArray(value) && value.length > 0 && value[0].originFileObj) {
            // Append the actual binary file
            formData.append(key, value[0].originFileObj);
        }
        // 2. Handle standard Arrays (like Categories, Delivery Modes)
        // If it's an array but NOT a file list
        else if (Array.isArray(value) && (!value[0] || !value[0].originFileObj)) {
            formData.append(key, value.join(',')); 
        }
        // 3. Handle Nested Objects (Social Links)
        else if (key === 'social_links' && typeof value === 'object') {
             Object.keys(value).forEach(subKey => {
                 formData.append(`social_links[${subKey}]`, value[subKey]);
             });
        }
        // 4. Handle Standard Text/Numbers
        else if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });

    try {
      const response = await apiService.put("/vendor/b2c/profile/update", formData, {
         headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (response.success) {
        showToast("Profile updated successfully!", "success");
        fetchProfile(); // Refresh data to show new files
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
           <Avatar 
             size={80} 
             src={vendorData?.store_details?.logo ? `http://localhost:5000/${vendorData.store_details.logo}` : null}
             icon={<ShopOutlined />} 
             style={{ backgroundColor: THEME.primary }} 
           />
           <div>
             <Title level={2} style={{ margin: 0 }}>
               {vendorData?.store_details?.store_name || "Vendor Store"}
             </Title>
             <Text type="secondary">
                {vendorData?.name?.first_name} {vendorData?.name?.last_name} | {vendorData?.email}
             </Text>
               <div className="mt-2">
                <Badge 
                    status={
                        vendorData?.onboarding_status === 'approved' ? 'success' : 
                        vendorData?.onboarding_status === 'rejected' ? 'error' : 'processing'
                    } 
                    text={<span className="capitalize font-medium">{vendorData?.onboarding_status?.replace('_', ' ')}</span>} 
                />
             </div>
           </div>
        </div>
        
        <Space>
           <Button icon={<GlobalOutlined />} href={vendorData?.store_details?.website} target="_blank" disabled={!vendorData?.store_details?.website}>
             Visit Store
           </Button>
           <Button 
             type="primary" 
             icon={<SaveOutlined />} 
             loading={saving} 
             onClick={() => form.submit()}
             size="large"
             style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
           >
             Save Changes
           </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={24}>
            {/* LEFT COLUMN - NAVIGATION */}
            <Col xs={24} lg={6}>
                <Card className="shadow-sm rounded-lg" bodyStyle={{ padding: 0 }}>
                    <Tabs 
                        activeKey={activeTab} 
                        onChange={setActiveTab} 
                        tabPosition="left"
                        className="custom-vertical-tabs"
                        items={[
                            { key: 'business', label: <span><ShopOutlined /> Business Info</span> },
                            { key: 'registration', label: <span><FileProtectOutlined /> Registration</span> },
                            { key: 'bank', label: <span><BankOutlined /> Bank & Currency</span> },
                            { key: 'operations', label: <span><RocketOutlined /> Operations</span> },
                            { key: 'contacts', label: <span><ContactsOutlined /> Contacts</span> },
                            { key: 'documents', label: <span><FileProtectOutlined /> Documents</span> },
                        ]}
                        style={{ height: '100%', minHeight: '500px' }}
                    />
                </Card>
            </Col>

            {/* RIGHT COLUMN - FORMS */}
            <Col xs={24} lg={18}>
                
                {/* TAB: BUSINESS INFO */}
                {activeTab === 'business' && (
                    <Card title="Business & Personal Information" className="shadow-sm rounded-lg">
                        <Divider orientation="left">Personal Details</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                                    <Input placeholder="John" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
                                    <Input placeholder="Doe" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="email" label="Email">
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="mobile" label="Mobile Number">
                                    <Input prefix="+91" disabled />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider orientation="left">Store Details</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="store_name" label="Store Name" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="store_type" label="Business Type" rules={[{ required: true }]}>
                                    <Select>
                                        <Option value="Individual / Sole Proprietor">Individual / Sole Proprietor</Option>
                                        <Option value="Private Limited">Private Limited</Option>
                                        <Option value="Partnership">Partnership</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="categories" label="Product Categories">
                                    <Select mode="multiple" placeholder="Select categories">
                                        {allCategories.map(cat => (
                                            <Option key={cat._id} value={cat._id}>
                                                {cat.parent ? `${cat.name} (${cat.parent.name})` : cat.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="store_description" label="About Store">
                                    <TextArea rows={3} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="store_address" label="Address" rules={[{ required: true }]}>
                                    <TextArea rows={2} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="city" label="City" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="state" label="State">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="pincode" label="Pincode" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="website" label="Website URL">
                                    <Input prefix={<GlobalOutlined />} />
                                </Form.Item>
                            </Col>
                        </Row>
                        
                        <Divider orientation="left">Social Links</Divider>
                        <Row gutter={16}>
                             <Col span={12}>
                                <Form.Item name={['social_links', 'instagram']} label="Instagram">
                                    <Input prefix="@" />
                                </Form.Item>
                             </Col>
                             <Col span={12}>
                                <Form.Item name={['social_links', 'facebook']} label="Facebook">
                                    <Input />
                                </Form.Item>
                             </Col>
                        </Row>
                    </Card>
                )}

                {/* TAB: REGISTRATION */}
                {activeTab === 'registration' && (
                    <Card title="Registration & Legal" className="shadow-sm rounded-lg">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="pan_number" label="PAN Number">
                                    <Input style={{ textTransform: 'uppercase' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="gstin" label="GSTIN">
                                    <Input style={{ textTransform: 'uppercase' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="business_license_number" label="Business License No.">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="shop_act_license_number" label="Shop Act License (Number)">
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                )}

                {/* TAB: BANK DETAILS */}
                {activeTab === 'bank' && (
                    <Card title="Bank Account Details" className="shadow-sm rounded-lg">
                        <Alert message="Ensure details match your registered business name for smooth payouts." type="info" showIcon className="mb-6" />
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="account_holder_name" label="Account Holder Name">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="bank_account_number" label="Account Number">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="ifsc_code" label="IFSC Code">
                                    <Input style={{ textTransform: 'uppercase' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="bank_name" label="Bank Name">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="upi_id" label="UPI ID">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="preferred_currency" label="Preferred Currency">
                                    <Select placeholder="Select currency">
                                        {currencies.map(curr => (
                                            <Option key={curr._id} value={curr._id}>
                                                {curr.name} ({curr.code}) - {curr.symbol}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                )}

                {/* TAB: OPERATIONS */}
                {activeTab === 'operations' && (
                    <Card title="Operations & Support" className="shadow-sm rounded-lg">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="avg_delivery_time_days" label="Avg. Delivery Time (Days)">
                                    <InputNumber min={1} max={30} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="return_policy" label="Return Policy">
                                    <Select>
                                        <Option value="No Returns">No Returns</Option>
                                        <Option value="7 Days Exchange">7 Days Exchange</Option>
                                        <Option value="30 Days Refund">30 Days Refund</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="delivery_modes" label="Delivery Modes Available">
                                    <Select mode="tags" placeholder="e.g. Standard, Express" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                )}

                {/* TAB: CONTACTS */}
                {activeTab === 'contacts' && (
                    <Card title="Contact Information" className="shadow-sm rounded-lg">
                        <Divider orientation="left">Primary Contact</Divider>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="primary_contact_name" label="Name"><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="primary_contact_designation" label="Designation"><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="primary_contact_email" label="Email"><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="primary_contact_mobile" label="Mobile"><Input /></Form.Item></Col>
                        </Row>

                        <Divider orientation="left">Support Contact</Divider>
                        <Row gutter={16}>
                             <Col span={12}><Form.Item name="support_contact_name" label="Name"><Input /></Form.Item></Col>
                             <Col span={12}><Form.Item name="support_contact_email" label="Email"><Input /></Form.Item></Col>
                             <Col span={12}><Form.Item name="support_contact_mobile" label="Mobile"><Input /></Form.Item></Col>
                        </Row>
                    </Card>
                )}

                {/* TAB: DOCUMENTS - FIXED UPLOAD LOGIC */}
                {activeTab === 'documents' && (
                    <Card title="Document Uploads" className="shadow-sm rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { key: 'logo', label: 'Store Logo' },
                                { key: 'identity_proof', label: 'Identity Proof (Aadhar/Voter ID)' },
                                { key: 'pan_card', label: 'PAN Card' },
                                { key: 'gst_certificate', label: 'GST Certificate' },
                                { key: 'cancelled_cheque', label: 'Cancelled Cheque' },
                                { key: 'shop_act_license', label: 'Shop Act License (File)' },
                            ].map((doc) => (
                                <div key={doc.key} className="border p-4 rounded-lg bg-gray-50">
                                    <Text strong>{doc.label}</Text>
                                    <div className="mt-2">
                                        {/* Show existing file status */}
                                        {vendorData.documents?.[doc.key]?.path || (doc.key === 'logo' && vendorData.store_details?.logo) ? (
                                            <div className="mb-2 flex items-center gap-2">
                                                <CheckCircleOutlined style={{ color: THEME.success }} />
                                                <span className="text-sm text-gray-500">File Uploaded</span>
                                                <a 
                                                    href={`http://localhost:5000/${doc.key === 'logo' ? vendorData.store_details.logo : vendorData.documents[doc.key].path}`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="text-xs text-blue-500 ml-auto"
                                                >
                                                    View
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="mb-2 text-xs text-red-400">Not Uploaded</div>
                                        )}
                                        
                                        {/* FIXED UPLOAD COMPONENT */}
                                        <Form.Item 
                                            name={doc.key} 
                                            valuePropName="fileList" 
                                            getValueFromEvent={normFile}
                                            noStyle={false} // Ensure it renders properly
                                        >
                                            <Upload 
                                                name={doc.key}
                                                beforeUpload={() => false} // IMPORTANT: Prevents auto-upload, allows manual submit
                                                listType="text"
                                                maxCount={1}
                                            >
                                                <Button icon={<UploadOutlined />} block>
                                                    Click to Upload
                                                </Button>
                                            </Upload>
                                        </Form.Item>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

            </Col>
        </Row>
      </Form>
    </div>
  );
};

export default UpdateVendorProfile;