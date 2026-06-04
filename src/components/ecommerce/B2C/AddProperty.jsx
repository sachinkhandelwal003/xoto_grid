import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Row,
  Col,
  InputNumber,
  Radio,
  message,
  Divider,
  Typography,
  AutoComplete
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const AddProperty = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projectOption, setProjectOption] = useState("existing"); // 'existing' or 'new'
  const [existingProjects, setExistingProjects] = useState([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetchExistingProjects();
  }, []);

  const fetchExistingProjects = async () => {
    try {
      // Fetch all approved off-plan properties
      const response = await apiService.get("/property");
      const offPlanProperties = response.data.filter(
        (p) => p.listingType === "developer" && p.approvalStatus === "approved"
      );
      setExistingProjects(offPlanProperties);
    } catch (error) {
      message.error("Failed to load existing projects");
    }
  };

  const handleProjectSelect = (projectId) => {
    const selectedProject = existingProjects.find((p) => p._id === projectId);
    if (selectedProject) {
      // Auto-fill project details
      form.setFieldsValue({
        projectName: selectedProject.projectName,
        developerName: selectedProject.developerName,
        location: selectedProject.location
      });
    }
  };

  const handlePhotoUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post("/upload", formData);
      const photoUrl = response.data.url;
      setPhotos([...photos, photoUrl]);
      message.success("Photo uploaded successfully");
      return false; // Prevent auto upload
    } catch (error) {
      message.error("Photo upload failed");
      return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const propertyData = {
        projectType: projectOption,
        projectOption: projectOption, //new field
          propertySubType: "secondary", //new field
        projectName: values.projectName,
        developerName: values.developerName,
         area: values.location, //new field
        location: values.location,
        unitType: values.unitType,
        bedrooms: values.bedrooms,
        price: values.price,
        description: values.description || "",
        photos: photos,
        shareCommission: values.shareCommission || false,
        commission: values.shareCommission ? values.commission : 0,
        
        // Auto-set fields for secondary listing
        listingType: "secondary",
        approvalStatus: "pending" // Goes to admin for approval
      };

     await apiService.post( "/properties",propertyData,
      {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
);
      message.success("Property submitted for admin approval!");
      navigate(-1);
    } catch (error) {
      message.error("Failed to create property");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card>
        <Title level={2}>Add Secondary Property Listing</Title>
        <Text type="secondary">
          Create a secondary property listing. It will be sent to admin for approval.
        </Text>

        <Divider />

        <Form form={form} layout="vertical">
          {/* STEP 1: Choose Project Option */}
          <Card title="Step 1: Enter Project Details" style={{ marginBottom: 24 }}>
            <Form.Item label="Choose Project Option">
              <Radio.Group
                value={projectOption}
                onChange={(e) => setProjectOption(e.target.value)}
              >
                <Radio value="existing">
                  <strong>Option 1:</strong> Projects already created in the system
                </Radio>
                <Radio value="new">
                  <strong>Option 2:</strong> For New Project / Project not listed in the system
                </Radio>
              </Radio.Group>
            </Form.Item>

            {projectOption === "existing" && (
              <>
                <Divider>Choose Existing Project</Divider>
                <Form.Item
                  label="Search & Select Project"
                  name="existingProjectId"
                  rules={[{ required: true, message: "Please select a project" }]}
                >
                  <Select
                    showSearch
                    placeholder="Search for a project (e.g., Sola Residences, Marina Heights)"
                    optionFilterProp="children"
                    onChange={handleProjectSelect}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {existingProjects.map((project) => (
                      <Option key={project._id} value={project._id}>
                        {project.projectName} - {project.location}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Text type="secondary">
                  <i>
                    When you select a project, all project fields will be filled in automatically
                    and other agents will be able to open the project page attached to your ad.
                  </i>
                </Text>

                <Divider />

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Project Name" name="projectName">
                      <Input disabled placeholder="Auto-filled from selected project" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Developer Name" name="developerName">
                      <Input disabled placeholder="Auto-filled from selected project" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Location" name="location">
                      <Input disabled placeholder="Auto-filled from selected project" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {projectOption === "new" && (
              <>
                <Divider>Enter New Project Details Manually</Divider>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Project Name"
                      name="projectName"
                      rules={[{ required: true, message: "Please enter project name" }]}
                    >
                      <Input placeholder="e.g., Sola Residences" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Developer Name"
                      name="developerName"
                      rules={[{ required: true, message: "Please enter developer name" }]}
                    >
                      <Input placeholder="e.g., Emaar Properties" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Location"
                      name="location"
                      rules={[{ required: true, message: "Please select location" }]}
                    >
                      <Select placeholder="Select Location">
                        <Option value="Palm Jumeirah">Palm Jumeirah</Option>
                        <Option value="Dubai Marina">Dubai Marina</Option>
                        <Option value="Downtown Dubai">Downtown Dubai</Option>
                        <Option value="JBR">JBR</Option>
                        <Option value="Business Bay">Business Bay</Option>
                        <Option value="Dubai Hills">Dubai Hills</Option>
                        <Option value="Arabian Ranches">Arabian Ranches</Option>
                        <Option value="Dubai South">Dubai South</Option>
                        <Option value="Al Barsha">Al Barsha</Option>
                        <Option value="Jumeirah Village Circle">Jumeirah Village Circle</Option>
                        <Option value="Dubai Creek Harbour">Dubai Creek Harbour</Option>
                        <Option value="Meydan">Meydan</Option>
                        <Option value="Emirates Hills">Emirates Hills</Option>
                        <Option value="Bluewaters Island">Bluewaters Island</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
          </Card>

          {/* Unit Details */}
          <Card title="Unit Details" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Unit Type"
                  name="unitType"
                  rules={[{ required: true, message: "Please select unit type" }]}
                >
                  <Select placeholder="Select Unit Type">
                    <Option value="Apartment">Apartment</Option>
                    <Option value="Villa">Villa</Option>
                    <Option value="Townhouse">Townhouse</Option>
                    <Option value="Duplex">Duplex</Option>
                    <Option value="Penthouse">Penthouse</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Bedrooms"
                  name="bedrooms"
                  rules={[{ required: true, message: "Please select bedrooms" }]}
                >
                  <Select placeholder="Select Bedrooms">
                    <Option value="Studio">Studio</Option>
                    <Option value="1">1 Bedroom</Option>
                    <Option value="2">2 Bedroom</Option>
                    <Option value="3">3 Bedroom</Option>
                    <Option value="4">4 Bedroom</Option>
                    <Option value="5">5 Bedroom</Option>
                    <Option value="6">6 Bedroom</Option>
                    <Option value="7">7 Bedroom</Option>
                    <Option value="8+">8+ Bedroom</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Unit Price (in AED)"
                  name="price"
                  rules={[{ required: true, message: "Please enter price" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Enter price in AED"
                    formatter={(value) => `AED ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => value.replace(/AED\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Unit Area (in sqft)"
                  name="area"
                  rules={[{ required: true, message: "Please enter area" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Enter area in sqft"
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[{ required: true, message: "Please enter description" }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Detailed description of the property..."
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="Property Photos (Please Upload)"
                  rules={[{ required: true, message: "Please upload at least one photo" }]}
                >
                  <Upload
                    beforeUpload={handlePhotoUpload}
                    listType="picture-card"
                    showUploadList={false}
                  >
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">{photos.length} photos uploaded</Text>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Commission */}
          <Card title="Commission Details">
            <Form.Item label="Share Commission with Partner" name="shareCommission" valuePropName="checked">
              <Radio.Group>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Commission Percentage (%)"
              name="commission"
              dependencies={["shareCommission"]}
              tooltip="The commission is indicated as a percentage of the total transaction amount (unit value)"
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                disabled={!form.getFieldValue("shareCommission")}
                placeholder="Enter commission %"
              />
            </Form.Item>

            <Text type="secondary">
              <i>
                The commission is indicated as a percentage of the total transaction amount (unit value).
                If "Yes", enter the percentage. If "No", leave it as 0.
              </i>
            </Text>
          </Card>

          <Divider />

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              loading={loading}
            >
              Submit for Admin Approval
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddProperty;