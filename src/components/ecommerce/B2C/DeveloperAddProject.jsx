import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Input, 
  Button, 
  Select, 
  Form, 
  message 
} from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function DeveloperAddProject() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Redux se logged-in developer ki details nikal li
  const { user, token } = useSelector(s => s.auth);
  const developerId = user?._id || user?.id;

  // ================= FORM SUBMIT HANDLER =================
 const onFinish = async (values) => {
  if (!developerId) {
    message.error("Developer ID not found. Please log in again.");
    return;
  }

  try {
    setLoading(true);

    const payload = {
      ...values,
      developerId: developerId
    };

    const data = await apiService.post(
      "/property/create-property",
      payload
    );

    if (data?.success || data?.status) {
      message.success("Project added successfully!");
      form.resetFields();
      navigate("/dashboard/developer/projects");
    } else {
      message.error(data?.message || "Failed to add project");
    }

  } catch (error) {
    console.error("Error creating project:", error);
    message.error("Something went wrong while saving the project.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Title level={3} style={{ margin: 0 }}>Add New Project</Title>
      <Text type="secondary">Create a new real estate project under your profile</Text>

      <Card className="shadow-sm rounded-xl mt-6">
        {/* Ant Design ka Form component use kiya for easy state & validation */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: "active" }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item 
                label="Project Name" 
                name="propertyName" // API ke keys ke hisaab se name set karein
                rules={[{ required: true, message: "Please enter the project name" }]}
              >
                <Input placeholder="Enter project name" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item 
                label="Location (City/Area)" 
                name="location" 
                rules={[{ required: true, message: "Please enter the location" }]}
              >
                <Input placeholder="Enter project location" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item 
                label="Total Units" 
                name="totalUnits" 
                rules={[{ required: true, message: "Please enter total units" }]}
              >
                <Input type="number" placeholder="Enter total units" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item 
                label="Status" 
                name="status"
              >
                <Select
                  size="large"
                  placeholder="Select status"
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Completed", value: "completed" },
                    { label: "Upcoming", value: "upcoming" }
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                label="Description" 
                name="description"
              >
                <TextArea rows={4} placeholder="Write a short description about the project..." />
              </Form.Item>
            </Col>

            <Col span={24} className="mt-4">
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  type="primary"
                  htmlType="submit" // Ise form trigger hoga
                  loading={loading}
                  size="large"
                  style={{
                    background: "#5c039b",
                    borderColor: "#5c039b",
                    color: "#fff",
                    fontWeight: 500,
                    borderRadius: 8,
                    padding: "0 24px"
                  }}
                >
                  Save Project
                </Button>

                <Button 
                  size="large" 
                  onClick={() => navigate(-1)}
                  style={{ borderRadius: 8 }}
                >
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
} 