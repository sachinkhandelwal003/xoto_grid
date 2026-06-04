import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice"; 
import {
  UserAddOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  EnvironmentOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const AddAgent = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email || undefined,
        phone: values.phone,
        password: values.password,
        location: values.location || undefined,
      };

      const response = await apiService.post("/agency/agents", payload);

      message.success(response?.data?.message || "Agent created successfully!");
      form.resetFields();
      navigate("/dashboard/agency/agents"); 
    } catch (error) {
      const errMsg = error?.response?.data?.message || error?.message || "Failed to create agent";
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, background: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <Button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
          ← Back
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          <UserAddOutlined style={{ color: "#4A027C", marginRight: 8 }} />
          Add New Agent
        </Title>
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: 12, maxWidth: 600, margin: "0 auto" }}
        bodyStyle={{ padding: "32px 40px" }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: "Please enter agent's full name" }]}
          >
            <Input prefix={<UserAddOutlined />} placeholder="e.g. John Doe" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="email" label="Email (optional)" rules={[{ type: "email", message: "Invalid email" }]}>
            <Input prefix={<MailOutlined />} placeholder="email@example.com" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: "Phone number is required" }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="+971501234567" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Temporary Password"
            rules={[
              { required: true, message: "Please enter a temporary password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter a secure password" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="location" label="Location (optional)">
            <Input prefix={<EnvironmentOutlined />} placeholder="e.g. Dubai, Business Bay" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<SaveOutlined />}
              style={{ height: 48, borderRadius: 10, fontWeight: 600, background: "#4A027C", borderColor: "#4A027C" }}
            >
              {loading ? "Creating..." : "Create Agent"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddAgent;