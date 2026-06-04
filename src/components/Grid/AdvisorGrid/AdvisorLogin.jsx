import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
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
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../manageApi/context/AuthContext.jsx";
import { toast } from "react-toastify";
import styled, { keyframes } from "styled-components";

// Assets
import loginimage from "../../../assets/img/one.png";
import logoNew from "../../../assets/img/logooo.png";

import {
  ArrowLeftOutlined,
  MailOutlined,
  LockOutlined,
  SolutionOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// ─── Animations ──────────────────────────────────────────────────────────────
const floatOrb = keyframes`
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-24px) scale(1.04); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulseRing = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { transform: scale(1); box-shadow: 0 0 0 14px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  font-family: "Poppins", sans-serif;
  background: url(${(props) => props.$bgImage}) center/cover no-repeat fixed;
  overflow: hidden;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(5, 40, 30, 0.92),
    rgba(10, 80, 55, 0.85) 50%,
    rgba(3, 164, 100, 0.75)
  );
  backdrop-filter: blur(3px);
  z-index: 1;
`;

/* Floating decorative orbs */
const OrbWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
`;

const Orb = styled.div`
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
  animation: ${floatOrb} ${(p) => p.$dur || "6s"} ease-in-out infinite;
  animation-delay: ${(p) => p.$delay || "0s"};
  background: radial-gradient(circle at 30% 30%, #34d399, #059669);
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GlassCard = styled(Card)`
  width: 100%;
  border-radius: 28px !important;
  border: 1px solid rgba(52, 211, 153, 0.25) !important;
  background: rgba(255, 255, 255, 0.93) !important;
  backdrop-filter: blur(24px);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(52, 211, 153, 0.1) inset;

  .ant-card-body {
    padding: ${(props) => (props.$isMobile ? "32px 22px" : "44px")} !important;
  }
`;

const AdvisorBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 40px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #065f46;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 20px;

  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10b981;
    animation: ${pulseRing} 2s ease-out infinite;
  }
`;

const IconBox = styled.div`
  width: 68px;
  height: 68px;
  border-radius: 18px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
  flex-shrink: 0;
`;

const StyledInput = styled(Input)`
  border-radius: 14px !important;
  height: 52px !important;
  border-color: rgba(16, 185, 129, 0.25) !important;
  background: #f9fffe !important;
  font-size: 14px !important;

  &:hover,
  &:focus {
    border-color: #10b981 !important;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12) !important;
    background: #fff !important;
  }
`;

const StyledPasswordInput = styled(Input.Password)`
  border-radius: 14px !important;
  height: 52px !important;
  border-color: rgba(16, 185, 129, 0.25) !important;
  background: #f9fffe !important;

  &:hover,
  &:focus-within {
    border-color: #10b981 !important;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12) !important;
    background: #fff !important;
  }

  input {
    background: transparent !important;
    font-size: 14px !important;
  }
`;

const LoginButton = styled(Button)`
  height: 54px !important;
  border-radius: 14px !important;
  font-weight: 700 !important;
  font-size: 15px !important;
  border: none !important;
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: #fff !important;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35) !important;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.15),
      transparent
    );
    background-size: 200% 100%;
    animation: ${shimmer} 2.5s linear infinite;
  }

  &:hover {
    background: linear-gradient(135deg, #059669, #047857) !important;
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(16, 185, 129, 0.45) !important;
  }

  &:active {
    transform: translateY(0px);
  }
`;

const RegisterButton = styled(Button)`
  height: 54px !important;
  border-radius: 14px !important;
  font-weight: 700 !important;
  font-size: 15px !important;
  border: 2px solid #10b981 !important;
  color: #10b981 !important;
  background: transparent !important;
  letter-spacing: 0.02em;

  &:hover {
    background: rgba(16, 185, 129, 0.06) !important;
    border-color: #059669 !important;
    color: #059669 !important;
    transform: translateY(-1px);
  }
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(16, 185, 129, 0.2),
    transparent
  );
  margin: 24px 0;
`;

// ─── Component ────────────────────────────────────────────────────────────────
const AdvisorLogin = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { login, isAuthenticated, user, token } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const hasRedirected = useRef(false);

  // ── Redirect on auth ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && token && !hasRedirected.current) {
      hasRedirected.current = true;

      if (user) {
        localStorage.setItem("user_data", JSON.stringify(user));
      }

      toast.success("Welcome, Advisor! Redirecting to your dashboard...");
      setTimeout(() => {
        navigate("/dashboard/GridAdvisor", { replace: true });
      }, 1500);
    }
  }, [isAuthenticated, user, token, navigate]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onFinish = async (values) => {
    setLoading(true);
    setGeneralError("");

    try {
      await login("/gridadvisor/login", {
        email: values.email,
        password: values.password,
      });
    } catch (err) {
     

      let errorMessage = "Invalid credentials";

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (
        typeof err === "object" &&
        err?.message &&
        !err.message.includes("status code")
      ) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      const errorStr = errorMessage.toLowerCase();
      const isPendingOrUnapproved =
        errorStr.includes("not approved") ||
        errorStr.includes("pending") ||
        errorStr.includes("approv");

      if (isPendingOrUnapproved) {
        toast.warning(errorMessage, { position: "top-center", autoClose: 5000 });
      } else {
        toast.error(errorMessage, { position: "top-center" });
      }

      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#10b981",
          borderRadius: 14,
          fontFamily: "Poppins, sans-serif",
        },
      }}
    >
      <PageWrapper $bgImage={loginimage}>
        <GradientOverlay />

        {/* Decorative orbs */}
        <OrbWrapper>
          <Orb style={{ width: 380, height: 380, top: "-80px", left: "-100px" }} $dur="7s" $delay="0s" />
          <Orb style={{ width: 260, height: 260, bottom: "60px", right: "-60px" }} $dur="9s" $delay="2s" />
          <Orb style={{ width: 160, height: 160, top: "40%", right: "30%" }} $dur="5.5s" $delay="1s" />
        </OrbWrapper>

        <ContentLayer>
          <Row
            style={{
              width: "100%",
              maxWidth: 1200,
              padding: isMobile ? 16 : 0,
            }}
            align="middle"
          >
            {/* ── Left panel ─────────────────────────────────────────────────── */}
            <Col
              xs={24}
              lg={12}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: isMobile ? "center" : "flex-start",
                padding: 40,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: isMobile ? "center" : "left" }}
              >
                <img
                  src={logoNew}
                  alt="Logo"
                  style={{
                    width: isMobile ? 200 : 260,
                    marginBottom: 4,
                    marginLeft: isMobile ? "auto" : 0,
                    marginRight: isMobile ? "auto" : 0,
                    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))",
                  }}
                />

                <Title
                  style={{
                    color: "#fff",
                    fontSize: isMobile ? 32 : 48,
                    fontWeight: 800,
                    marginTop: 12,
                    marginBottom: 6,
                    lineHeight: 1.02,
                  }}
                >
                  Advisor{" "}
                  <span style={{ color: "#34d399" }}>Portal</span>
                </Title>

                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 18,
                    display: "block",
                    maxWidth: 400,
                  }}
                >
                  Empower your clients with expert guidance. Access your
                  advisor dashboard below.
                </Text>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  style={{
                    marginTop: 36,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    alignItems: isMobile ? "center" : "flex-start",
                  }}
                >
                  {[
                    "Secure, encrypted login",
                    "Real-time client portfolio access",
                    "Dedicated advisor analytics",
                  ].map((point, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "rgba(52, 211, 153, 0.25)",
                          border: "1.5px solid #34d399",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: "#34d399",
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </div>
                      {point}
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </Col>

            {/* ── Right panel: Login card ────────────────────────────────────── */}
            <Col
              xs={24}
              lg={12}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                style={{ width: "100%", maxWidth: 520 }}
              >
                <GlassCard bordered={false} $isMobile={isMobile}>
                  {/* Back button */}
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/")}
                    style={{
                      marginBottom: 8,
                      paddingLeft: 0,
                      color: "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    Back to Home
                  </Button>

                  {/* Header */}
                  <AdvisorBadge>Advisor Access</AdvisorBadge>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      marginBottom: 28,
                    }}
                  >
                    <IconBox>
                      <SolutionOutlined style={{ fontSize: "28px" }} />
                    </IconBox>
                    <div>
                      <Title
                        level={4}
                        style={{ margin: 0, color: "#111827", fontWeight: 700 }}
                      >
                        Welcome Back, Advisor
                      </Title>
                      <Text style={{ color: "#6b7280", fontSize: 13 }}>
                        Enter your credentials to access your dashboard
                      </Text>
                    </div>
                  </div>

                  <Divider />

                  {/* Error alert */}
                  {generalError && (
                    <Alert
                      message={generalError}
                      type={
                        generalError.toLowerCase().includes("not approved") ||
                        generalError.toLowerCase().includes("pending")
                          ? "warning"
                          : "error"
                      }
                      showIcon
                      style={{ marginBottom: 20, borderRadius: 12 }}
                      closable
                      onClose={() => setGeneralError("")}
                    />
                  )}

                  {/* Form */}
                  <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                    <Form.Item
                      name="email"
                      style={{ marginBottom: 16 }}
                      rules={[
                        {
                          required: true,
                          type: "email",
                          message: "Please enter a valid email address",
                        },
                      ]}
                    >
                      <StyledInput
                        prefix={
                          <MailOutlined style={{ color: "#10b981", marginRight: 4 }} />
                        }
                        placeholder="Email Address"
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      style={{ marginBottom: 8 }}
                      rules={[
                        { required: true, message: "Password is required" },
                      ]}
                    >
                      <StyledPasswordInput
                        prefix={
                          <LockOutlined style={{ color: "#10b981", marginRight: 4 }} />
                        }
                        placeholder="Password"
                      />
                    </Form.Item>

                    {/* Forgot password */}
                    <div
                      style={{
                        textAlign: "right",
                        marginBottom: 24,
                        marginTop: 4,
                      }}
                    >
                      <Link
                        to="/forgot-password?role=advisor"
                        style={{
                          color: "#10b981",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: 12 }}>
                      <LoginButton
                        htmlType="submit"
                        loading={loading}
                        block
                      >
                        {loading ? "Signing In..." : "Login Now"}
                      </LoginButton>

                      <RegisterButton
                        onClick={() => navigate("/advisor/registration")}
                        block
                      >
                        Register
                      </RegisterButton>
                    </div>
                  </Form>

                  {/* Footer note */}
                  <div
                    style={{
                      marginTop: 24,
                      padding: "14px 16px",
                      background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                      borderRadius: 12,
                      border: "1px solid rgba(16, 185, 129, 0.15)",
                      fontSize: 12,
                      color: "#6b7280",
                      textAlign: "center",
                      lineHeight: 1.6,
                    }}
                  >
                    By logging in, you agree to our{" "}
                    <Link
                      to="/terms"
                      style={{ color: "#10b981", fontWeight: 600 }}
                    >
                      Terms of Service
                    </Link>{" "}
                    &amp;{" "}
                    <Link
                      to="/privacy"
                      style={{ color: "#10b981", fontWeight: 600 }}
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </GlassCard>
              </motion.div>
            </Col>
          </Row>
        </ContentLayer>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default AdvisorLogin;
