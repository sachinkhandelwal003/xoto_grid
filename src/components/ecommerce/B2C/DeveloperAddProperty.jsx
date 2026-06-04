import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  InputNumber,
  Upload,
  Switch,
  Alert,
  Divider,
  Checkbox,
  DatePicker,
  Steps,
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined, ArrowLeftOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../manageApi/utils/toast";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const THEME = { primary: "#6d28d9" };
const UPLOAD_API = "https://xoto.ae/api/upload";

const extractPhotoUrl = (fileItem) => {
  const r = fileItem.response;
  if (!r) return null;
  return (
    r.url || r.imageUrl || r.image_url || r.secure_url || r.link || r.path ||
    r.filePath || r.fileUrl ||
    r.data?.url || r.data?.imageUrl || r.data?.secure_url || r.data?.path || r.data?.link ||
    r.file?.url || r.file?.imageUrl || r.file?.image_url || r.file?.secure_url ||
    r.file?.path || r.file?.filePath || r.file?.fileUrl || r.file?.link ||
    r.file?.location || r.file?.key || r.file?.filename || r.file?.name ||
    r.result?.url || r.result?.secure_url ||
    null
  );
};

const customUploadRequest = async ({ file, onSuccess, onError }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(UPLOAD_API, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.message || "Upload failed");
    onSuccess(data, file);
  } catch (err) {
    onError(err);
  }
};

const UAE_LOCALITIES = [
  "Dubai Marina",
  "Downtown Dubai",
  "JVC",
  "Business Bay",
  "Palm Jumeirah",
  "Dubai Hills",
  "Abu Dhabi",
  "Sharjah",
  "Al Barsha",
  "Al Reem Island",
  "Saadiyat Island",
];

const STEPS = [
  "Property Overview",
  "Property Details",
  "Inventory Overview",
  "Other Details",
  "Payment Plan",
  "Developer Details",
  "Submission",
];

export default function DeveloperAddProperty() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const developerId = user?.id || user?._id || user?.sub || user?.userId || null;

  const [form] = Form.useForm();
  // Cache values across step unmount/remount (defensive)
  const formCacheRef = useRef({});
  const hasView = Form.useWatch("hasView", form);
  const allFormValues = Form.useWatch([], form);
  useEffect(() => {}, [allFormValues]);
  const [formLoading, setFormLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const [mainLogoFileList, setMainLogoFileList] = useState([]);
  const [photosArchitecture, setPhotosArchitecture] = useState([]);
  const [photosInterior, setPhotosInterior] = useState([]);
  const [photosLobby, setPhotosLobby] = useState([]);
  const [photosOther, setPhotosOther] = useState([]);
  const [brochureFileList, setBrochureFileList] = useState([]);
  const [developerProfile, setDeveloperProfile] = useState(null);

  useEffect(() => {
    if (!user) {
      showToast("Developer not found. Please log in again.", "error");
      navigate("/dashboard/developer");
    }
  }, [user, navigate]);

  const fetchDeveloperProfile = async () => {
    try {
      const res = await apiService.get("/profile/get-profile-data");
      const profile = res?.data; // because api returns { data: profile }
      if (profile) {
        setDeveloperProfile(profile);
        const devDetails = {
          companyName: profile.companyName || "",
          developerLicenseNumber: profile.developerLicenseNumber || "",
          primaryContactName: profile.primaryContactName || profile.name || "",
          phone: profile.phone_number || "",
          email: profile.email || "",
          logo: profile.logo || ""
        };
        form.setFieldsValue({
          developerDetails: devDetails
        });
      }
    } catch (err) {
      // errors are surfaced via global apiService interceptor toast
    }
  };

  useEffect(() => {
    fetchDeveloperProfile();
  }, []);

  useEffect(() => {
    if (user && !developerProfile) {
      form.setFieldsValue({
        developerName:
          user?.username || user?.companyName || user?.company_name ||
          user?.name || user?.fullName || user?.full_name || "",
      });
    }
  }, [user, form]);

  const validateImageSize = (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) showToast("Image must be smaller than 5MB!", "error");
    return isLt5M || Upload.LIST_IGNORE;
  };

  const isAnyUploading = () =>
    [mainLogoFileList, photosArchitecture, photosInterior,
      photosLobby, photosOther, brochureFileList]
      .some((list) => list.some((f) => f.status === "uploading"));

  const collectUrls = (fileList) =>
    fileList
      .filter((f) => f.status === "done")
      .map((f) => f.url || extractPhotoUrl(f))
      .filter(Boolean);

  const handleSaveDraft = async () => {
    await handleSave("draft");
  };

  const handleSubmitForApproval = async () => {
    await handleSave("submit");
  };

  const handleSave = async (saveType) => {
    // IMPORTANT: in step-based forms, earlier step fields may be unmounted.
    // `getFieldsValue(true)` reads the full store (including unregistered fields).
    const values = form.getFieldsValue(true);

    // Validate required fields
    if (!values.propertyName?.trim()) {
      showToast("Project Name is required", "error");
      return;
    }
    if (!values.locality) {
      showToast("Property Locality is required", "error");
      return;
    }
    if (!values.overview?.trim()) {
      showToast("Project Overview is required", "error");
      return;
    }
    if (!values.priceRangeFrom || !values.priceRangeTo) {
      showToast("Price range is required", "error");
      return;
    }

    if (isAnyUploading()) {
      showToast("Please wait for all photos to finish uploading.", "error");
      return;
    }

    const anyFailed = [mainLogoFileList, photosArchitecture, photosInterior,
      photosLobby, photosOther, brochureFileList]
      .some((list) => list.some((f) => f.status === "error"));
    if (anyFailed) {
      setPhotoError("Some media failed to upload. Please remove and re-upload them.");
      return;
    }

    const mainLogoUrls = collectUrls(mainLogoFileList);
    if (mainLogoUrls.length === 0) {
      setPhotoError("Please upload a main logo image.");
      return;
    }

    let brochureUrl = "";
    if (brochureFileList.length > 0 && brochureFileList[0].status === "done") {
      brochureUrl = brochureFileList[0]?.url || extractPhotoUrl(brochureFileList[0]) || "";
    }

    // FIX: Use 'developer' not 'developerId' - this matches backend schema
    const payload = {
      developer: developerId,  // ← CHANGED: developer instead of developerId
      propertyType: values.propertyType || "Residential",
      unitTypes: values.unitTypes ? [values.unitTypes] : [],
      unitType: values.unitTypes || "apartment",
      propertySubType: "off_plan",
      transactionType: "sell",
      approvalStatus: saveType === "submit" ? "pending" : "draft",  // ← CHANGED: use approvalStatus
      projectName: values.propertyName?.trim(),
      propertyName: values.propertyName?.trim(),
      locality: values.locality,
      area: values.locality,
      completionDate: {
        fullDate: values.completionDate ? values.completionDate.format("YYYY-MM-DD") : null,
      },
      overview: values.overview?.trim(),
      description: values.overview?.trim(),
      priceRange: {
        from: values.priceRangeFrom || 0,
        to: values.priceRangeTo || 0,
      },
      price_min: values.priceRangeFrom || 0,
      price_max: values.priceRangeTo || 0,
      price: values.priceRangeFrom || 0,
      media: {
        mainLogo: mainLogoUrls[0],
        architectureImages: collectUrls(photosArchitecture),
        interiorImages: collectUrls(photosInterior),
        lobbyImages: collectUrls(photosLobby),
        otherImages: collectUrls(photosOther),
        youtubeVideos: values.youtubeVideos || [],
      },
      location: {
        address: values.address || "",
        latitude: values.latitude || null,
        longitude: values.longitude || null,
      },
      brochure: brochureUrl,
      buildings: values.buildings || [],
      amenities: values.amenities || [],
      floorPlans: values.floorPlans || [],
      inventory: values.inventory || [],
      parkingAllocation: values.parkingAllocation || "",
      parkingSpaces: values.parkingSpaces || 0,
      numberOfFloors: values.floors || 0,
      furnishingStatus: (values.furnishing === "unfurnished" ? "Unfurnished" :
        values.furnishing === "semi-furnished" ? "Semi-Furnished" :
          values.furnishing === "fully-furnished" ? "Fully Furnished" : "Unfurnished"),
      serviceCharge: values.serviceCharge || "",
      constructionProgress: values.constructionProgress || 0,
      paymentPlan: values.paymentPlan || [],
      projectStatus: values.projectStatus || "presale",
      developmentStatus: values.developmentStatus || "Planned",
      saleStatus: values.saleStatus || "Available",
      isFeatured: values.isFeatured || false,
      developerDetails: {
        companyName: developerProfile?.companyName || user?.companyName || user?.username || "",
        contactName: developerProfile?.primaryContactName || developerProfile?.name || user?.name || "",
        email: developerProfile?.email || user?.email || "",
        phone: developerProfile?.phone_number || developerProfile?.phone || user?.phone || "",
        logo: developerProfile?.logo || user?.logo || "",
      },
    };

    // Remove undefined values
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    setPhotoError("");

    try {
      setFormLoading(true);
      const res = await apiService.post("/properties", payload);

      const savedProperty = res?.data?.data || res?.data;
      if (savedProperty) {
        showToast(saveType === "submit"
          ? "Property submitted successfully! Waiting for admin approval."
          : "Property saved as draft successfully!", "success");

        navigate("/dashboard/developer/developer-properties");
      } else {
        showToast(res?.message || "Failed to save property. No data returned.", "error");
      }
    } catch (error) {
      showToast(error?.response?.data?.message || error?.message || "Something went wrong while saving.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleFinishFailed = ({ errorFields }) => {
    if (errorFields?.length > 0) {
      showToast(errorFields[0]?.errors?.[0] || "Please fill in all required fields.", "error");
    }
  };

  const renderPaymentPlanFields = () => (
    <Form.List name="paymentPlan">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Card key={key} style={{ marginBottom: 16 }}>
              <Row gutter={16} align="middle">
                <Col span={20}>
                  <Form.Item
                    {...restField}
                    name={[name, "title"]}
                    label="Plan Title"
                    rules={[{ required: true, message: "Title is required" }]}
                  >
                    <Input placeholder="e.g., Standard Payment Plan" />
                  </Form.Item>
                </Col>
                <Col span={4} style={{ textAlign: "right" }}>
                  <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                </Col>
              </Row>

              <Form.List name={[name, "stages"]}>
                {(stageFields, { add: addStage, remove: removeStage }) => (
                  <>
                    {stageFields.map(({ key: sk, name: sn, ...sr }) => (
                      <Row key={sk} gutter={16} align="middle">
                        <Col span={6}>
                          <Form.Item {...sr} name={[sn, "stage"]} label="Stage" rules={[{ required: true }]}>
                            <Select placeholder="Select stage">
                              <Option value="on_booking">On Booking</Option>
                              <Option value="during_construction">During Construction</Option>
                              <Option value="upon_handover">Upon Handover</Option>
                              <Option value="other">Other</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item {...sr} name={[sn, "percentage"]} label="Percentage (%)" rules={[{ required: true }]}>
                            <InputNumber min={0} max={100} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item {...sr} name={[sn, "description"]} label="Description">
                            <Input placeholder="Optional" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => removeStage(sn)} />
                        </Col>
                      </Row>
                    ))}
                    <Button type="dashed" onClick={() => addStage()} block icon={<PlusOutlined />}>
                      Add Stage
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          ))}
          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
            Add Payment Plan
          </Button>
        </>
      )}
    </Form.List>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Property Overview</Divider>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="propertyName" label="Project Name" rules={[{ required: true, message: "Enter project name" }]}>
                  <Input placeholder="e.g., Luxury Tower Downtown" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="locality" label="Property Locality" rules={[{ required: true }]}>
                  <Select showSearch placeholder="Select locality">
                    {UAE_LOCALITIES.map(locality => (
                      <Option key={locality} value={locality}>{locality}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="completionDate" label="Completion Date">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="propertyType" label="Property Type" rules={[{ required: true }]}>
                  <Select>
                    <Option value="Residential">Residential</Option>
                    <Option value="Commercial">Commercial</Option>
                    <Option value="Mixed-Use">Mixed-Use</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="unitTypes" label="Unit Types" rules={[{ required: true, message: "Select a unit type" }]}>
                  <Select placeholder="Select unit type">
                    <Option value="apartment">Apartment</Option>
                    <Option value="penthouse">Penthouse</Option>
                    <Option value="villa">Villa</Option>
                    <Option value="townhouse">Townhouse</Option>
                    <Option value="duplex">Duplex</Option>
                    <Option value="office">Office</Option>
                    <Option value="retail">Retail</Option>
                    <Option value="warehouse">Warehouse</Option>
                    <Option value="plot">Plot</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        );
      case 1:
        return (
          <>
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Property Details</Divider>

            <Divider orientation="left" style={{ fontSize: 14 }}>Overview & Pricing</Divider>
            <Form.Item name="overview" label="Project Overview / Description" rules={[{ required: true, message: "Description is required" }]}>
              <TextArea rows={4} placeholder="Describe the property..." />
            </Form.Item>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name="priceRangeFrom" label="From Price (AED)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="priceRangeTo" label="To Price (AED)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" style={{ fontSize: 14 }}>Media</Divider>
            <Form.Item label="Main Logo" required>
              <Upload
                listType="picture-card"
                fileList={mainLogoFileList}
                customRequest={customUploadRequest}
                beforeUpload={validateImageSize}
                accept="image/*"
                onChange={({ fileList }) => setMainLogoFileList(fileList)}
                maxCount={1}
              >
                {mainLogoFileList.length === 0 && (
                  <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload Logo</div></div>
                )}
              </Upload>
            </Form.Item>
            {[
              ["Property Photos - Architecture (min 3, max 20)", photosArchitecture, setPhotosArchitecture],
              ["Property Photos - Interiors (min 3, max 20)", photosInterior, setPhotosInterior],
              ["Property Photos - Lobby (min 1, max 10)", photosLobby, setPhotosLobby],
            ].map(([label, state, setter]) => (
              <Form.Item label={label} key={label}>
                <Upload
                  listType="picture-card"
                  fileList={state}
                  customRequest={customUploadRequest}
                  beforeUpload={validateImageSize}
                  accept="image/*"
                  onChange={({ fileList }) => setter(fileList)}
                  multiple
                >
                  <div><PlusOutlined /><div style={{ marginTop: 8 }}>Add Photos</div></div>
                </Upload>
              </Form.Item>
            ))}
            <Form.List name="youtubeVideos">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={16}>
                      <Col span={22}>
                        <Form.Item {...restField} name={name} label="YouTube Video URL">
                          <Input placeholder="https://youtube.com/..." />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Button type="dashed" block onClick={() => add()} icon={<PlusOutlined />}>
                    Add YouTube Video
                  </Button>
                </>
              )}
            </Form.List>
            <Form.Item label="Brochure (PDF)">
              <Upload
                fileList={brochureFileList}
                customRequest={customUploadRequest}
                beforeUpload={(file) => {
                  const isPDF = file.type === "application/pdf";
                  if (!isPDF) showToast("Only PDF files are allowed!", "error");
                  return isPDF || Upload.LIST_IGNORE;
                }}
                accept=".pdf"
                onChange={({ fileList }) => setBrochureFileList(fileList)}
                maxCount={1}
              >
                <Button icon={<PlusOutlined />}>Upload Brochure</Button>
              </Upload>
            </Form.Item>

            <Divider orientation="left" style={{ fontSize: 14 }}>Location</Divider>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name="address" label="Address / Location">
                  <Input placeholder="Full address" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name="latitude" label="Latitude">
                  <InputNumber step={0.000001} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="longitude" label="Longitude">
                  <InputNumber step={0.000001} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" style={{ fontSize: 14 }}>Project Plan</Divider>
            <Form.Item label="General Plan (PDF or Image)">
              <Upload
                listType="picture-card"
                customRequest={customUploadRequest}
                beforeUpload={validateImageSize}
                accept=".pdf,image/*"
                multiple
              >
                <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload Plan</div></div>
              </Upload>
            </Form.Item>

            <Divider orientation="left" style={{ fontSize: 14 }}>Buildings in the Project</Divider>
            <Form.List name="buildings">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Card key={key} style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item name={[name, "title"]} label="Facility/Building Title">
                            <Input />
                          </Form.Item>
                          <Form.Item name={[name, "image"]} label="Image">
                            <Upload listType="picture-card" customRequest={customUploadRequest} beforeUpload={validateImageSize} accept="image/*">
                              <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload Image</div></div>
                            </Upload>
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item name={[name, "description"]} label="Short Description">
                            <TextArea rows={2} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Button danger onClick={() => remove(name)}>Delete Building</Button>
                    </Card>
                  ))}
                  <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>Add Building</Button>
                </>
              )}
            </Form.List>

            <Divider orientation="left" style={{ fontSize: 14 }}>Facilities</Divider>
            <Form.Item name="amenities" label="Amenities">
              <Checkbox.Group>
                <Row gutter={[16, 8]}>
                  {[
                    "Swimming Pool", "Gym", "Lounge", "Smart Home", "Concierge",
                    "Parking", "Children Play Area", "Gardens", "Security"
                  ].map(amenity => (
                    <Col span={8} key={amenity}>
                      <Checkbox value={amenity}>{amenity}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Divider orientation="left" style={{ fontSize: 14 }}>Floor Plan & Unit Details</Divider>
            <Form.List name="floorPlans">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Row key={key} gutter={16} align="middle">
                      <Col span={8}>
                        <Form.Item name={[name, "unitType"]} label="Unit Type">
                          <Input placeholder="e.g., 1BR, 2BR, Studio" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item name={[name, "areaFrom"]} label="Area From (sq ft)">
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item name={[name, "areaTo"]} label="Area To (sq ft)">
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Button danger onClick={() => remove(name)}>Delete</Button>
                      </Col>
                    </Row>
                  ))}
                  <Button type="dashed" block onClick={() => add()}>Add Unit Type</Button>
                </>
              )}
            </Form.List>
          </>
        );
      case 2:
        return (
          <>
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Inventory Overview</Divider>
            <Form.List name="inventory">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Row key={key} gutter={16} align="middle">
                      <Col span={6}>
                        <Form.Item name={[name, "unitType"]} label="Unit Type">
                          <Select placeholder="Select unit type">
                            <Option value="Studio">Studio</Option>
                            <Option value="1BR">1BR</Option>
                            <Option value="2BR">2BR</Option>
                            <Option value="3BR">3BR</Option>
                            <Option value="4BR">4BR</Option>
                            <Option value="5BR">5BR</Option>
                            <Option value="6BR">6BR</Option>
                            <Option value="7BR">7BR</Option>
                            <Option value="8BR+">8BR+</Option>
                            <Option value="Penthouse">Penthouse</Option>
                            <Option value="Villa">Villa</Option>
                            <Option value="Townhouse">Townhouse</Option>
                            <Option value="Duplex">Duplex</Option>
                            <Option value="Plot">Plot</Option>
                            <Option value="Office">Office</Option>
                            <Option value="Retail">Retail</Option>
                            <Option value="Warehouse">Warehouse</Option>
                            <Option value="Apartment">Apartment</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item name={[name, "units"]} label="Number of Units">
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item name={[name, "sqft"]} label="Starting Sq Ft">
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item name={[name, "sqm"]} label="Starting Sq M">
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button danger onClick={() => remove(name)}>X</Button>
                      </Col>
                    </Row>
                  ))}
                  <Button type="dashed" block onClick={() => add()}>Add Unit Type</Button>
                </>
              )}
            </Form.List>
            <Form.Item name="parkingAllocation" label="Parking Allocation">
              <TextArea rows={2} placeholder="e.g., 1 allocated space per unit; 2 spaces for 3BR and above" />
            </Form.Item>
          </>
        );
      case 3:
        return (
          <>
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Other Details</Divider>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name="floors" label="Number of Floors">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="furnishing" label="Furnishing Status">
                  <Select>
                    <Option value="unfurnished">Unfurnished</Option>
                    <Option value="semi-furnished">Semi-Furnished</Option>
                    <Option value="fully-furnished">Fully Furnished</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name="serviceCharge" label="Service Charge (AED per sq ft, annual)">
                  <Input placeholder="e.g., 15" />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="constructionProgress" label="Construction Readiness Progress (%)">
                  <InputNumber min={0} max={100} style={{ width: "100%" }} addonAfter="%" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name="developmentStatus" label="Development Status">
                  <Select>
                    <Option value="Planned">Planned</Option>
                    <Option value="Under Construction">Under Construction</Option>
                    <Option value="Completed">Completed</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="saleStatus" label="Sale Status">
                  <Select>
                    <Option value="Available">Available</Option>
                    <Option value="Reserved">Reserved</Option>
                    <Option value="Sold">Sold</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name="isFeatured" label="Featured Listing" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="projectStatus" label="Project Status">
                  <Select>
                    <Option value="presale">Pre-Sale</Option>
                    <Option value="under_construction">Under Construction</Option>
                    <Option value="ready">Ready</Option>
                    <Option value="sold_out">Sold Out</Option>
                    <Option value="planned">Planned</Option>
                    <Option value="completed">Completed</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        );
      case 4:
        return (
          <>
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Payment Plan</Divider>
            {renderPaymentPlanFields()}
          </>
        );
      case 5:
        return (
          <>
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Developer Details</Divider>
            <Alert
              message="Developer details are auto-populated from your profile"
              description="Any changes must be made via the Profile section."
              type="info"
              style={{ marginBottom: 16 }}
            />
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={["developerDetails", "companyName"]} label="Company Name">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={["developerDetails", "developerLicenseNumber"]} label="Developer Licence Number">
                  <Input readOnly style={{ backgroundColor: "#f5f5f5" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={["developerDetails", "primaryContactName"]} label="Primary Contact Name">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={["developerDetails", "phone"]} label="Phone">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={["developerDetails", "email"]} label="Email">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        );
      case 6:
        return (
          <>
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Submission</Divider>
            <Alert
              message="You can save as draft, preview, or submit for approval"
              description="Your listing will not be visible on the public portal until approved by Xoto admin."
              type="info"
              style={{ marginBottom: 24 }}
            />
          </>
        );
      default:
        return null;
    }
  };

 const handleNext = async () => {
  try {
    const values = await form.validateFields();
    formCacheRef.current = { ...formCacheRef.current, ...values };
    setCurrentStep(currentStep + 1);
  } catch (error) {
    // Ant Design's validateFields throws an object with errorFields
    if (error.errorFields) {
      // Form automatically shows errors, you can just log or add analytics
      console.log('Form has errors:', error.errorFields);
    }
  }
};

  const handlePrev = () => {
    formCacheRef.current = { ...formCacheRef.current, ...form.getFieldsValue(true) };
    setCurrentStep(currentStep - 1);
  };

  // Re-apply cached values when step changes (prevents “lost data” reports)
  useEffect(() => {
    if (Object.keys(formCacheRef.current).length > 0) {
      form.setFieldsValue(formCacheRef.current);
    }
  }, [currentStep, form]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard/developer/developer-projects")}
            style={{ marginRight: 16 }}
          >
            Back
          </Button>
          <Title level={3} style={{ display: "inline-block", margin: 0 }}>
            Create New Project Listing
          </Title>
        </Col>
      </Row>

      <Steps current={currentStep} items={STEPS.map((title) => ({ title }))} style={{ marginBottom: 24 }} />

      <Card className="shadow-sm rounded-xl">
        <Form
          form={form}
          layout="vertical"
          preserve={true}
          onValuesChange={(_, all) => {
            formCacheRef.current = { ...formCacheRef.current, ...all };
          }}
          initialValues={{
            currency: "AED",
            builtUpAreaUnit: "sqft",
            unitType: "apartment",
            bedroomType: "1bed",
            bedrooms: 1,
            bathrooms: 1,
            propertyType: "Residential",
            furnishing: "unfurnished",
            parkingSpaces: 0,
            ownershipType: "freehold",
            projectStatus: "presale",
            developmentStatus: "Planned",
            saleStatus: "Available",
            isFeatured: false,
            readinessProgress: "0%",
            hasView: false,
            viewType: [],
            showContactOnlyVerified: false,
            shareCommission: false,
            shareCommissionPercentage: 0,
          }}
        >
          {renderStepContent()}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
            <div>
              {currentStep > 0 && (
                <Button onClick={handlePrev} style={{ marginRight: 8 }}>
                  Previous
                </Button>
              )}
            </div>
            <div>
              {currentStep < STEPS.length - 1 ? (
                <Button type="primary" onClick={handleNext} style={{ backgroundColor: THEME.primary }}>
                  Next
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSaveDraft}
                  >
                    Save Draft
                  </Button>

                  <Button
                    type="primary"
                    onClick={handleSubmitForApproval}
                  >
                    Submit For Approval
                  </Button>
                </>
              )}
            </div>
          </div>

          {photoError && (
            <Alert type="error" message={photoError} showIcon style={{ marginTop: 16 }} />
          )}
        </Form>
      </Card>
    </div>
  );
}
