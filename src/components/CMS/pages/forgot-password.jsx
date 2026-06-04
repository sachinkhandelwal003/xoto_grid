import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Form, Input, Button, Typography, Alert } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
// import axios from "axios";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import styled from "styled-components";
import loginimage from "../../../assets/img/one.png";
import logoNew from "../../../assets/img/logooo.png";

const { Text } = Typography;

const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  font-family: "Poppins", sans-serif;
  background: url(${loginimage}) center/cover no-repeat fixed;
  overflow: hidden;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(92,3,155,0.85), rgba(3,164,244,0.8));
  backdrop-filter: blur(2px);
  z-index: 1;
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const roleConfig = {
  agent: {
    label: "Agent",
    color: "#E11D48",
    gradient: "linear-gradient(135deg, #E11D48, #BE123C)",
  },
  vendor: {
    label: "Strategic Alliances",
    color: "#03A4F4",
    gradient: "linear-gradient(135deg, #03A4F4, #0077b6)",
  },
  freelancer: {
    label: "Execution Partners",
    color: "#5C039B",
    gradient: "linear-gradient(135deg, #5C039B, #8E44AD)",
  },
  developer: {
    label: "Developer",
    color: "#F97316",
    gradient: "linear-gradient(135deg, #F97316, #EA580C)",
  },
  // agency: {
  //   label: "Agency Portal",
  //   color: "#4F46E5",
  //   gradient: "linear-gradient(135deg, #4F46E5, #4338CA)",
  // },
};

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "customer";
  const config = roleConfig[role] || roleConfig.customer;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async ({ email }) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await apiService.post("/otp/forgot-password", {
  email,
  role,
});
      setIsError(false);
      setSubmitted(true);
      setMessage(res?.message || res?.data?.message || "Reset link sent successfully.");
    } catch (err) {
      setIsError(true);
      setMessage(err?.message || err?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <GradientOverlay />
      <ContentLayer>
        <div style={{ width: "100%", maxWidth: 1100, display: "flex", alignItems: "center", gap: 60 }}>

          {/* Left Side — Logo + Text */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", padding: 40 }}
          >
            <img src={logoNew} alt="Xoto Logo" style={{ width: 220, marginBottom: 8, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }} />
            <h1 style={{ color: "#fff", fontSize: 44, fontWeight: 800, margin: "8px 0 6px", lineHeight: 1.1 }}>
              Partner <span style={{ color: "#03A4F4" }}>Access</span>
            </h1>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 17 }}>
              Reset your password to get back to work.
            </Text>
          </motion.div>

          {/* Right Side — Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{ flex: 1, maxWidth: 480 }}
          >
            <div style={{
              background: "rgba(255,255,255,0.92)",
              borderRadius: 24,
              padding: "40px 36px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}>

              {/* Back Link */}
              <Link to="/login" style={{ color: "#888", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 14 }}>
                <ArrowLeftOutlined /> Back to Selection
              </Link>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 12,
                  background: config.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
                }}>
                  <MailOutlined style={{ color: "#fff", fontSize: 24 }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>Forgot Password?</div>
                  {config.label && (
                    <div style={{ fontSize: 12, color: config.color, fontWeight: 600 }}>{config.label}</div>
                  )}
                  <div style={{ fontSize: 13, color: "#888" }}>Enter your registered email address</div>
                </div>
              </div>

              {/* Success State */}
              {submitted ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
                    Reset Link Sent!
                  </div>
                  <Alert
                    type="success"
                    message={message}
                    showIcon
                    style={{ borderRadius: 12, marginBottom: 20, textAlign: "left" }}
                  />
                  <Link to="/login">
                    <Button style={{
                      borderRadius: 12, height: 44, paddingInline: 32,
                      background: config.gradient, border: "none", color: "#fff", fontWeight: 600
                    }}>
                      Back to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {isError && (
                    <Alert
                      message={message}
                      type="error"
                      showIcon
                      closable
                      style={{ marginBottom: 16, borderRadius: 12 }}
                    />
                  )}

                  <Form layout="vertical" onFinish={onFinish} size="large">
                    <Form.Item
                      name="email"
                      rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
                    >
                      <Input
                        prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                        placeholder="Email Address"
                        style={{ borderRadius: 12, height: 48 }}
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      style={{
                        height: 52,
                        borderRadius: 12,
                        fontWeight: "bold",
                        fontSize: 15,
                        background: config.gradient,
                        border: "none",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                        marginTop: 8,
                      }}
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </Form>
                </>
              )}

            </div>
          </motion.div>

        </div>
      </ContentLayer>
    </PageWrapper>
  );
};

export default ForgotPassword;