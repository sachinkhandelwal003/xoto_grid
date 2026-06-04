import React, { useState, useEffect } from "react";
import {
  Steps,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Card,
  Row,
  Col,
  Checkbox,
  InputNumber,
  DatePicker,
  Space,
  message,
  Divider,
  Typography
} from "antd";
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { useNavigate } from "react-router-dom";

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const AdminOffPlanCreate = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Photo categorization state
  const [architecturePhotos, setArchitecturePhotos] = useState([]);
  const [interiorPhotos, setInteriorPhotos] = useState([]);
  const [lobbyPhotos, setLobbyPhotos] = useState([]);

  // Materials & Links uploads
  const [marketingBrochure, setMarketingBrochure] = useState(null);
  const [floorPlans, setFloorPlans] = useState(null);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      const response = await apiService.get("/developer/all");
      setDevelopers(response.data || []);
    } catch (error) {
      message.error("Failed to load developers");
    }
  };

  const handlePhotoUpload = async (file, category) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post("/upload", formData);
      const photoUrl = response.data.url;

      if (category === "architecture") {
        setArchitecturePhotos([...architecturePhotos, photoUrl]);
      } else if (category === "interior") {
        setInteriorPhotos([...interiorPhotos, photoUrl]);
      } else if (category === "lobby") {
        setLobbyPhotos([...lobbyPhotos, photoUrl]);
      }

      message.success("Photo uploaded successfully");
      return false; // Prevent auto upload
    } catch (error) {
      message.error("Photo upload failed");
      return false;
    }
  };

  const handleFileUpload = async (file, type) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post("/upload", formData);
      const fileUrl = response.data.url;

      if (type === "brochure") {
        setMarketingBrochure(fileUrl);
      } else if (type === "floorplan") {
        setFloorPlans(fileUrl);
      }

      message.success("File uploaded successfully");
      return false;
    } catch (error) {
      message.error("File upload failed");
      return false;
    }
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error("Please fill in all required fields");
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Combine all photos
      const allPhotos = [
        ...architecturePhotos,
        ...interiorPhotos,
        ...lobbyPhotos
      ];

      const propertyData = {
        // Property Overview
        developer: values.developer,
        projectName: values.projectName,
        location: values.location,
        completionDate: values.completionDate,
        propertyType: values.propertyType,

        // Property Details
        overview: values.overview,
        photos: allPhotos,
        propertyVideos: values.propertyVideos || [],
        googleLocation: values.googleLocation,
        generalPlan: values.generalPlan,
        
        // Materials & Links (Pro Agent only)
        marketingBrochure: marketingBrochure,
        floorPlans: floorPlans,
        websiteLink: values.websiteLink,

        // Floor Plans & Unit Details
        unitDetails: values.unitDetails || [],

        buildingsInProject: values.buildingsInProject,
        
        // Facilities
        facilities: {
          luxuryAmenities: values.luxuryAmenities || [],
          outdoorRecreational: values.outdoorRecreational || [],
          communityConvenience: values.communityConvenience || [],
          officeSpaces: values.officeSpaces || [],
          retailHospitality: values.retailHospitality || [],
          other: values.otherFacilities || ""
        },

        // Inventory Overview
        inventoryOverview: values.inventoryOverview || [],

        // Other Details
        completionQuarter: values.completionQuarter,
        status: values.status,
        unitTypes: values.unitTypes || [],
        floors: values.floors,
        furnishing: values.furnishing,
        serviceCharge: values.serviceCharge || "No info",
        readinessProgress: values.readinessProgress || "No info",

        // Payment Plan
        paymentPlan: values.paymentPlan || [],
        eoi: values.eoi,
        resaleConditions: values.resaleConditions || "Not specified",

        // Commission
        shareCommission: values.shareCommission || false,
        commission: values.commission || 0,

        // Auto-set fields for off-plan
        listingType: "developer",
        approvalStatus: "approved",
        projectType: "new"
      };

      await apiService.post("/property/create", propertyData);
      message.success("Off-plan property created successfully!");
      navigate("/dashboard/admin/properties");
    } catch (error) {
      message.error("Failed to create property");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Property Overview
  const renderPropertyOverview = () => (
    <Card title="Property Overview">
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Developer Name"
              name="developer"
              rules={[{ required: true, message: "Please select a developer" }]}
            >
              <Select placeholder="Select Developer" showSearch>
                {developers.map((dev) => (
                  <Option key={dev._id} value={dev._id}>
                    {dev.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Project Name"
              name="projectName"
              rules={[{ required: true, message: "Please enter project name" }]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Location"
              name="location"
              rules={[{ required: true, message: "Please enter location" }]}
            >
              <Input placeholder="e.g., Dubai Marina, JBR" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Completion Date"
              name="completionDate"
              rules={[{ required: true, message: "Please select completion date" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Property Type"
              name="propertyType"
              rules={[{ required: true, message: "Please select property type" }]}
            >
              <Select placeholder="Select Type">
                <Option value="Residential">Residential</Option>
                <Option value="Commercial">Commercial</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  // STEP 2: Property Details
  const renderPropertyDetails = () => (
    <Card title="Property Details">
      <Form form={form} layout="vertical">
        <Form.Item
          label="Overview (Description)"
          name="overview"
          rules={[{ required: true, message: "Please enter overview" }]}
        >
          <TextArea rows={4} placeholder="Detailed description of the property..." />
        </Form.Item>

        <Divider>Property Photos (Category-wise Upload)</Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Architecture Photos</Text>
            <Upload
              beforeUpload={(file) => handlePhotoUpload(file, "architecture")}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Upload Architecture</Button>
            </Upload>
            <div style={{ marginTop: 8 }}>
              {architecturePhotos.length} photos uploaded
            </div>
          </Col>

          <Col span={8}>
            <Text strong>Interior Photos</Text>
            <Upload
              beforeUpload={(file) => handlePhotoUpload(file, "interior")}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Upload Interior</Button>
            </Upload>
            <div style={{ marginTop: 8 }}>
              {interiorPhotos.length} photos uploaded
            </div>
          </Col>

          <Col span={8}>
            <Text strong>Lobby Photos</Text>
            <Upload
              beforeUpload={(file) => handlePhotoUpload(file, "lobby")}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Upload Lobby</Button>
            </Upload>
            <div style={{ marginTop: 8 }}>
              {lobbyPhotos.length} photos uploaded
            </div>
          </Col>
        </Row>

        <Divider>Additional Media</Divider>

        <Form.Item label="Property Videos (YouTube Links)" name="propertyVideos">
          <Form.List name="propertyVideos">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline">
                    <Form.Item {...field} noStyle>
                      <Input placeholder="YouTube URL" style={{ width: 400 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  Add Video Link
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item label="Google Location Pin" name="googleLocation">
          <Input placeholder="Google Maps URL or coordinates" />
        </Form.Item>

        <Form.Item label="General Plan" name="generalPlan">
          <TextArea rows={3} placeholder="General plan details..." />
        </Form.Item>

        <Divider>Materials & Links (Pro Agent Access)</Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Marketing Brochure</Text>
            <Upload
              beforeUpload={(file) => handleFileUpload(file, "brochure")}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Upload Brochure (PDF)</Button>
            </Upload>
            {marketingBrochure && <Text type="success">✓ Uploaded</Text>}
          </Col>

          <Col span={8}>
            <Text strong>Floor Plans & Unit Details</Text>
            <Upload
              beforeUpload={(file) => handleFileUpload(file, "floorplan")}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Upload Floor Plans (PDF)</Button>
            </Upload>
            {floorPlans && <Text type="success">✓ Uploaded</Text>}
          </Col>

          <Col span={8}>
            <Form.Item label="Website Link" name="websiteLink">
              <Input placeholder="https://example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Unit Details (Apartment Types & Pricing)</Divider>

        <Form.List name="unitDetails">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Card key={field.key} size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        {...field}
                        name={[field.name, "apartmentType"]}
                        label="Apartment Type"
                      >
                        <Input placeholder="e.g., Studio, 1BR" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...field}
                        name={[field.name, "priceFrom"]}
                        label="Price From (AED)"
                      >
                        <InputNumber style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...field}
                        name={[field.name, "priceTo"]}
                        label="Price To (AED)"
                      >
                        <InputNumber style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...field}
                        name={[field.name, "sqftFrom"]}
                        label="Sq Ft From"
                      >
                        <InputNumber style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...field}
                        name={[field.name, "sqftTo"]}
                        label="Sq Ft To"
                      >
                        <InputNumber style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <MinusCircleOutlined
                        onClick={() => remove(field.name)}
                        style={{ marginTop: 40 }}
                      />
                    </Col>
                  </Row>
                </Card>
              ))}
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                Add Unit Type
              </Button>
            </>
          )}
        </Form.List>

        <Divider style={{ marginTop: 24 }} />

        <Form.Item label="Buildings in the Project" name="buildingsInProject">
          <InputNumber style={{ width: "100%" }} placeholder="Number of buildings" />
        </Form.Item>
      </Form>
    </Card>
  );

  // STEP 3: Facilities & Inventory
  const renderFacilitiesInventory = () => {
    const propertyType = form.getFieldValue("propertyType");

    return (
      <Card title="Facilities & Inventory Overview">
        <Form form={form} layout="vertical">
          {propertyType === "Residential" && (
            <>
              <Divider>Luxury/High-End Amenities</Divider>
              <Form.Item name="luxuryAmenities">
                <Checkbox.Group style={{ width: "100%" }}>
                  <Row>
                    <Col span={8}><Checkbox value="Swimming Pool">Swimming Pool</Checkbox></Col>
                    <Col span={8}><Checkbox value="Gym & Fitness Center">Gym & Fitness Center</Checkbox></Col>
                    <Col span={8}><Checkbox value="Clubhouse & Lounge">Clubhouse & Lounge</Checkbox></Col>
                    <Col span={8}><Checkbox value="Smart Home Features">Smart Home Features</Checkbox></Col>
                    <Col span={8}><Checkbox value="Concierge Services">Concierge Services</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Divider>Outdoor & Recreational</Divider>
              <Form.Item name="outdoorRecreational">
                <Checkbox.Group style={{ width: "100%" }}>
                  <Row>
                    <Col span={8}><Checkbox value="Landscaped Gardens">Landscaped Gardens</Checkbox></Col>
                    <Col span={8}><Checkbox value="Children's Play Area">Children's Play Area</Checkbox></Col>
                    <Col span={8}><Checkbox value="Jogging & Cycling Tracks">Jogging & Cycling Tracks</Checkbox></Col>
                    <Col span={8}><Checkbox value="Barbecue Area">Barbecue Area</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Divider>Community & Convenience</Divider>
              <Form.Item name="communityConvenience">
                <Checkbox.Group style={{ width: "100%" }}>
                  <Row>
                    <Col span={8}><Checkbox value="Supermarkets/Retail Shops">Supermarkets/Retail Shops</Checkbox></Col>
                    <Col span={8}><Checkbox value="Cafes & Restaurants">Cafes & Restaurants</Checkbox></Col>
                    <Col span={8}><Checkbox value="Schools & Nurseries">Schools & Nurseries</Checkbox></Col>
                    <Col span={8}><Checkbox value="Medical Clinics & Pharmacies">Medical Clinics & Pharmacies</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </>
          )}

          {propertyType === "Commercial" && (
            <>
              <Divider>Office Spaces</Divider>
              <Form.Item name="officeSpaces">
                <Checkbox.Group style={{ width: "100%" }}>
                  <Row>
                    <Col span={8}><Checkbox value="High-Speed Internet">High-Speed Internet</Checkbox></Col>
                    <Col span={8}><Checkbox value="Conference/Meeting Rooms">Conference/Meeting Rooms</Checkbox></Col>
                    <Col span={8}><Checkbox value="Business Lounge">Business Lounge</Checkbox></Col>
                    <Col span={8}><Checkbox value="Cafeteria & Pantry">Cafeteria & Pantry</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Divider>Retail & Hospitality Spaces</Divider>
              <Form.Item name="retailHospitality">
                <Checkbox.Group style={{ width: "100%" }}>
                  <Row>
                    <Col span={8}><Checkbox value="Customer Parking">Customer Parking</Checkbox></Col>
                    <Col span={8}><Checkbox value="Valet Service">Valet Service</Checkbox></Col>
                    <Col span={8}><Checkbox value="Centralized Air Conditioning">Centralized Air Conditioning</Checkbox></Col>
                    <Col span={8}><Checkbox value="Signage & Branding Spaces">Signage & Branding Spaces</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </>
          )}

          <Divider>Other Facilities</Divider>
          <Form.Item name="otherFacilities">
            <TextArea rows={2} placeholder="Specify any other facilities..." />
          </Form.Item>

          <Divider style={{ marginTop: 32 }}>Inventory Overview</Divider>

          <Form.List name="inventoryOverview">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Card key={field.key} size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "apartmentType"]}
                          label="Apartment Type"
                        >
                          <Input placeholder="e.g., Studio, 1BR, 2BR" />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...field}
                          name={[field.name, "noOfUnits"]}
                          label="No. of Units"
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...field}
                          name={[field.name, "startingFrom"]}
                          label="Starting From (sq ft)"
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...field}
                          name={[field.name, "parkingAllocation"]}
                          label="Parking"
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                          style={{ marginTop: 40 }}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                  Add Inventory Item
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Card>
    );
  };

  // STEP 4: Other Details
  const renderOtherDetails = () => (
    <Card title="Other Details">
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Completion Quarter & Year"
              name="completionQuarter"
              rules={[{ required: true, message: "Please select completion quarter" }]}
            >
              <Select placeholder="Select Quarter">
                <Option value="Q1 2024">Q1 2024</Option>
                <Option value="Q2 2024">Q2 2024</Option>
                <Option value="Q3 2024">Q3 2024</Option>
                <Option value="Q4 2024">Q4 2024</Option>
                <Option value="Q1 2025">Q1 2025</Option>
                <Option value="Q2 2025">Q2 2025</Option>
                <Option value="Q3 2025">Q3 2025</Option>
                <Option value="Q4 2025">Q4 2025</Option>
                <Option value="Q1 2026">Q1 2026</Option>
                <Option value="Q2 2026">Q2 2026</Option>
                <Option value="Q3 2026">Q3 2026</Option>
                <Option value="Q4 2026">Q4 2026</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select Status">
                <Option value="Presale">Presale</Option>
                <Option value="Under Construction">Under Construction</Option>
                <Option value="Ready">Ready</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Unit Types"
              name="unitTypes"
              rules={[{ required: true, message: "Please select unit types" }]}
            >
              <Select mode="multiple" placeholder="Select Unit Types">
                <Option value="Apartment">Apartment</Option>
                <Option value="Villa">Villa</Option>
                <Option value="Townhouse">Townhouse</Option>
                <Option value="Duplex">Duplex</Option>
                <Option value="Penthouse">Penthouse</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Floors" name="floors">
              <Input placeholder="Number of floors" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Furnishing" name="furnishing">
              <Select placeholder="Select Furnishing">
                <Option value="Fully Furnished">Fully Furnished</Option>
                <Option value="Semi-Furnished">Semi-Furnished</Option>
                <Option value="Unfurnished">Unfurnished</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Service Charge Info" name="serviceCharge">
              <Input placeholder="Service charge details (default: No info)" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Readiness Progress (%)" name="readinessProgress">
              <Input placeholder="Completion percentage (default: No info)" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  // STEP 5: Payment Plan & Commission
  const renderPaymentPlan = () => (
    <Card title="Payment Plan & Commission">
      <Form form={form} layout="vertical">
        <Divider>Payment Plan Milestones</Divider>

        <Form.List name="paymentPlan">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Card key={field.key} size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        {...field}
                        name={[field.name, "title"]}
                        label="Payment Plan Title"
                      >
                        <Input placeholder="e.g., On Booking, During Construction" />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...field}
                        name={[field.name, "percentage"]}
                        label="Percentage (%)"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={100}
                          placeholder="0-100"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <MinusCircleOutlined
                        onClick={() => remove(field.name)}
                        style={{ marginTop: 40 }}
                      />
                    </Col>
                  </Row>
                </Card>
              ))}
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                Add Payment Milestone
              </Button>
            </>
          )}
        </Form.List>

        <Divider style={{ marginTop: 32 }}>EOI & Resale Conditions</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="EOI (Expression of Interest)"
              name="eoi"
              rules={[{ required: true, message: "Please enter EOI amount" }]}
              tooltip="EOI is a refundable or non-refundable token amount that a buyer submits to indicate their serious interest in purchasing a property"
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter EOI amount in AED"
                formatter={(value) => `AED ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/AED\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Conditions for Unit Resale"
              name="resaleConditions"
              tooltip="If not specified, will display 'Not specified'"
            >
              <TextArea rows={3} placeholder="Enter resale conditions (optional)" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Commission Details</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Share Commission with Partner" name="shareCommission" valuePropName="checked">
              <Checkbox>Yes, share commission</Checkbox>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Commission Percentage (%)"
              name="commission"
              dependencies={["shareCommission"]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                disabled={!form.getFieldValue("shareCommission")}
                placeholder="Enter commission %"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  const steps = [
    {
      title: "Property Overview",
      content: renderPropertyOverview()
    },
    {
      title: "Property Details",
      content: renderPropertyDetails()
    },
    {
      title: "Facilities & Inventory",
      content: renderFacilitiesInventory()
    },
    {
      title: "Other Details",
      content: renderOtherDetails()
    },
    {
      title: "Payment Plan",
      content: renderPaymentPlan()
    }
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card>
        <Title level={2}>Create Off-Plan Property</Title>
        <Text type="secondary">
          Create a new off-plan property listing for developers. This will be automatically approved.
        </Text>

        <Steps current={currentStep} style={{ marginTop: 24, marginBottom: 32 }}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <div>{steps[currentStep].content}</div>

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>Previous</Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                Create Property
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default AdminOffPlanCreate;