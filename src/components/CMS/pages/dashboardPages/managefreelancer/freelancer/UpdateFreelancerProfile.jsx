import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../../../../manageApi/utils/toast";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  InputNumber,
  Upload,
  Avatar,
  Tag,
  Space,
  Typography,
  Switch,
  Spin,
  Tabs,
  Table,
  Alert,
} from "antd";
import {
  UserOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  EnvironmentOutlined,
  SolutionOutlined,
  DollarCircleOutlined,
  ToolFilled,
  FileTextOutlined,
  CameraOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  LoadingOutlined,
  EyeOutlined
} from "@ant-design/icons";

import CountryList from 'country-list-with-dial-code-and-flag';
import { Country, State, City } from 'country-state-city';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const unitOptions = [
  { label: "Per Hour", value: "per hour" },
  { label: "Per Sq. Ft", value: "per sq.ft" },
  { label: "Per Sq. Meter", value: "per sq.m" },
  { label: "Fixed Price", value: "fixed" },
  { label: "Per Day", value: "per day" },
  { label: "Per Item", value: "per item" },
  { label: "Per Visit", value: "per visit" }
];

// Helper to ensure URL is valid
const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    return `http://localhost:5000/${path}`; // Replace with your actual base URL logic
};

const UpdateFreelancerProfile = () => {
  const [form] = Form.useForm();
  
  const selectedCountry = Form.useWatch('country', form);
  const selectedState = Form.useWatch('state', form);

  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rateLoading, setRateLoading] = useState(false);
  
  const [subcategories, setSubcategories] = useState([]);
  const [typesMap, setTypesMap] = useState({});
  const [currencies, setCurrencies] = useState([]); 
  const [rateCardValues, setRateCardValues] = useState({});

  // File States
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [documentUrls, setDocumentUrls] = useState({}); 
  const [docLoading, setDocLoading] = useState({}); 
  const [fileList, setFileList] = useState({ resume: [], identityProof: [], addressProof: [], certificate: [] });

  const [activeTab, setActiveTab] = useState("basic");
  const hasFetchedTypesRef = useRef(false);

  const mobileCountryOptions = useMemo(() => CountryList.getAll(), []);
  const locationCountries = useMemo(() => Country.getAllCountries(), []);
  
  const availableStates = useMemo(() => {
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry);
  }, [selectedCountry]);

  const availableCities = useMemo(() => {
    if (!selectedCountry || !selectedState) return [];
    return City.getCitiesOfState(selectedCountry, selectedState);
  }, [selectedCountry, selectedState]);

  // --- 1. FETCH DATA & PRE-FILL IMAGES/DOCS ---
  const fetchProfileData = useCallback(async () => {
    try {
      if (!freelancer) setLoading(true);

      const [subRes, profileRes, currRes] = await Promise.all([
        apiService.get("/estimate/master/category/name/Landscaping/subcategories"),
        apiService.get("/freelancer/profile"),
        apiService.get('/setting/currency')
      ]);

      if (subRes.success) setSubcategories(subRes.data || []);
      if (currRes.success) setCurrencies(currRes.currencies || []);

      if (profileRes.success) {
        const data = profileRes.freelancer;
        setFreelancer(data);
        
        // A. Handle Profile Image (Previous Upload)
        if (data.profile_image) {
           setProfileImageUrl(getFullUrl(data.profile_image));
        }

        // B. Handle Documents (Previous Uploads) - Populate FileList so user sees them
        const initialFiles = { resume: [], identityProof: [], addressProof: [], certificate: [] };
        if (data.documents && Array.isArray(data.documents)) {
            data.documents.forEach(doc => {
                if (initialFiles[doc.type] !== undefined) {
                    const url = getFullUrl(doc.path || doc.url);
                    initialFiles[doc.type] = [{
                        uid: doc._id || Date.now(), // Unique ID
                        name: `${doc.type.toUpperCase()}_FILE`, // Display name
                        status: 'done', // Show as completed
                        url: url, // Link to file
                        thumbUrl: doc.type === 'identityProof' ? url : undefined // Show thumb for images
                    }];
                }
            });
        }
        setFileList(initialFiles);

        // Form Data
        const formattedData = formatDataForForm(data);
        form.setFieldsValue(formattedData);

        // Rate Card
        const initialRates = {};
        if (data.services_offered) {
          data.services_offered.forEach(service => {
            if (service.subcategories) {
              service.subcategories.forEach(subcat => {
                const type = subcat.type;
                if (type?._id) {
                  initialRates[type._id] = {
                    price_range: subcat.price_range || "",
                    unit: subcat.unit || "per hour",
                    serviceId: service._id,
                    typeId: type._id
                  };
                }
              });
            }
          });
        }
        setRateCardValues(initialRates);

        if (data.services_offered?.length && subRes.data?.length) {
          if(!hasFetchedTypesRef.current) {
             data.services_offered.forEach((service, index) => {
               const subId = service.category?._id;
               if (subId) fetchTypes(subId, index, subRes.data);
             });
             hasFetchedTypesRef.current = true;
          }
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      showToast("Could not load profile data", "error");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // --- HELPERS ---
  const formatDataForForm = (data) => {
    if (!data) return {};
    const countryObj = Country.getAllCountries().find(c => c.name === data.location?.country);
    const countryIso = countryObj ? countryObj.isoCode : undefined;

    let stateIso = undefined;
    if (countryIso && data.location?.state) {
       const states = State.getStatesOfCountry(countryIso);
       const stateObj = states.find(s => s.name === data.location?.state);
       stateIso = stateObj ? stateObj.isoCode : undefined;
    }

    return {
      firstName: data.name?.first_name || "",
      lastName: data.name?.last_name || "",
      mobile: data.mobile?.number || "",
      countryCode: data.mobile?.country_code || '+971',
      languages: data.languages || [],
      experienceYears: data.professional?.experience_years || 0,
      availability: data.professional?.availability || "Full-time",
      bio: data.professional?.bio || "",
      skills: data.professional?.skills?.join(', ') || '',
      city: data.location?.city || "",
      state: stateIso, 
      country: countryIso,
      po_box: data.location?.po_box || "",
      preferredMethod: data.payment?.preferred_method || "Cash",
      preferredCurrency: data.payment?.preferred_currency?._id || data.payment?.preferred_currency,
      gstNumber: data.payment?.vat_number || "",
      services: data.services_offered?.map(service => ({
        _id: service._id,
        category: service.category?._id,
        types: service.subcategories?.map(sub => sub.type?._id) || [],
        description: service.description || "",
        isActive: service.is_active !== false
      })) || []
    };
  };

  const fetchTypes = async (subId, index, currentSubcategories = subcategories) => {
    const sub = currentSubcategories.find(s => s._id === subId);
    if (!sub?.category) return;
    try {
      const res = await apiService.get(`/estimate/master/category/${sub.category}/subcategories/${subId}/types`);
      if (res.success) {
        const formatted = (res.data || []).map(item => ({ value: item._id, label: item.label }));
        setTypesMap(prev => ({ ...prev, [index]: formatted }));
      }
    } catch (err) { console.error(err); }
  };

  const uploadToS3 = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiService.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    if(res.success && res.file?.url) return res.file.url;
    throw new Error(res.message || "Upload failed");
  };

  const handleSubcategoryChange = (value, index) => {
    const services = form.getFieldValue('services') || [];
    if (services[index]) {
      services[index].types = [];
      form.setFieldsValue({ services });
    }
    fetchTypes(value, index);
  };

  const handleRateInputChange = (typeId, field, value) => {
    setRateCardValues(prev => ({
      ...prev,
      [typeId]: { ...prev[typeId], [field]: value }
    }));
  };

  const customProfileUpload = async ({ file, onSuccess, onError }) => {
    setImgLoading(true);
    try {
        const url = await uploadToS3(file);
        setProfileImageUrl(url);
        onSuccess("ok");
    } catch (error) { onError(error); } 
    finally { setImgLoading(false); }
  };

  const customDocUpload = async ({ file, onSuccess, onError }, type) => {
    setDocLoading(prev => ({ ...prev, [type]: true }));
    try {
        const url = await uploadToS3(file);
        setDocumentUrls(prev => ({ ...prev, [type]: url }));
        // Manually update file list to show "Done" status immediately
        setFileList(prev => ({
            ...prev,
            [type]: [{ uid: file.uid, name: file.name, status: 'done', url: url }]
        }));
        showToast("File uploaded (Save to apply)", "success");
        onSuccess("ok");
    } catch (error) { onError(error); } 
    finally { setDocLoading(prev => ({ ...prev, [type]: false })); }
  };

  const handleDocumentChange = (info, type) => {
      // Ant Design standard handler to keep UI in sync
      let newFileList = [...info.fileList];
      newFileList = newFileList.slice(-1); // Keep only last
      setFileList(prev => ({ ...prev, [type]: newFileList }));
  };

  const handleReupload = async (options, documentId) => {
    try {
      showToast("Uploading...", "info");
      const s3Url = await uploadToS3(options.file);
      const res = await apiService.put(`/freelancer/document/${documentId}`, { path: s3Url });
      if (res.success) {
        options.onSuccess("Ok");
        showToast("Document updated!", "success");
        fetchProfileData(); 
      } else { throw new Error(res.message); }
    } catch (err) { options.onError(err); }
  };

  const updateSingleRateCard = async (typeId) => {
    try {
      setRateLoading(true);
      const values = rateCardValues[typeId];
      if(!values?.price_range) return showToast("Price range required", "warning");

      const payload = {
        serviceId: values.serviceId,
        typeId: values.typeId,
        price_range: values.price_range,
        unit: values.unit
      };

      const response = await apiService.put('/freelancer/rate-card', payload);
      if (response.success) {
        showToast("Rate updated", "success");
        fetchProfileData();
      } else { showToast(response.message, "error"); }
    } catch (error) { showToast("Error updating rate", "error"); } 
    finally { setRateLoading(false); }
  };

  const onFinish = async (values) => {
    try {
      setSaving(true);
      
      const countryObj = locationCountries.find(c => c.isoCode === values.country);
      const countryName = countryObj ? countryObj.name : values.country;

      let stateName = values.state;
      if (countryObj && values.state) {
         const states = State.getStatesOfCountry(countryObj.isoCode);
         const stateObj = states.find(s => s.isoCode === values.state);
         stateName = stateObj ? stateObj.name : values.state;
      }

      const payload = {
        name: { first_name: values.firstName, last_name: values.lastName },
        mobile: { country_code: values.countryCode, number: values.mobile },
        languages: values.languages,
        professional: {
            experience_years: values.experienceYears,
            availability: values.availability,
            bio: values.bio,
            skills: typeof values.skills === 'string' ? values.skills.split(',') : values.skills
        },
        location: {
            city: values.city,
            state: stateName,
            country: countryName,
            po_box: values.po_box
        },
        payment: {
            preferred_method: values.preferredMethod,
            preferred_currency: values.preferredCurrency,
            vat_number: values.gstNumber
        }
      };

      if (profileImageUrl && profileImageUrl !== freelancer.profile_image) {
          payload.profile_image = profileImageUrl;
      }

      if (values.services) {
        payload.services_offered = values.services.map(service => {
            const existingService = freelancer?.services_offered?.find(s => s._id === service._id);
            const subcategoriesData = (service.types || []).map(typeId => {
                const existingSub = existingService?.subcategories?.find(s => s.type?._id === typeId);
                return {
                    type: typeId,
                    price_range: existingSub?.price_range || "",
                    unit: existingSub?.unit || "per hour",
                    is_active: true
                };
            });
            return {
                _id: service._id,
                category: service.category,
                description: service.description,
                is_active: service.isActive,
                subcategories: subcategoriesData
            };
        });
      }

      const documentsPayload = [];
      const docTypes = ['resume', 'identityProof', 'addressProof', 'certificate'];

      docTypes.forEach(type => {
          if (documentUrls[type]) {
              documentsPayload.push({
                  type: type,
                  path: documentUrls[type]
              });
          } 
          else {
              const existing = freelancer.documents?.find(d => d.type === type);
              if (existing) {
                  documentsPayload.push({
                      type: type,
                      path: existing.path || existing.url
                  });
              }
          }
      });

      if (documentsPayload.length > 0) {
          payload.documents = documentsPayload;
      }

      const response = await apiService.put("/freelancer/profile", payload);
      
      if (response.success) {
        showToast("Profile Saved Successfully", "success");
        setDocumentUrls({}); 
        fetchProfileData(); 
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  if (loading && !freelancer) return <Spin size="large" className="flex justify-center mt-10" />;
  if (!freelancer) return <div className="text-center mt-10">Profile Not Found</div>;

  const rateCardColumns = [
    {
      title: 'Service', width: 200,
      render: (_, s) => {
         const catName = subcategories.find(sub => sub._id === (s.category?._id || s.category))?.label || s.category?.name || "Service";
         return <Text strong>{catName}</Text>;
      }
    },
    { title: 'Types', width: 200, render: (_, s) => s.subcategories?.map(sub => <div key={sub._id} className="mb-2 p-1">{sub.type?.label}</div>) },
    {
      title: 'Price Range', width: 150,
      render: (_, s) => s.subcategories?.map(sub => (
        <div key={sub._id} className="mb-2">
           <Input value={rateCardValues[sub.type?._id]?.price_range || ""} onChange={(e) => handleRateInputChange(sub.type?._id, 'price_range', e.target.value)} />
        </div>
      ))
    },
    {
      title: 'Unit', width: 150,
      render: (_, s) => s.subcategories?.map(sub => (
        <div key={sub._id} className="mb-2">
           <Select value={rateCardValues[sub.type?._id]?.unit || "per hour"} onChange={(v) => handleRateInputChange(sub.type?._id, 'unit', v)} style={{width:'100%'}}>
              {unitOptions.map(u => <Option key={u.value} value={u.value}>{u.label}</Option>)}
           </Select>
        </div>
      ))
    },
    {
      title: 'Action', width: 100,
      render: (_, s) => s.subcategories?.map(sub => (
        <div key={sub._id} className="mb-2">
           <Button type="primary" size="small" ghost onClick={() => updateSingleRateCard(sub.type?._id)} loading={rateLoading}>Update</Button>
        </div>
      ))
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        <Card className="mb-6 shadow-sm border-0 bg-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {/* --- 2. PROFILE IMAGE PREVIEW --- */}
                <Avatar size={100} src={profileImageUrl} icon={<UserOutlined />} className="border-2 border-gray-200" />
                <Upload showUploadList={false} customRequest={customProfileUpload} className="absolute bottom-0 right-0">
                   <Button type="primary" shape="circle" icon={imgLoading ? <LoadingOutlined /> : <CameraOutlined />} size="small" />
                </Upload>
              </div>
              <div>
                <Title level={2} className="m-0">{freelancer.name?.first_name} {freelancer.name?.last_name}</Title>
                <Tag color="blue" className="mt-2">{freelancer.onboarding_status}</Tag>
              </div>
            </div>
            <Button type="primary" icon={<SaveOutlined />} size="large" onClick={() => form.submit()} loading={saving}>Save Profile</Button>
          </div>
        </Card>

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" className="bg-white p-4 rounded shadow-sm">
            
            <TabPane tab={<span><UserOutlined /> Basic Info</span>} key="basic">
              <Row gutter={[24, 16]}>
                <Col xs={12}><Form.Item label="First Name" name="firstName" rules={[{required:true}]}><Input /></Form.Item></Col>
                <Col xs={12}><Form.Item label="Last Name" name="lastName" rules={[{required:true}]}><Input /></Form.Item></Col>
                <Col xs={12}>
                  <Form.Item label="Mobile" required>
                    <Space.Compact style={{width:'100%'}}>
                       <Form.Item name="countryCode" noStyle><Select showSearch style={{width:'30%'}} optionFilterProp="label" filterOption={filterOption}>
                          {mobileCountryOptions.map((c,i) => <Option key={i} value={c.dial_code} label={`${c.name} ${c.dial_code}`}>{c.flag} {c.dial_code}</Option>)}
                       </Select></Form.Item>
                       <Form.Item name="mobile" noStyle><Input style={{width:'70%'}} /></Form.Item>
                    </Space.Compact>
                  </Form.Item>
                </Col>
                <Col xs={24}><Form.Item label="Languages" name="languages"><Select mode="multiple"><Option value="english">English</Option><Option value="arabic">Arabic</Option></Select></Form.Item></Col>
              </Row>
            </TabPane>

            <TabPane tab={<span><SolutionOutlined /> Professional</span>} key="professional">
               <Row gutter={[24, 16]}>
                 <Col xs={12}><Form.Item label="Experience" name="experienceYears"><InputNumber className="w-full" /></Form.Item></Col>
                 <Col xs={12}><Form.Item label="Availability" name="availability"><Select><Option value="Full-time">Full-time</Option></Select></Form.Item></Col>
                 <Col xs={24}><Form.Item label="Bio" name="bio"><TextArea rows={4}/></Form.Item></Col>
               </Row>
            </TabPane>

            <TabPane tab={<span><EnvironmentOutlined /> Location</span>} key="location">
               <Row gutter={[24, 16]}>
                 <Col xs={12}>
                    <Form.Item label="Country" name="country">
                       <Select showSearch optionFilterProp="label" filterOption={filterOption} onChange={() => form.setFieldsValue({state:null, city:null})}>
                          {locationCountries.map(c => <Option key={c.isoCode} value={c.isoCode} label={c.name}>{c.flag} {c.name}</Option>)}
                       </Select>
                    </Form.Item>
                 </Col>
                 <Col xs={12}>
                    <Form.Item label="State" name="state">
                       <Select showSearch optionFilterProp="label" filterOption={filterOption} disabled={!selectedCountry} onChange={() => form.setFieldsValue({city:null})}>
                          {availableStates.map(s => <Option key={s.isoCode} value={s.isoCode} label={s.name}>{s.name}</Option>)}
                       </Select>
                    </Form.Item>
                 </Col>
                 <Col xs={12}>
                    <Form.Item label="City" name="city">
                       <Select showSearch optionFilterProp="label" filterOption={filterOption} disabled={!selectedState}>
                          {availableCities.map(c => <Option key={c.name} value={c.name} label={c.name}>{c.name}</Option>)}
                       </Select>
                    </Form.Item>
                 </Col>
                 <Col xs={12}><Form.Item label="PO Box" name="po_box"><Input /></Form.Item></Col>
               </Row>
            </TabPane>

            <TabPane tab={<span><ToolFilled /> Services</span>} key="services">
               <Form.List name="services">
                 {(fields, { add, remove }) => (
                   <>
                     {fields.map(({ key, name, ...restField }) => (
                       <Card key={key} size="small" className="mb-4 bg-gray-50" extra={<Button danger icon={<DeleteOutlined />} onClick={() => remove(name)} />}>
                         <Row gutter={[16, 16]}>
                           <Col xs={12}>
                             <Form.Item {...restField} label="Service" name={[name, 'category']} rules={[{required:true}]}>
                               <Select onChange={(val) => handleSubcategoryChange(val, name)}>{subcategories.map(s => <Option key={s._id} value={s._id}>{s.label}</Option>)}</Select>
                             </Form.Item>
                           </Col>
                           <Col xs={12}>
                             <Form.Item {...restField} label="Types" name={[name, 'types']} rules={[{required:true}]}><Select mode="multiple">{(typesMap[name] || []).map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}</Select></Form.Item>
                           </Col>
                           <Col xs={24}><Form.Item {...restField} label="Description" name={[name, 'description']}><TextArea rows={2}/></Form.Item></Col>
                           <Col xs={24}><Form.Item {...restField} name={[name, 'isActive']} valuePropName="checked"><Switch checkedChildren="Active" unCheckedChildren="Inactive"/></Form.Item></Col>
                         </Row>
                       </Card>
                     ))}
                     <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Service</Button>
                   </>
                 )}
               </Form.List>
            </TabPane>

            <TabPane tab={<span><CreditCardOutlined /> Rate Card</span>} key="rate-card">
               {freelancer.services_offered?.length ? <Table dataSource={freelancer.services_offered} columns={rateCardColumns} rowKey="_id" pagination={false} scroll={{x:800}} /> : <Alert message="Add services first" type="info"/>}
            </TabPane>

            <TabPane tab={<span><DollarCircleOutlined /> Payment</span>} key="payment">
               <Row gutter={[24, 16]}>
                 <Col xs={12}><Form.Item label="Method" name="preferredMethod"><Select><Option value="Cash">Cash</Option><Option value="Bank Transfer">Bank Transfer</Option></Select></Form.Item></Col>
                 <Col xs={12}><Form.Item label="Currency" name="preferredCurrency"><Select>{currencies.map(c => <Option key={c._id} value={c._id}>{c.code}</Option>)}</Select></Form.Item></Col>
               </Row>
            </TabPane>

            {/* --- 3. DOCUMENTS TAB WITH VISIBLE LIST --- */}
            <TabPane tab={<span><FileTextOutlined /> Documents</span>} key="documents">
               <Row gutter={[24, 24]}>
                 {['resume', 'identityProof', 'addressProof', 'certificate'].map(type => {
                    const doc = freelancer.documents?.find(d => d.type === type);
                    const isRejected = doc?.verified === false && doc?.reason;
                    const isVerified = doc?.verified === true;
                    return (
                      <Col xs={12} key={type}>
                        <Card title={type.toUpperCase()} size="small" className={isRejected ? "border-red-400" : ""}>
                           {isVerified && <div className="text-green-600 mb-2"><CheckCircleOutlined/> Verified</div>}
                           {isRejected && <Alert message={`Rejected: ${doc.reason}`} type="error" showIcon className="mb-2"/>}
                           {doc && !isVerified && !isRejected && <div className="text-blue-600 mb-2">Uploaded (Pending)</div>}
                           
                           {!isVerified && (
                             <Upload 
                                customRequest={isRejected ? (o) => handleReupload(o, doc._id) : (o) => customDocUpload(o, type)}
                                fileList={fileList[type]} // Shows the previous file!
                                onChange={(info) => handleDocumentChange(info, type)}
                                showUploadList={{ showRemoveIcon: true }} // Allow seeing the file
                             >
                                <Button 
                                  danger={isRejected} 
                                  loading={docLoading[type]} 
                                  icon={<UploadOutlined />}
                                >
                                  {isRejected ? "Re-upload" : "Click to Upload"}
                                </Button>
                             </Upload>
                           )}
                           {documentUrls[type] && <div className="text-xs text-green-600 mt-1">Ready to save</div>}
                        </Card>
                      </Col>
                    );
                 })}
               </Row>
            </TabPane>

          </Tabs>
        </Form>
      </div>
    </div>
  );
};

export default UpdateFreelancerProfile;