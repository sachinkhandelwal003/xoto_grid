import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Tag, Table, Button, Input, Select, Space,
  Modal, Form, DatePicker, TimePicker, Typography, message, Spin, Tooltip,
  Divider,
} from 'antd';
import {
  CalendarOutlined, UserOutlined, HomeOutlined, ClockCircleOutlined,
  SearchOutlined, FilterOutlined, ReloadOutlined, CheckCircleOutlined,
  CloseCircleOutlined, UserAddOutlined, EyeOutlined, MessageOutlined,
  EnvironmentOutlined, PhoneOutlined,
} from '@ant-design/icons';
import { apiService } from '../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Theme (matches your existing) ──────────────────────────────────────────
const THEME = {
  primary: '#5C039B',
  primaryLight: '#f3e8ff',
  gold: '#f59e0b',
};

// ─── Status Configuration ────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  confirmed: { label: 'Confirmed', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  assigned:  { label: 'Assigned',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  completed: { label: 'Completed', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

const StatusTag = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Tag
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontWeight: 700,
        fontSize: 11,
        padding: '2px 12px',
        borderRadius: 20,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {cfg.label}
    </Tag>
  );
};

// ─── Assign Advisor Modal (Ant Design) ──────────────────────────────────────
const AssignAdvisorModal = ({ visible, viewing, advisors, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Pre‑fill form when viewing changes
  useEffect(() => {
    if (visible && viewing) {
      form.setFieldsValue({
        advisorId: viewing.advisor_id?._id || undefined,
        confirmedDate: viewing.confirmed_date ? viewing.confirmed_date : viewing.preferred_date,
        confirmedTime: viewing.confirmed_time || viewing.preferred_time || undefined,
        adminNote: viewing.admin_note || '',
      });
    }
  }, [visible, viewing, form]);

  const handleAssign = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        advisor_id: values.advisorId,
        confirmed_date: values.confirmedDate?.format('YYYY-MM-DD') || viewing.preferred_date,
        confirmed_time: values.confirmedTime?.format('HH:mm') || viewing.preferred_time,
        admin_note: values.adminNote || '',
      };
      const res = await apiService.post(`/viewing-requests/${viewing._id}/assign`, payload);
      if (res?.data?.success) {
        message.success('Advisor assigned successfully!');
        onSuccess();
        onClose();
      } else {
        message.error(res?.data?.message || 'Assignment failed');
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <UserAddOutlined style={{ color: THEME.primary }} />
          <span>Assign Xoto Advisor</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleAssign}
          style={{ background: THEME.primary, borderColor: THEME.primary }}
        >
          {loading ? 'Assigning…' : 'Assign & Confirm'}
        </Button>,
      ]}
      width={560}
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="advisorId"
          label="Select Advisor"
          rules={[{ required: true, message: 'Please select an advisor' }]}
        >
          <Select placeholder="Choose an advisor" style={{ width: '100%' }}>
            {advisors.map((a) => (
              <Option key={a._id} value={a._id}>
                {a.name || `${a.first_name} ${a.last_name}`}
                {a.specialization && ` — ${a.specialization}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="confirmedDate" label="Confirmed Date">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="confirmedTime" label="Confirmed Time">
              <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={15} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="adminNote" label="Admin Note (optional)">
          <Input.TextArea rows={2} placeholder="Instructions for the advisor…" />
        </Form.Item>

        {viewing?.lead_id && (
          <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>Client:</strong> {viewing.lead_id.contact_info?.name?.first_name}{' '}
              {viewing.lead_id.contact_info?.name?.last_name}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>Property:</strong> {viewing.property_id?.propertyName || '—'}
            </Text>
          </div>
        )}
      </Form>
    </Modal>
  );
};

// ─── Main Admin Page ─────────────────────────────────────────────────────────
const AdminViewingRequests = () => {
  const [viewings, setViewings] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedViewing, setSelectedViewing] = useState(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, assigned: 0, completed: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, aRes] = await Promise.all([
        apiService.get('/viewing-requests/admin/all'),
        apiService.get('/viewing-requests/admin/advisors'),
      ]);
      const vData = vRes?.data?.data || vRes?.data || [];
      const aData = aRes?.data?.data || aRes?.data || [];
      setViewings(vData);
      setAdvisors(aData);

      // Compute stats
      const s = { pending: 0, confirmed: 0, assigned: 0, completed: 0, cancelled: 0 };
      vData.forEach((v) => {
        if (s[v.status] !== undefined) s[v.status] += 1;
      });
      setStats(s);
    } catch (error) {
      message.error('Failed to load viewing requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (viewingId, newStatus) => {
    try {
      const res = await apiService.patch(`/viewing-requests/${viewingId}/status`, { status: newStatus });
      if (res?.data?.success) {
        message.success(`Status updated to ${newStatus}`);
        fetchData();
      } else {
        message.error(res?.data?.message || 'Update failed');
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Update failed');
    }
  };

  const handleAssignClick = (viewing) => {
    setSelectedViewing(viewing);
    setAssignModalVisible(true);
  };

  const handleAssignSuccess = () => {
    fetchData();
    setAssignModalVisible(false);
    setSelectedViewing(null);
  };

  // ── Filtered data ──
  const filtered = viewings.filter((v) => {
    const lead = v.lead_id || {};
    const prop = v.property_id || {};
    const name =
      `${lead.contact_info?.name?.first_name || ''} ${lead.contact_info?.name?.last_name || ''}`.trim().toLowerCase();
    const propName = (prop.propertyName || '').toLowerCase();
    const searchLower = search.toLowerCase();
    const matchSearch = !search || name.includes(searchLower) || propName.includes(searchLower);
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Table columns ──
  const columns = [
    {
      title: 'Client',
      dataIndex: ['lead_id', 'contact_info', 'name'],
      key: 'client',
      render: (name, record) => {
        const fullName = name ? `${name.first_name} ${name.last_name}` : 'Unknown';
        const phone = record.lead_id?.contact_info?.mobile;
        const phoneStr = phone ? `${phone.country_code || ''} ${phone.number || ''}`.trim() : '—';
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{fullName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <PhoneOutlined /> {phoneStr || 'No phone'}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Property',
      dataIndex: ['property_id'],
      key: 'property',
      render: (prop) => (
        <Space direction="vertical" size={0}>
          <Text strong>{prop?.propertyName || '—'}</Text>
          {prop?.area && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <EnvironmentOutlined /> {prop.area}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Requested',
      key: 'requested',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>
            {record.preferred_date
              ? new Date(record.preferred_date).toLocaleDateString('en-AE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '—'}
          </Text>
          {record.preferred_time && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <ClockCircleOutlined /> {record.preferred_time}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Agent',
      dataIndex: ['agent_id'],
      key: 'agent',
      render: (agent) => <Text>{agent?.name || agent?.first_name || '—'}</Text>,
    },
    {
      title: 'Advisor',
      dataIndex: ['advisor_id'],
      key: 'advisor',
      render: (advisor) => <Text>{advisor?.name || advisor?.first_name || <span style={{ color: '#aaa' }}>Unassigned</span>}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const actions = [];
        // Confirm (admin initiates) for pending
        if (record.status === 'pending') {
          actions.push(
            <Tooltip title="Confirm request" key="confirm">
              <Button
                type="text"
                icon={<CheckCircleOutlined style={{ color: '#16a34a' }} />}
                onClick={() => handleStatusUpdate(record._id, 'confirmed')}
              />
            </Tooltip>
          );
        }
        // Assign advisor
        if (record.status === 'pending' || record.status === 'confirmed') {
          actions.push(
            <Tooltip title="Assign advisor" key="assign">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => handleAssignClick(record)}
                size="small"
                style={{ background: THEME.primary, borderColor: THEME.primary }}
              />
            </Tooltip>
          );
        }
        // Mark complete
        if (record.status === 'assigned') {
          actions.push(
            <Tooltip title="Mark complete" key="complete">
              <Button
                type="text"
                icon={<CheckCircleOutlined style={{ color: '#7c3aed' }} />}
                onClick={() => handleStatusUpdate(record._id, 'completed')}
              />
            </Tooltip>
          );
        }
        // Cancel
        if (record.status === 'pending' || record.status === 'confirmed') {
          actions.push(
            <Tooltip title="Cancel" key="cancel">
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleStatusUpdate(record._id, 'cancelled')}
              />
            </Tooltip>
          );
        }
        return <Space size="small">{actions}</Space>;
      },
    },
  ];

  // ── Expanded row to show additional info ──
 const expandedRowRender = (record) => {
  const lead = record.lead_id || {};
  const prop = record.property_id || {};
  const agent = record.agent_id || {};
  const advisor = record.advisor_id || {};

  // Helper to format phone
  const formatPhone = (mobile) => {
    if (!mobile) return '—';
    return `${mobile.country_code || ''} ${mobile.number || ''}`.trim() || '—';
  };

  return (
    <div style={{ margin: 0, padding: '16px 24px', background: '#fafafa', borderRadius: 8 }}>
      <Row gutter={[24, 16]}>
        {/* Property Details */}
        <Col xs={24} sm={12} md={6}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', fontWeight: 600 }}>
            <HomeOutlined style={{ marginRight: 4 }} /> Property
          </Text>
          <Text strong style={{ display: 'block' }}>{prop.propertyName || '—'}</Text>
          {prop.area && <Text type="secondary" style={{ fontSize: 12 }}>{prop.area}</Text>}
          {prop.address && <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{prop.address}</Text>}
        </Col>

        {/* Agent Details */}
        <Col xs={24} sm={12} md={6}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', fontWeight: 600 }}>
            <UserOutlined style={{ marginRight: 4 }} /> Agent
          </Text>
          <Text strong style={{ display: 'block' }}>
            {agent.name || agent.first_name || '—'}
          </Text>
          {agent.email && <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{agent.email}</Text>}
          {agent.phone && <Text type="secondary" style={{ fontSize: 12 }}>{agent.phone}</Text>}
          {!agent.email && !agent.phone && agent.mobile && (
            <Text type="secondary" style={{ fontSize: 12 }}>{formatPhone(agent.mobile)}</Text>
          )}
        </Col>

        {/* Advisor Details */}
        <Col xs={24} sm={12} md={6}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', fontWeight: 600 }}>
            <UserAddOutlined style={{ marginRight: 4 }} /> Assigned Advisor
          </Text>
          <Text strong style={{ display: 'block' }}>
            {advisor.name || advisor.first_name || 'Unassigned'}
          </Text>
          {advisor.email && <Text type="secondary" style={{ fontSize: 12 }}>{advisor.email}</Text>}
        </Col>

        {/* Notes */}
        <Col xs={24} sm={12} md={6}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', fontWeight: 600 }}>
            <MessageOutlined style={{ marginRight: 4 }} /> Notes
          </Text>
          <Text>{record.notes || '—'}</Text>
        </Col>
      </Row>

      {/* Confirmed details (if any) */}
      {(record.confirmed_date || record.admin_note) && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
          <Row gutter={24}>
            {record.confirmed_date && (
              <Col>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <CheckCircleOutlined style={{ color: '#16a34a', marginRight: 4 }} />
                  <strong>Confirmed:</strong> {new Date(record.confirmed_date).toLocaleDateString('en-AE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {record.confirmed_time && ` at ${record.confirmed_time}`}
                </Text>
              </Col>
            )}
            {record.admin_note && (
              <Col>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>Admin note:</strong> {record.admin_note}
                </Text>
              </Col>
            )}
          </Row>
        </div>
      )}
    </div>
  );
};

  return (
    <div style={{ padding: '20px 24px', background: '#f6f8fb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 900, color: '#0f172a' }}>
          <CalendarOutlined style={{ marginRight: 12, color: THEME.primary }} />
          Viewing Requests
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Manage and assign property viewings to Xoto advisors
        </Text>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchData}
          style={{ float: 'right', marginTop: -8 }}
        >
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { key: 'pending', label: 'Pending Review', value: stats.pending, color: '#d97706' },
          { key: 'confirmed', label: 'Confirmed', value: stats.confirmed, color: '#2563eb' },
          { key: 'assigned', label: 'Assigned', value: stats.assigned, color: '#16a34a' },
          { key: 'completed', label: 'Completed', value: stats.completed, color: '#7c3aed' },
        ].map((s) => (
          <Col xs={12} sm={6} key={s.key}>
            <Card
              bordered={false}
              style={{ borderRadius: 12, cursor: 'pointer' }}
              bodyStyle={{ padding: '16px 20px' }}
              onClick={() => setStatusFilter(statusFilter === s.key ? 'all' : s.key)}
              className={statusFilter === s.key ? 'stat-active' : ''}
            >
              <Statistic
                value={s.value}
                valueStyle={{ color: s.color, fontSize: 28, fontWeight: 800 }}
              />
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{s.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card bordered={false} style={{ borderRadius: 12, marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Search by client or property…"
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 160 }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Statuses</Option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <Option key={key} value={key}>
                  {cfg.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Spin spinning={loading}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="_id"
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => !!(record.notes || record.confirmed_date || record.admin_note),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} requests`,
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px 0' }}>
                <CalendarOutlined style={{ fontSize: 40, color: '#d1d5db' }} />
                <p style={{ color: '#9ca3af', marginTop: 12 }}>No viewing requests found</p>
              </div>
            ),
          }}
        />
      </Spin>

      {/* Assign Modal */}
      <AssignAdvisorModal
        visible={assignModalVisible}
        viewing={selectedViewing}
        advisors={advisors}
        onClose={() => {
          setAssignModalVisible(false);
          setSelectedViewing(null);
        }}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
};

export default AdminViewingRequests;