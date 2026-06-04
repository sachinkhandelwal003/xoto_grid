// src/components/ecommerce/vault/EmployeeLogin.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Row,
  Col,
  Grid,
  ConfigProvider,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import {
  MonitorOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  BankOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";

import { AuthContext } from "../../../manageApi/context/AuthContext.jsx";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// --- Styled Components ---
const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  font-family: "Poppins", sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const GlassCard = styled(Card)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 24px !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  .ant-card-body {
    padding: ${(props) => (props.$isMobile ? "30px 20px" : "50px")} !important;
  }
`;

const SelectionCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  text-align: center;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.2);
    background: white;
  }
`;

const LogoWrapper = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

// --- Sirf Xoto Related Roles (5 cards) ---
const ROLES = [
  {
    id: "mortgage",
    label: "Mortgage Ops",
    description: "Applications & Bank Operations",
    Icon: MonitorOutlined,
    color: "#5C039B",
    gradient: "linear-gradient(135deg, #5C039B, #8E44AD)",
    dashPath: "/dashboard/vault-admin/mortgage/dashboard",
    apiEndpoint: "/vault/ops/login",
  },
  {
    id: "advisor",
    label: "Xoto Advisor",
    description: "Lead & Client Management",
    Icon: UserOutlined,
    color: "#03A4F4",
    gradient: "linear-gradient(135deg, #03A4F4, #0077b6)",
    dashPath: "/dashboard/vault-admin/advisor/dashboard",
    apiEndpoint: "/vault/advisor/login",
  },
  // {
  //   id: "xotopartner",
  //   label: "Xoto Partner",
  //   description: "Xoto Platform Partner",
  //   Icon: TeamOutlined,
  //   color: "#EC4899",
  //   gradient: "linear-gradient(135deg, #EC4899, #BE185D)",
  //   dashPath: "/dashboard/xoto-partner",
  //   apiEndpoint: "/xoto/partner/login",
  //   registerPath: "/xoto/partner/register",
  // },
  {
    id: "vaultagent",
    label: "Xoto Vault Agent",
    description: "Mortgage Platform - Agent",
    Icon: BankOutlined,
    color: "#5C039B",
    gradient: "linear-gradient(135deg, #5C039B, #03A4F4)",
    dashPath: "/dashboard/vaultagent",
    apiEndpoint: "/vault/agent/login",
    registerPath: "/vault/vault-register",
  },
  {
    id: "vaultpartner",
    label: "Vault Partner",
    description: "Vault Platform - Partner",
    Icon: BankOutlined,
    color: "#5C039B",
    gradient: "linear-gradient(135deg, #5C039B, #03A4F4)",
    dashPath: "/dashboard/vaultpartner",
    apiEndpoint: "/vault/partner/login",
    registerPath: "/vault/vault-register",
  },
];

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { login, isAuthenticated, user, token } = useContext(AuthContext);

  const [view, setView] = useState("select");
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form] = Form.useForm();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isAuthenticated && token && !hasRedirected.current && selectedRole) {
      hasRedirected.current = true;

      if (user) {
        localStorage.setItem("user_data", JSON.stringify(user));
      }

      toast.success(`Welcome back, ${selectedRole.label}!`);
      setTimeout(() => {
        navigate(selectedRole.dashPath, { replace: true });
      }, 1500);
    }
  }, [isAuthenticated, user, token, navigate, selectedRole]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setView("login");
    setError("");
    form.resetFields();
  };

  const handleBack = () => {
    setView("select");
    setSelectedRole(null);
    setError("");
    form.resetFields();
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError("");

    try {
      await login(selectedRole.apiEndpoint, {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
    } catch (err) {
      let errorMessage = "Invalid credentials";

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (typeof err === 'object' && err?.message && !err.message.includes("status code")) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      const errorStr = errorMessage.toLowerCase();
      const isPendingOrUnapproved = errorStr.includes("not approved") || errorStr.includes("pending") || errorStr.includes("approv");

      if (isPendingOrUnapproved) {
        toast.warning(errorMessage, { position: "top-center", autoClose: 5000 });
      } else {
        toast.error(errorMessage, { position: "top-center" });
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (selectedRole?.registerPath) {
      navigate(selectedRole.registerPath);
    } else {
      alert("Contact admin for registration");
    }
  };

  // --- Render Selection Screen ---
  const renderSelection = () => {
    return (
      <motion.div
        key="selection"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Title level={2} style={{ margin: 0, color: "#fff", fontWeight: 700 }}>
            Xoto Vault Portal
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, marginTop: 8, display: "block" }}>
            Select your role to continue
          </Text>
        </div>

        <Row gutter={[24, 24]} justify="center">
          {ROLES.map((role) => {
            const IconComponent = role.Icon;
            return (
              <Col xs={24} sm={12} md={8} lg={6} xl={4} key={role.id}>
                <SelectionCard onClick={() => handleRoleSelect(role)}>
                  <div
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: "18px",
                      background: role.gradient,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                    }}
                  >
                    <IconComponent style={{ fontSize: "32px" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
                      {role.label}
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 5 }}>
                      {role.description}
                    </div>
                  </div>
                </SelectionCard>
              </Col>
            );
          })}
        </Row>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Button 
            type="link" 
            onClick={() => navigate("/")}
            style={{ color: "#fff", fontSize: 14 }}
          >
            ← Back to Home
          </Button>
        </div>
      </motion.div>
    );
  };

  // --- Render Login Form ---
  const renderLoginForm = () => {
    const IconComponent = selectedRole?.Icon;
    const hasRegister = !!selectedRole?.registerPath;
    
    return (
      <motion.div
        key="form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: 24, paddingLeft: 0, color: "#fff" }}
        >
          Back to Role Selection
        </Button>

        <div style={{ 
          background: "rgba(255,255,255,0.95)", 
          borderRadius: 24, 
          padding: 32,
          maxWidth: 500,
          margin: "0 auto"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: selectedRole?.gradient,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              {IconComponent && <IconComponent style={{ fontSize: "28px" }} />}
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: "#333" }}>
                Sign in as {selectedRole?.label}
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Enter your credentials to access dashboard
              </Text>
            </div>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 24, borderRadius: 12 }}
              closable
              onClose={() => setError("")}
            />
          )}

          <Form form={form} layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="email"
              rules={[{ required: true, type: "email", message: "Valid email required" }]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Email Address"
                style={{ borderRadius: 12, height: 48 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Password required" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Password"
                style={{ borderRadius: 12, height: 48 }}
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <div style={{ textAlign: "right", marginTop: -8, marginBottom: 16 }}>
              <Button
                type="link"
                onClick={() => {
                  let forgotRole = "";
                  if (selectedRole?.id === "xotopartner") forgotRole = "xoto-partner";
                  else if (selectedRole?.id === "vaultpartner" || selectedRole?.id === "vaultagent") forgotRole = "vault";
                  
                  if (forgotRole) {
                    navigate(`/forgot-password?role=${forgotRole}`);
                  } else {
                    alert("Contact Xoto Admin to reset your password.");
                  }
                }}
                style={{ padding: 0, fontSize: 13, color: selectedRole?.color }}
              >
                Forgot Password?
              </Button>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 52,
                  borderRadius: 12,
                  fontWeight: "bold",
                  fontSize: "15px",
                  background: selectedRole?.gradient,
                  border: "none",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
              >
                {loading ? "Signing In..." : "Login Now"}
              </Button>

              {hasRegister && (
                <Button
                  onClick={handleRegister}
                  block
                  style={{
                    height: 52,
                    borderRadius: 12,
                    fontWeight: "bold",
                    fontSize: "15px",
                    borderColor: selectedRole?.color,
                    color: selectedRole?.color,
                  }}
                >
                  Register
                </Button>
              )}
            </div>
          </Form>
        </div>
      </motion.div>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: selectedRole?.color || "#5C039B",
          borderRadius: 8,
          fontFamily: "Poppins, sans-serif",
        },
      }}
    >
      <PageWrapper>
        <ContentLayer>
          <GlassCard bordered={false} $isMobile={isMobile}>
            <LogoWrapper>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src="/logo.png" 
                  alt="Xoto Logo"
                  style={{
                    width: isMobile ? 160 : 200,
                    marginBottom: 8,
                    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.2))",
                  }}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/200x80?text=XOTO";
                  }}
                />
              </motion.div>
            </LogoWrapper>

            <AnimatePresence mode="wait">
              {view === "select" && renderSelection()}
              {view === "login" && renderLoginForm()}
            </AnimatePresence>
          </GlassCard>
        </ContentLayer>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default EmployeeLogin;