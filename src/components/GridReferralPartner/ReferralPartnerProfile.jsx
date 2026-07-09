import React, { useState, useEffect } from "react";
import {
  Card, Form, Input, Button, Upload, Select,
  Typography, Row, Col, Progress, Alert,
  Divider, Tag, message, Spin,
} from "antd";
import {
  UserOutlined, BankOutlined, IdcardOutlined,
  CheckCircleFilled, ClockCircleFilled, UploadOutlined,
} from "@ant-design/icons";
import { apiService } from "../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const UPLOAD_API = "https://xoto.ae/api/upload";
const THEME = { primary: "#7c3aed" };

export default function ReferralPartnerProfile() {
  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [idUploading,  setIdUploading]  = useState(false);
  const [idFileList,   setIdFileList]   = useState([]);

  const [basicForm] = Form.useForm();
  const [bankForm]  = Form.useForm();

  // ── Fetch profile ─────────────────────────────────────────
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res  = await apiService.get("/referral/profile");
      const data = res?.data;
      setProfile(data);

      basicForm.setFieldsValue({
        firstName:   data.firstName,
        lastName:    data.lastName,
        email:       data.email,
        phone:       data.phone,
      });

      bankForm.setFieldsValue({
        bankName:          data.bankDetails?.bankName,
        accountNumber:     data.bankDetails?.accountNumber,
        iban:              data.bankDetails?.iban,
        accountHolderName: data.bankDetails?.accountHolderName,
      });

      if (data.idDocumentUrl) {
        setIdFileList([{
          uid:    "-1",
          name:   "ID Document",
          status: "done",
          url:    data.idDocumentUrl,
        }]);
      }
    } catch {
      message.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  // ── Update basic info ─────────────────────────────────────
  const handleBasicSave = async (values) => {
    try {
      setSaving(true);
      await apiService.put("/referral/profile/basic", values);
      message.success("Profile updated");
      fetchProfile();
    } catch {
      message.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ── Upload ID document ────────────────────────────────────
  const handleIdUpload = async ({ file, onSuccess, onError }) => {
    try {
      setIdUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch(UPLOAD_API, { method: "POST", body: fd });
      const data = await res.json();
      const url  = data.url || data.file?.url || data.data?.url;

      if (!url) throw new Error("No URL returned");

      const docType = basicForm.getFieldValue("idDocumentType") || "passport";
      await apiService.put("/referral/profile/id-document", {
        idDocumentType: docType,
        idDocumentUrl:  url,
      });

      message.success("ID document uploaded");
      onSuccess({ url });
      fetchProfile();
    } catch (err) {
      message.error("Upload failed");
      onError(err);
    } finally {
      setIdUploading(false);
    }
  };

  // ── Update bank details ───────────────────────────────────
  const handleBankSave = async (values) => {
    try {
      setSaving(true);
      await apiService.put("/referral/profile/bank", values);
      message.success("Bank details saved");
      fetchProfile();
    } catch {
      message.error("Failed to save bank details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const steps = profile?.profileCompletionSteps || {};
  const pct   = profile?.completionPercentage   || 0;

  return (
    <div style={{ padding: 24, background: "#f8f7ff", minHeight: "100vh" }}>
      <Title level={3} style={{ marginBottom: 24 }}>My Profile</Title>

      {/* ── Payout locked banner ── */}
      {!profile?.isPayoutEligible && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 24, borderRadius: 10 }}
          message="Payout Locked"
          description="Complete your ID verification and bank details to unlock payouts."
        />
      )}

      {/* ── Completion progress ── */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text strong style={{ fontSize: 15 }}>Profile Completion</Text>
          <Text strong style={{ fontSize: 20, color: THEME.primary }}>{pct}%</Text>
        </div>
        <Progress
          percent={pct}
          strokeColor={THEME.primary}
          trailColor="#ede9fe"
          style={{ marginBottom: 16 }}
        />
        <Row gutter={[16, 8]}>
          {[
            { key: "basicInfo",  label: "Basic Info",    icon: <UserOutlined />    },
            { key: "idVerified", label: "ID Document",   icon: <IdcardOutlined />  },
            { key: "bankAdded",  label: "Bank Details",  icon: <BankOutlined />    },
          ].map(({ key, label, icon }) => (
            <Col xs={24} sm={8} key={key}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 8,
                background: steps[key] ? "#f0fdf4" : "#fff7ed",
                border: `1px solid ${steps[key] ? "#86efac" : "#fed7aa"}`,
              }}>
                {steps[key]
                  ? <CheckCircleFilled style={{ color: "#16a34a", fontSize: 16 }} />
                  : <ClockCircleFilled style={{ color: "#f97316", fontSize: 16 }} />
                }
                <Text style={{ fontSize: 13, fontWeight: 500 }}>{label}</Text>
                <Tag
                  color={steps[key] ? "green" : "orange"}
                  style={{ marginLeft: "auto", fontSize: 10 }}
                >
                  {steps[key] ? "Done" : "Pending"}
                </Tag>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* ── Basic Info ── */}
      <Card
        title={<span><UserOutlined style={{ marginRight: 8 }} />Basic Information</span>}
        style={{ marginBottom: 24, borderRadius: 12 }}
      >
        <Form form={basicForm} layout="vertical" onFinish={handleBasicSave}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Phone">
                <Input size="large" disabled />
              </Form.Item>
            </Col>
          </Row>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            style={{ background: THEME.primary }}
          >
            Save Basic Info
          </Button>
        </Form>
      </Card>

      {/* ── ID Document ── */}
      <Card
        title={<span><IdcardOutlined style={{ marginRight: 8 }} />ID Verification</span>}
        style={{ marginBottom: 24, borderRadius: 12 }}
        extra={
          profile?.idDocumentUrl
            ? <Tag color="green"><CheckCircleFilled /> Verified</Tag>
            : <Tag color="orange"><ClockCircleFilled /> Pending</Tag>
        }
      >
        <Form layout="vertical">
          <Form.Item label="Document Type" name="idDocumentType">
            <Select
              size="large"
              defaultValue={profile?.idDocumentType || "passport"}
              style={{ maxWidth: 300 }}
            >
              <Option value="passport">Passport</Option>
              <Option value="emirates_id">Emirates ID</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Upload Document">
            <Upload
              customRequest={handleIdUpload}
              fileList={idFileList}
              onChange={({ fileList }) => setIdFileList(fileList)}
              maxCount={1}
              accept="image/*,.pdf"
              listType="picture"
            >
              <Button
                icon={<UploadOutlined />}
                loading={idUploading}
                size="large"
              >
                Upload Passport / Emirates ID
              </Button>
            </Upload>
          </Form.Item>
          {profile?.idDocumentUrl && (
            <Alert
              type="success"
              showIcon
              message="ID document uploaded successfully"
            />
          )}
        </Form>
      </Card>

      {/* ── Bank Details ── */}
      <Card
        title={<span><BankOutlined style={{ marginRight: 8 }} />Bank Details</span>}
        style={{ borderRadius: 12 }}
        extra={
          profile?.bankDetails?.iban
            ? <Tag color="green"><CheckCircleFilled /> Added</Tag>
            : <Tag color="orange"><ClockCircleFilled /> Pending</Tag>
        }
      >
        {!profile?.isPayoutEligible && (
          <Alert
            type="info"
            showIcon
            message="Bank details are required for commission payouts"
            style={{ marginBottom: 16 }}
          />
        )}
        <Form form={bankForm} layout="vertical" onFinish={handleBankSave}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="accountHolderName"
                label="Account Holder Name"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input size="large" placeholder="As per bank records" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="bankName" label="Bank Name">
                <Input size="large" placeholder="e.g. Emirates NBD" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="accountNumber"
                label="Account Number"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input size="large" placeholder="Enter account number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="iban"
                label="IBAN"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input size="large" placeholder="AE000000000000000000000" />
              </Form.Item>
            </Col>
          </Row>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            style={{ background: THEME.primary }}
          >
            Save Bank Details
          </Button>
        </Form>
      </Card>
    </div>
  );
}