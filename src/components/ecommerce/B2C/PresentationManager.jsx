import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Tag, Space, Modal, Input, Select,
  message, Tooltip, Drawer, Divider, Typography, Row, Col,
  Progress, Statistic, Form, Checkbox, Switch
} from "antd";
import {
  PlusOutlined, ThunderboltOutlined, ShareAltOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, CopyOutlined,
  FilePdfOutlined, WhatsAppOutlined, MailOutlined,
  CheckCircleOutlined, ClockCircleOutlined, BarChartOutlined,
  GlobalOutlined, DollarOutlined, SettingOutlined,
  ExperimentOutlined
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const THEME = {
  primary:     "#5C039B",
  primaryLight:"#7c3aed",
  success:     "#10b981",
  warning:     "#d97706",
  error:       "#ef4444",
  info:        "#3b82f6",
  bg:          "#f8f9fa",
  cardBg:      "#ffffff",
  border:      "#f0f0f0",
  textPrimary: "#1f2937",
  textMuted:   "#9ca3af",
};

// ── Status tag ────────────────────────────────────────────────
const StatusTag = ({ status }) => {
  const map = {
    draft:     { color: "default", label: "Draft" },
    generated: { color: "success", label: "Generated" },
    archived:  { color: "warning", label: "Archived" },
  };
  const s = map[status] || map.draft;
  return <Tag color={s.color}>{s.label}</Tag>;
};

// ── Pipeline tag ──────────────────────────────────────────────
const PipelineTag = ({ status }) => {
  const map = {
    not_sent: { color: "default",  label: "Not Sent" },
    sent:     { color: "processing", label: "Sent" },
    viewed:   { color: "success",  label: "Viewed" },
  };
  const s = map[status] || map.not_sent;
  return <Tag color={s.color}>{s.label}</Tag>;
};

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
const Presentations = () => {
  const [presentations, setPresentations]   = useState([]);
  const [loading, setLoading]               = useState(false);
  const [filter, setFilter]                 = useState("all");

  // Create / Edit modal
  const [createOpen, setCreateOpen]         = useState(false);
  const [editing, setEditing]               = useState(null);
  const [saving, setSaving]                 = useState(false);
  const [form] = Form.useForm();

  // Other modals
  const [detailDrawer, setDetailDrawer]     = useState(null);
  const [shareModal, setShareModal]         = useState(null);
  const [generating, setGenerating]         = useState(null);
  const [archiving, setArchiving]           = useState(null);
  const [sharing, setSharing]               = useState(null);

  // ── Fetch ───────────────────────────────────────────────────
  const fetchPresentations = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await apiService.get(`/agent/presentations${params}`);
      const data = res?.data?.data || res?.data || [];
      setPresentations(Array.isArray(data) ? data : []);
    } catch {
      message.error("Failed to load presentations");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchPresentations(); }, [fetchPresentations]);

  // ── Open create modal ───────────────────────────────────────
  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      tone: "professional",
      language: "English",
      currency: "AED",
      areaUnit: "sqft",
      hide_cover: false,
      hide_desc: false,
      hide_dev: false,
      hide_prices: false,
      hide_plans: false,
      hide_loc: false,
    });
    setCreateOpen(true);
  };

  // ── Open edit modal ─────────────────────────────────────────
  const openEditModal = (record) => {
    setEditing(record);
    form.setFieldsValue({
      title:      record.title,
      tone:       record.tone || "professional",
      language:   record.settings?.language || "English",
      currency:   record.settings?.currency || "AED",
      areaUnit:   record.settings?.areaUnit || "sqft",
      hide_cover:   record.settings?.hideSections?.cover        || false,
      hide_desc:    record.settings?.hideSections?.projectDesc  || false,
      hide_dev:     record.settings?.hideSections?.developer    || false,
      hide_prices:  record.settings?.hideSections?.unitPrices   || false,
      hide_plans:   record.settings?.hideSections?.paymentPlans || false,
      hide_loc:     record.settings?.hideSections?.location     || false,
    });
    setCreateOpen(true);
  };

  // ── Save draft (create or update) ──────────────────────────
  const handleSaveDraft = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }

    const values = form.getFieldsValue();
    setSaving(true);

    const payload = {
      title: values.title,
      tone:  values.tone,
      properties: values.propertyId
        ? [{ property: values.propertyId, customNote: values.customNote || "", order: 1 }]
        : [],
      settings: {
        language: values.language,
        currency: values.currency,
        areaUnit: values.areaUnit,
        hideSections: {
          cover:       values.hide_cover  || false,
          projectDesc: values.hide_desc   || false,
          developer:   values.hide_dev    || false,
          unitPrices:  values.hide_prices || false,
          paymentPlans:values.hide_plans  || false,
          location:    values.hide_loc    || false,
        },
      },
    };

    try {
      if (editing) {
        await apiService.put(`/agent/presentations/${editing._id}`, payload);
        message.success("Draft updated successfully");
      } else {
        await apiService.post("/agent/presentations", payload);
        message.success("Draft created successfully");
      }
      setCreateOpen(false);
      setEditing(null);
      form.resetFields();
      fetchPresentations();
    } catch (err) {
      message.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Generate PDF ────────────────────────────────────────────
  const handleGenerate = async (id) => {
    setGenerating(id);
    try {
      const res = await apiService.post(`/agent/presentations/${id}/generate`);
      message.success("Presentation generated! Share link is ready.");
      fetchPresentations();
      if (detailDrawer?._id === id) {
        setDetailDrawer(res?.data?.data || res?.data || detailDrawer);
      }
    } catch (err) {
      message.error(err?.response?.data?.message || "Generation failed");
    } finally {
      setGenerating(null);
    }
  };

  // ── Share via channel ───────────────────────────────────────
  const handleShareChannel = async (id, channel) => {
    setSharing(channel);
    try {
      await apiService.post(`/agent/presentations/${id}/share`, { channel });
      message.success(`Marked as shared via ${channel}`);
      fetchPresentations();
      // refresh share modal data
      const res = await apiService.get(`/agent/presentations/${id}`);
      setShareModal(res?.data?.data || res?.data || shareModal);
    } catch (err) {
      message.error(err?.response?.data?.message || "Share failed");
    } finally {
      setSharing(null);
    }
  };

  // ── Archive ─────────────────────────────────────────────────
  const handleArchive = async (id) => {
    setArchiving(id);
    try {
      await apiService.delete(`/agent/presentations/${id}`);
      message.success("Presentation archived");
      fetchPresentations();
    } catch (err) {
      message.error(err?.response?.data?.message || "Archive failed");
    } finally {
      setArchiving(null);
    }
  };

  // ── Copy share link ─────────────────────────────────────────
  const copyShareLink = (link) => {
    navigator.clipboard.writeText(link);
    message.success("Link copied to clipboard");
  };

  // ── Stats ───────────────────────────────────────────────────
  const counts = {
    all:       presentations.length,
    draft:     presentations.filter(p => p.status === "draft").length,
    generated: presentations.filter(p => p.status === "generated").length,
    archived:  presentations.filter(p => p.status === "archived").length,
  };

  // ── Table columns ───────────────────────────────────────────
  const columns = [
    {
      title: "Presentation",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <Text strong style={{ color: THEME.textPrimary }}>{text}</Text>
          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            {record.settings?.language && (
              <Tag style={{ fontSize: 10, margin: 0 }}>{record.settings.language}</Tag>
            )}
            {record.settings?.currency && (
              <Tag style={{ fontSize: 10, margin: 0 }}>{record.settings.currency}</Tag>
            )}
            {record.tone && (
              <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>{record.tone}</Tag>
            )}
          </div>
          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
            {new Date(record.createdAt).toLocaleDateString("en-AE", {
              day: "numeric", month: "short", year: "numeric"
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 160,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <StatusTag status={record.status} />
          {record.status === "generated" && (
            <PipelineTag status={record.pipelineStatus} />
          )}
        </Space>
      ),
    },
    {
      title: "Properties",
      key: "properties",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Tag color="blue">{record.properties?.length || 0}</Tag>
      ),
    },
    {
      title: "Engagement",
      key: "engagement",
      width: 120,
      render: (_, record) => (
        record.status === "generated" ? (
          <Space direction="vertical" size={2}>
            <Text style={{ fontSize: 12 }}>
              <EyeOutlined style={{ marginRight: 4, color: THEME.primary }} />
              {record.viewCount || 0} views
            </Text>
            {record.sharedViaWhatsApp && (
              <Text style={{ fontSize: 11, color: THEME.success }}>
                <WhatsAppOutlined style={{ marginRight: 4 }} />WhatsApp
              </Text>
            )}
            {record.sharedViaEmail && (
              <Text style={{ fontSize: 11, color: THEME.info }}>
                <MailOutlined style={{ marginRight: 4 }} />Email
              </Text>
            )}
          </Space>
        ) : (
          <Text style={{ fontSize: 12, color: THEME.textMuted }}>—</Text>
        )
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space size="small" wrap>
          {/* View details */}
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetailDrawer(record)}
            />
          </Tooltip>

          {/* Edit draft */}
          {record.status === "draft" && (
            <Tooltip title="Edit Draft">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}

          {/* Generate */}
          {record.status === "draft" && (
            <Tooltip title="Generate PDF + Share Link">
              <Button
                size="small"
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={generating === record._id}
                onClick={() => handleGenerate(record._id)}
                style={{ background: THEME.primary, borderColor: THEME.primary }}
              />
            </Tooltip>
          )}

          {/* Share */}
          {record.status === "generated" && (
            <Tooltip title="Share">
              <Button
                size="small"
                type="primary"
                icon={<ShareAltOutlined />}
                onClick={() => setShareModal(record)}
                style={{ background: THEME.success, borderColor: THEME.success }}
              />
            </Tooltip>
          )}

          {/* View PDF */}
          {record.pdfUrl && (
            <Tooltip title="View PDF">
              <Button
                size="small"
                icon={<FilePdfOutlined />}
                onClick={() => window.open(record.pdfUrl, "_blank")}
              />
            </Tooltip>
          )}

          {/* Archive */}
          {record.status !== "archived" && (
            <Tooltip title="Archive">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={archiving === record._id}
                onClick={() => handleArchive(record._id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const filterBtns = [
    { key: "all",       label: `All (${counts.all})` },
    { key: "draft",     label: `Drafts (${counts.draft})` },
    { key: "generated", label: `Generated (${counts.generated})` },
    { key: "archived",  label: `Archived (${counts.archived})` },
  ];

  // ── Hide sections checkboxes ────────────────────────────────
  const hideSectionItems = [
    { name: "hide_cover",  label: "Cover Slide" },
    { name: "hide_desc",   label: "Project Description" },
    { name: "hide_dev",    label: "Developer Info" },
    { name: "hide_prices", label: "Unit Prices" },
    { name: "hide_plans",  label: "Payment Plans" },
    { name: "hide_loc",    label: "Location" },
  ];

  return (
    <div style={{ padding: 24, background: THEME.bg, minHeight: "100vh" }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: THEME.textPrimary }}>
            <ThunderboltOutlined style={{ color: THEME.primary, marginRight: 8 }} />
            AI Presentations
          </Title>
          <Text type="secondary">Create, generate and share property presentations</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
          style={{ background: THEME.primary, borderColor: THEME.primary, borderRadius: 8, fontWeight: 600 }}
        >
          New Presentation
        </Button>
      </div>

      {/* ── Stats row ──────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: "Total",     value: counts.all,       color: THEME.primary,  icon: <BarChartOutlined /> },
          { label: "Drafts",    value: counts.draft,     color: THEME.warning,  icon: <EditOutlined /> },
          { label: "Generated", value: counts.generated, color: THEME.success,  icon: <CheckCircleOutlined /> },
          { label: "Archived",  value: counts.archived,  color: THEME.textMuted,icon: <ClockCircleOutlined /> },
        ].map(s => (
          <Col xs={12} sm={6} key={s.label}>
            <Card
              bordered={false}
              style={{ borderRadius: 12, borderLeft: `4px solid ${s.color}` }}
              bodyStyle={{ padding: "16px 20px" }}
            >
              <Statistic
                title={<Text style={{ fontSize: 12, color: THEME.textMuted }}>{s.label}</Text>}
                value={s.value}
                valueStyle={{ color: s.color, fontSize: 28, fontWeight: 700 }}
                prefix={React.cloneElement(s.icon, { style: { fontSize: 18, marginRight: 4 } })}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Filter tabs ────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          {filterBtns.map(f => (
            <Button
              key={f.key}
              type={filter === f.key ? "primary" : "default"}
              onClick={() => setFilter(f.key)}
              style={{
                background:   filter === f.key ? THEME.primary : "white",
                borderColor:  filter === f.key ? THEME.primary : THEME.border,
                color:        filter === f.key ? "white" : THEME.textPrimary,
                borderRadius: 20,
                fontWeight:   filter === f.key ? 600 : 400,
              }}
            >
              {f.label}
            </Button>
          ))}
        </Space>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: 14, overflow: "hidden" }}
      >
        <Table
          columns={columns}
          dataSource={presentations}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <ThunderboltOutlined style={{ fontSize: 40, color: THEME.textMuted, marginBottom: 12 }} />
              <div style={{ color: THEME.textMuted }}>No presentations yet</div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
                style={{ marginTop: 12, background: THEME.primary, borderColor: THEME.primary }}
              >
                Create First Presentation
              </Button>
            </div>
          )}}
        />
      </Card>

      {/* ══════════════════════════════════════════════════════
          CREATE / EDIT MODAL
      ══════════════════════════════════════════════════════ */}
      <Modal
        open={createOpen}
        onCancel={() => { setCreateOpen(false); setEditing(null); form.resetFields(); }}
        title={
          <span>
            {editing ? <EditOutlined style={{ marginRight: 8, color: THEME.primary }} /> : <PlusOutlined style={{ marginRight: 8, color: THEME.primary }} />}
            {editing ? "Edit Draft" : "New Presentation"}
          </span>
        }
        okText={editing ? "Save Changes" : "Create Draft"}
        onOk={handleSaveDraft}
        confirmLoading={saving}
        okButtonProps={{ style: { background: THEME.primary, borderColor: THEME.primary } }}
        width={620}
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>

          {/* Title */}
          <Form.Item
            label="Presentation Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input
              placeholder="e.g. Luxury Villa for Ahmed Al Mansoori"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Row gutter={12}>
            {/* Tone */}
            <Col span={8}>
              <Form.Item label="Tone" name="tone">
                <Select style={{ borderRadius: 8 }}>
                  <Option value="professional">Professional</Option>
                  <Option value="friendly">Friendly</Option>
                  <Option value="luxury">Luxury</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Language */}
            <Col span={8}>
              <Form.Item label="Language" name="language">
                <Select>
                  <Option value="English">English</Option>
                  <Option value="Arabic">Arabic</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Currency */}
            <Col span={8}>
              <Form.Item label="Currency" name="currency">
                <Select>
                  <Option value="AED">AED</Option>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            {/* Area unit */}
            <Col span={8}>
              <Form.Item label="Area Unit" name="areaUnit">
                <Select>
                  <Option value="sqft">sq ft</Option>
                  <Option value="sqm">sq m</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Property ID */}
            {!editing && (
              <Col span={16}>
                <Form.Item label="Property ID (MongoDB ObjectId)" name="propertyId">
                  <Input placeholder="e.g. 69f9979815abe868e65799af" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            )}
          </Row>

          {/* Custom note */}
          {!editing && (
            <Form.Item label="Agent Note (optional)" name="customNote">
              <Input placeholder="Custom note about this property" style={{ borderRadius: 8 }} />
            </Form.Item>
          )}

          {/* Hide sections */}
          <Form.Item label={
            <span>
              <SettingOutlined style={{ marginRight: 6, color: THEME.primary }} />
              Hide Sections
            </span>
          }>
            <Row gutter={[8, 8]}>
              {hideSectionItems.map(item => (
                <Col span={8} key={item.name}>
                  <Form.Item name={item.name} valuePropName="checked" noStyle>
                    <Checkbox>{item.label}</Checkbox>
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form.Item>

        </Form>
      </Modal>

      {/* ══════════════════════════════════════════════════════
          SHARE MODAL
      ══════════════════════════════════════════════════════ */}
      <Modal
        open={!!shareModal}
        onCancel={() => setShareModal(null)}
        footer={null}
        title={
          <span>
            <ShareAltOutlined style={{ marginRight: 8, color: THEME.primary }} />
            Share Presentation
          </span>
        }
        width={480}
        centered
      >
        {shareModal && (
          <div style={{ paddingTop: 8 }}>

            {/* Share link */}
            <Text strong style={{ display: "block", marginBottom: 8 }}>Share Link</Text>
            <div style={{ display: "flex", marginBottom: 20 }}>
              <Input
                value={shareModal.shareLink || ""}
                readOnly
                style={{ borderRadius: "8px 0 0 8px", fontSize: 12, color: THEME.primary }}
              />
              <Button
                icon={<CopyOutlined />}
                onClick={() => copyShareLink(shareModal.shareLink)}
                style={{ borderRadius: "0 8px 8px 0" }}
              >
                Copy
              </Button>
            </div>

            {/* Share buttons */}
            <Row gutter={12} style={{ marginBottom: 20 }}>
              <Col span={12}>
                <Button
                  block
                  icon={<WhatsAppOutlined />}
                  loading={sharing === "whatsapp"}
                  onClick={() => handleShareChannel(shareModal._id, "whatsapp")}
                  style={{
                    background: shareModal.sharedViaWhatsApp ? "#f0fdf4" : "#fff",
                    borderColor: shareModal.sharedViaWhatsApp ? THEME.success : "#d9d9d9",
                    color: shareModal.sharedViaWhatsApp ? THEME.success : THEME.textPrimary,
                    borderRadius: 8,
                    height: 48,
                    fontWeight: 600,
                  }}
                >
                  {shareModal.sharedViaWhatsApp ? "✓ Sent" : "WhatsApp"}
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  icon={<MailOutlined />}
                  loading={sharing === "email"}
                  onClick={() => handleShareChannel(shareModal._id, "email")}
                  style={{
                    background: shareModal.sharedViaEmail ? "#eff6ff" : "#fff",
                    borderColor: shareModal.sharedViaEmail ? THEME.info : "#d9d9d9",
                    color: shareModal.sharedViaEmail ? THEME.info : THEME.textPrimary,
                    borderRadius: 8,
                    height: 48,
                    fontWeight: 600,
                  }}
                >
                  {shareModal.sharedViaEmail ? "✓ Sent" : "Email"}
                </Button>
              </Col>
            </Row>

            {/* View PDF */}
            {shareModal.pdfUrl && (
              <Button
                block
                icon={<FilePdfOutlined />}
                onClick={() => window.open(shareModal.pdfUrl, "_blank")}
                style={{ borderRadius: 8, marginBottom: 20 }}
              >
                View PDF
              </Button>
            )}

            {/* Engagement stats */}
            <Card
              bordered
              bodyStyle={{ padding: "12px 16px" }}
              style={{ borderRadius: 10, background: THEME.bg }}
            >
              <Text strong style={{ fontSize: 12, color: THEME.textMuted, display: "block", marginBottom: 12 }}>
                ENGAGEMENT TRACKING
              </Text>
              <Row gutter={16}>
                <Col span={8} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: THEME.primary }}>{shareModal.viewCount || 0}</div>
                  <div style={{ fontSize: 11, color: THEME.textMuted }}>Views</div>
                </Col>
                <Col span={8} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    <PipelineTag status={shareModal.pipelineStatus} />
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>Pipeline</div>
                </Col>
                <Col span={8} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: THEME.textPrimary }}>
                    {shareModal.lastViewedAt
                      ? new Date(shareModal.lastViewedAt).toLocaleDateString("en-AE")
                      : "Never"}
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textMuted }}>Last Viewed</div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>

      {/* ══════════════════════════════════════════════════════
          DETAIL DRAWER
      ══════════════════════════════════════════════════════ */}
      <Drawer
        open={!!detailDrawer}
        onClose={() => setDetailDrawer(null)}
        width={420}
        title={
          <span>
            <ExperimentOutlined style={{ marginRight: 8, color: THEME.primary }} />
            Presentation Details
          </span>
        }
      >
        {detailDrawer && (
          <div>
            {/* Status + pipeline */}
            <Space style={{ marginBottom: 12 }}>
              <StatusTag status={detailDrawer.status} />
              {detailDrawer.status === "generated" && (
                <PipelineTag status={detailDrawer.pipelineStatus} />
              )}
            </Space>

            <Title level={4} style={{ marginTop: 8, marginBottom: 4 }}>{detailDrawer.title}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Created {new Date(detailDrawer.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
            </Text>

            <Divider />

            {/* Settings */}
            <Title level={5} style={{ marginBottom: 12 }}>
              <SettingOutlined style={{ marginRight: 6, color: THEME.primary }} />Settings
            </Title>
            {[
              { label: "Language",  value: detailDrawer.settings?.language || "English" },
              { label: "Currency",  value: detailDrawer.settings?.currency || "AED" },
              { label: "Area Unit", value: detailDrawer.settings?.areaUnit || "sqft" },
              { label: "Tone",      value: detailDrawer.tone || "professional" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${THEME.border}` }}>
                <Text type="secondary" style={{ fontSize: 13 }}>{row.label}</Text>
                <Text strong style={{ fontSize: 13 }}>{row.value}</Text>
              </div>
            ))}

            <Divider />

            {/* Engagement */}
            {detailDrawer.status === "generated" && (
              <>
                <Title level={5} style={{ marginBottom: 12 }}>
                  <BarChartOutlined style={{ marginRight: 6, color: THEME.primary }} />Engagement
                </Title>
                {[
                  { label: "Total Views",   value: detailDrawer.viewCount || 0 },
                  { label: "Last Viewed",   value: detailDrawer.lastViewedAt ? new Date(detailDrawer.lastViewedAt).toLocaleString("en-AE") : "Never" },
                  { label: "WhatsApp",      value: detailDrawer.sharedViaWhatsApp ? "Sent ✓" : "Not sent" },
                  { label: "Email",         value: detailDrawer.sharedViaEmail ? "Sent ✓" : "Not sent" },
                  { label: "White Label",   value: detailDrawer.isWhiteLabel ? "Yes" : "No" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${THEME.border}` }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>{row.label}</Text>
                    <Text strong style={{ fontSize: 13 }}>{row.value}</Text>
                  </div>
                ))}
                <Divider />
              </>
            )}

            {/* Properties */}
            <Title level={5} style={{ marginBottom: 12 }}>
              Properties ({detailDrawer.properties?.length || 0})
            </Title>
            {detailDrawer.properties?.length > 0 ? (
              detailDrawer.properties.map((p, i) => (
                <div key={i} style={{ padding: "10px 12px", background: THEME.bg, borderRadius: 8, marginBottom: 8, border: `1px solid ${THEME.border}` }}>
                  <Text strong>{p.property?.propertyName || p.property || "Property"}</Text>
                  {p.customNote && (
                    <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
                      Note: {p.customNote}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <Text type="secondary">No properties added</Text>
            )}

            {/* Hidden sections */}
            {detailDrawer.settings?.hideSections && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: 12 }}>Hidden Sections</Title>
                <Space wrap>
                  {Object.entries(detailDrawer.settings.hideSections)
                    .filter(([, v]) => v)
                    .map(([k]) => <Tag key={k}>{k}</Tag>)
                  }
                  {!Object.values(detailDrawer.settings.hideSections).some(Boolean) && (
                    <Text type="secondary" style={{ fontSize: 12 }}>None hidden</Text>
                  )}
                </Space>
              </>
            )}

            {/* View history */}
            {detailDrawer.viewHistory?.length > 0 && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: 12 }}>
                  <EyeOutlined style={{ marginRight: 6, color: THEME.primary }} />View History
                </Title>
                {detailDrawer.viewHistory.slice(0, 5).map((v, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${THEME.border}`, fontSize: 12 }}>
                    <Text type="secondary">{new Date(v.viewedAt).toLocaleString("en-AE")}</Text>
                    <Tag>{v.deviceType}</Tag>
                  </div>
                ))}
              </>
            )}

            {/* Share link */}
            {detailDrawer.shareLink && (
              <>
                <Divider />
                <Text strong style={{ display: "block", marginBottom: 8 }}>Share Link</Text>
                <div style={{ display: "flex" }}>
                  <Input
                    value={detailDrawer.shareLink}
                    readOnly
                    style={{ borderRadius: "8px 0 0 8px", fontSize: 12, color: THEME.primary }}
                  />
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyShareLink(detailDrawer.shareLink)}
                    style={{ borderRadius: "0 8px 8px 0" }}
                  />
                </div>
              </>
            )}

            {/* PDF link */}
            {detailDrawer.pdfUrl && (
              <Button
                block
                icon={<FilePdfOutlined />}
                onClick={() => window.open(detailDrawer.pdfUrl, "_blank")}
                style={{ marginTop: 16, borderRadius: 8 }}
              >
                View PDF
              </Button>
            )}

            {/* Generate button if still draft */}
            {detailDrawer.status === "draft" && (
              <Button
                block
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={generating === detailDrawer._id}
                onClick={() => handleGenerate(detailDrawer._id)}
                style={{ marginTop: 16, background: THEME.primary, borderColor: THEME.primary, borderRadius: 8 }}
              >
                Generate Presentation
              </Button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Presentations;