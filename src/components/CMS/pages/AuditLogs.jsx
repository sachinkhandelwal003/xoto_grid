import { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Row, Col, Tag, Typography, Spin, Select,
  Input, Button, DatePicker, Statistic, Space, Tooltip, Alert, message,
} from 'antd';
import {
  SecurityScanOutlined, LoginOutlined, WarningOutlined,
  HomeOutlined, TeamOutlined, ReloadOutlined, SearchOutlined,
  FilterOutlined, LogoutOutlined, FilePptOutlined, DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ── Color map for actions ──────────────────────────────────────────
const ACTION_COLOR = {
  AUTH_LOGIN_SUCCESS:       'green',
  AUTH_LOGIN_FAILED:        'red',
  AUTH_LOGOUT:              'default',
  PROPERTY_CREATED:         'purple',
  PROPERTY_UPDATED:         'blue',
  PROPERTY_DELETED:         'red',
  PROPERTY_APPROVED:        'green',
  PROPERTY_REJECTED:        'volcano',
  GRID_LEAD_CREATED:        'cyan',
  GRID_LEAD_ASSIGNED:       'geekblue',
  GRID_LEAD_STATUS_CHANGED: 'orange',
  USER_LOGIN:               'green',
  USER_FAILED_LOGIN:        'red',
  LEAD_CREATED:             'cyan',
  COMMISSION_GENERATED:     'gold',
  COMMISSION_PAID:          'green',
  PPT_GENERATED:            'magenta',
};

const ACTION_LABEL = {
  AUTH_LOGIN_SUCCESS:       'Login Success',
  AUTH_LOGIN_FAILED:        'Login Failed',
  AUTH_LOGOUT:              'Logout',
  PROPERTY_CREATED:         'Property Added',
  PROPERTY_UPDATED:         'Property Updated',
  PROPERTY_DELETED:         'Property Deleted',
  PROPERTY_APPROVED:        'Property Approved',
  PROPERTY_REJECTED:        'Property Rejected',
  GRID_LEAD_CREATED:        'Lead Generated',
  GRID_LEAD_ASSIGNED:       'Lead Assigned',
  GRID_LEAD_STATUS_CHANGED: 'Lead Status Changed',
  PPT_GENERATED:            'PPT Generated',
};

const ENTITY_OPTIONS = [
  { label: 'All Types',      value: '' },
  { label: 'Auth / Login',   value: 'AUTH' },
  { label: 'Property',       value: 'PROPERTY' },
  { label: 'Grid Lead',      value: 'GRID_LEAD' },
  { label: 'Presentation',   value: 'PRESENTATION' },
  { label: 'User',           value: 'USER' },
  { label: 'Lead (Vault)',   value: 'LEAD' },
  { label: 'Case',           value: 'CASE' },
  { label: 'Commission',     value: 'COMMISSION' },
];

const THEME = { primary: '#722ed1', primaryBg: '#f9f0ff' };

// ── Stat card ──────────────────────────────────────────────────────
const StatCard = ({ icon, title, value, color, loading }) => (
  <Card
    style={{ borderRadius: 12, border: `1px solid ${color}30`, background: `${color}08` }}
    bodyStyle={{ padding: '16px 20px' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `${color}20`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 20, color,
      }}>
        {icon}
      </div>
      <Statistic
        title={<Text style={{ fontSize: 12, color: '#888' }}>{title}</Text>}
        value={loading ? '-' : value}
        valueStyle={{ fontSize: 22, fontWeight: 700, color }}
      />
    </div>
  </Card>
);

// ── Main component ─────────────────────────────────────────────────
const AuditLogs = () => {
  const [logs, setLogs]         = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [error, setError]       = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    performedByRole: '',
    search: '',
    dateFrom: null,
    dateTo: null,
  });

  const fetchLogs = useCallback(async (pg = page, sz = pageSize) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: pg, limit: sz });
      if (filters.entityType)       params.set('entityType', filters.entityType);
      if (filters.action)           params.set('action', filters.action);
      if (filters.performedByRole)  params.set('performedByRole', filters.performedByRole);
      if (filters.search)           params.set('search', filters.search);
      if (filters.dateFrom)   params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo)     params.set('dateTo', filters.dateTo);

      const res = await apiService.get(`/grid/audit?${params.toString()}`);
      if (res.success) {
        setLogs(res.data);
        setTotal(res.total || 0);
      } else {
        setError(res.message || 'Failed to load audit logs');
      }
    } catch (err) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const params = new URLSearchParams();
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo)   params.set('dateTo', filters.dateTo);
      const res = await apiService.get(`/grid/audit/stats?${params.toString()}`);
      if (res.success) setStats(res.data);
    } catch {
      // stats are non-critical
    } finally {
      setStatsLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    fetchLogs(1, pageSize);
    fetchStats();
    setPage(1);
  }, [filters]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.entityType)      params.set('entityType',      filters.entityType);
      if (filters.action)          params.set('action',          filters.action);
      if (filters.performedByRole) params.set('performedByRole', filters.performedByRole);
      if (filters.search)          params.set('search',          filters.search);
      if (filters.dateFrom)        params.set('dateFrom',        filters.dateFrom);
      if (filters.dateTo)          params.set('dateTo',          filters.dateTo);

      const base  = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('grid_token') || localStorage.getItem('token');
      const res   = await fetch(`${base}/grid/audit/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = `audit_logs_${dayjs().format('YYYY-MM-DD')}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      message.error('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    setFilters(f => ({
      ...f,
      dateFrom: dates?.[0] ? dates[0].toISOString() : null,
      dateTo:   dates?.[1] ? dates[1].toISOString() : null,
    }));
  };

  const handleReset = () => {
    setFilters({ entityType: '', action: '', performedByRole: '', search: '', dateFrom: null, dateTo: null });
  };

  // ── Metadata helpers ─────────────────────────────────────────────
  // Keys to skip — technical/internal DB fields
  const SKIP_KEYS = new Set(['roleCode', '__v', '_id', 'id', 'performedBy']);
  const isMongoId = (v) => typeof v === 'string' && /^[a-f0-9]{24}$/i.test(v);
  const isIdKey   = (k) => k === '_id' || k === 'id' || k.endsWith('Id') || k.endsWith('_id');

  // Human-readable labels
  const META_LABELS = {
    email:          'Email',
    phone:          'Phone',
    mobile:         'Phone',
    propertyName:   'Property',
    clientName:     'Client',
    title:          'Title',
    area:           'Area',
    propertySubType:'Type',
    approvalStatus: 'Approval',
    reason:         'Reason',
    roleName:       'Role',
    lead_type:      'Lead Type',
    enquiry_type:   'Enquiry',
    classification: 'Category',
    theme:          'Theme',
  };

  // Returns only human-readable [label, value] pairs from metadata
  const cleanMeta = (meta) => {
    if (!meta || typeof meta !== 'object') return [];
    return Object.entries(meta)
      .filter(([k, v]) =>
        !SKIP_KEYS.has(k) &&
        !isIdKey(k) &&
        v != null && v !== '' && v !== false &&
        typeof v !== 'object' &&
        !isMongoId(String(v))
      )
      .map(([k, v]) => [META_LABELS[k] || k, String(v)]);
  };

  // ── Table columns ─────────────────────────────────────────────────
  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (v) => (
        <Text style={{ fontSize: 12, color: '#555' }}>
          {dayjs(v).format('DD MMM YYYY')}<br />
          <span style={{ color: '#888' }}>{dayjs(v).format('hh:mm A')}</span>
        </Text>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 190,
      render: (action) => (
        <Tag color={ACTION_COLOR[action] || 'default'} style={{ fontWeight: 600, fontSize: 11 }}>
          {ACTION_LABEL[action] || action.replace(/_/g, ' ')}
        </Tag>
      ),
    },
    {
      title: 'Entity',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 110,
      render: (v) => (
        <Tag color="blue" style={{ fontSize: 11 }}>{v}</Tag>
      ),
    },
    {
      title: 'Performed By',
      dataIndex: 'performedByName',
      key: 'performedByName',
      render: (name, row) => {
        const email = row.metadata?.email || null;
        const phone = row.metadata?.phone || row.metadata?.mobile || null;
        return (
          <div>
            <Text style={{ fontWeight: 600, fontSize: 13 }}>{name || 'System'}</Text>
            {email && (
              <div>
                <Text style={{ fontSize: 11, color: '#555' }}>{email}</Text>
              </div>
            )}
            {!email && phone && (
              <div>
                <Text style={{ fontSize: 11, color: '#555' }}>{phone}</Text>
              </div>
            )}
            {row.performedByRole && (
              <div>
                <Text style={{ fontSize: 10, color: '#bbb', textTransform: 'capitalize' }}>
                  {row.performedByRole.replace(/_/g, ' ')}
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Reference',
      dataIndex: 'entityRef',
      key: 'entityRef',
      render: (v) => v ? <Text style={{ fontSize: 12, color: THEME.primary }}>{v}</Text> : <Text style={{ color: '#ccc' }}>—</Text>,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
      render: (v) => v ? <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{v}</Text> : <Text style={{ color: '#ccc' }}>—</Text>,
    },
    {
      title: 'Details',
      dataIndex: 'metadata',
      key: 'metadata',
      render: (meta) => {
        const entries = cleanMeta(meta);
        if (!entries.length) return <Text style={{ color: '#ccc' }}>—</Text>;
        const preview = entries.slice(0, 2).map(([k, v]) => `${k}: ${v.slice(0, 24)}`).join(' · ');
        return (
          <Tooltip
            title={
              <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                {entries.map(([k, v]) => (
                  <div key={k}><Text style={{ color: '#aaa', fontSize: 11 }}>{k}:</Text> {v}</div>
                ))}
              </div>
            }
          >
            <Text style={{ fontSize: 11, color: '#888', cursor: 'pointer' }}>
              {preview}{entries.length > 2 && ' …'}
            </Text>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: THEME.primary }}>
            <SecurityScanOutlined style={{ marginRight: 8 }} />
            Audit Logs
          </Title>
          <Text style={{ color: '#888' }}>
            Complete history — logins, logouts, property additions, lead generation, PPT creation and all admin activity
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => { fetchLogs(1, pageSize); fetchStats(); }}>
            Refresh
          </Button>
          <Button
            icon={<DownloadOutlined />}
            loading={exportLoading}
            onClick={handleExport}
            type="primary"
            style={{ background: THEME.primary, borderColor: THEME.primary, borderRadius: 8 }}
          >
            Export CSV
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} lg={4}>
          <StatCard icon={<SecurityScanOutlined />} title="Total Events"
            value={stats?.totalLogs?.toLocaleString() || 0} color={THEME.primary} loading={statsLoading} />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <StatCard icon={<LoginOutlined />} title="Successful Logins"
            value={stats?.recentLogins || 0} color="#52c41a" loading={statsLoading} />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <StatCard icon={<WarningOutlined />} title="Failed Login Attempts"
            value={stats?.failedLogins || 0} color="#f5222d" loading={statsLoading} />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <StatCard icon={<HomeOutlined />} title="Properties Added"
            value={stats?.byEntity?.find(e => e._id === 'PROPERTY')?.count || 0} color="#722ed1" loading={statsLoading} />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <StatCard icon={<TeamOutlined />} title="Leads Generated"
            value={stats?.byEntity?.find(e => e._id === 'GRID_LEAD')?.count || 0} color="#1890ff" loading={statsLoading} />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <StatCard icon={<SecurityScanOutlined />} title="Auth Events"
            value={stats?.byEntity?.find(e => e._id === 'AUTH')?.count || 0} color="#fa8c16" loading={statsLoading} />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <StatCard icon={<LogoutOutlined />} title="Logouts"
            value={stats?.byAction?.find(e => e._id === 'AUTH_LOGOUT')?.count || 0} color="#8c8c8c" loading={statsLoading} />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <StatCard icon={<FilePptOutlined />} title="PPTs Generated"
            value={stats?.byAction?.find(e => e._id === 'PPT_GENERATED')?.count || 0} color="#eb2f96" loading={statsLoading} />
        </Col>
      </Row>

      {/* Login by role breakdown */}
      {stats?.loginsByRole?.length > 0 && (
        <Card style={{ borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: '14px 20px' }}>
          <Text style={{ fontWeight: 600, color: '#555', fontSize: 13, marginRight: 16 }}>
            Logins by Role:
          </Text>
          {stats.loginsByRole.map(r => (
            <Tag key={r._id} color="blue" style={{ marginBottom: 4, textTransform: 'capitalize' }}>
              {(r._id || 'unknown').replace(/_/g, ' ')}: <b>{r.count}</b>
            </Tag>
          ))}
        </Card>
      )}

      {/* Filters */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: '16px 20px' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Search by name, action, ref..."
              prefix={<SearchOutlined style={{ color: '#ccc' }} />}
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              value={filters.entityType}
              onChange={v => setFilters(f => ({ ...f, entityType: v }))}
              placeholder="Entity Type"
            >
              {ENTITY_OPTIONS.map(o => (
                <Option key={o.value} value={o.value}>{o.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              value={filters.action}
              onChange={v => setFilters(f => ({ ...f, action: v }))}
              placeholder="Action"
              allowClear
            >
              <Option value="AUTH_LOGIN_SUCCESS">Login Success</Option>
              <Option value="AUTH_LOGIN_FAILED">Login Failed</Option>
              <Option value="AUTH_LOGOUT">Logout</Option>
              <Option value="PPT_GENERATED">PPT Generated</Option>
              <Option value="PROPERTY_CREATED">Property Added</Option>
              <Option value="PROPERTY_UPDATED">Property Updated</Option>
              <Option value="PROPERTY_APPROVED">Property Approved</Option>
              <Option value="PROPERTY_REJECTED">Property Rejected</Option>
              <Option value="GRID_LEAD_CREATED">Lead Generated</Option>
              <Option value="GRID_LEAD_ASSIGNED">Lead Assigned</Option>
              <Option value="GRID_LEAD_STATUS_CHANGED">Lead Status Changed</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              value={filters.performedByRole}
              onChange={v => setFilters(f => ({ ...f, performedByRole: v }))}
              placeholder="Role"
              allowClear
            >
              <Option value="admin">Admin</Option>
              <Option value="agent">Agent</Option>
              <Option value="partner">Partner (Agency)</Option>
              <Option value="developer">Developer</Option>
              <Option value="grid_advisor">Advisor</Option>
              <Option value="referral_partner">Referral Partner</Option>
              <Option value="customer">Customer</Option>
            </Select>
          </Col>
          <Col xs={24} sm={10} md={7}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              placeholder={['From Date', 'To Date']}
            />
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Space>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => fetchLogs(1, pageSize)}
                style={{ background: THEME.primary, borderColor: THEME.primary }}
              >
                Refresh
              </Button>
              <Button icon={<FilterOutlined />} onClick={handleReset}>Reset</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Error */}
      {error && (
        <Alert
          type="error"
          message={error}
          style={{ marginBottom: 16, borderRadius: 8 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      {/* Table */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontWeight: 600, color: '#333' }}>
            {total.toLocaleString()} audit records
          </Text>
          <Text style={{ fontSize: 12, color: '#888' }}>Showing newest first</Text>
        </div>
        <Spin spinning={loading}>
          <Table
            dataSource={logs}
            columns={columns}
            rowKey="_id"
            scroll={{ x: 900 }}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: ['20', '50', '100'],
              showTotal: (t) => `${t} total records`,
              onChange: (p, sz) => {
                setPage(p);
                setPageSize(sz);
                fetchLogs(p, sz);
              },
            }}
            rowClassName={(_, idx) => idx % 2 === 0 ? '' : 'audit-row-alt'}
            style={{ fontSize: 13 }}
          />
        </Spin>
      </Card>

      <style>{`
        .audit-row-alt { background: #fafafa; }
      `}</style>
    </div>
  );
};

export default AuditLogs;
