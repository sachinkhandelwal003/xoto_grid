import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  Modal, Button, Tag, Tooltip, Avatar,
  Select, Input, message
} from 'antd';
import {
  ReloadOutlined, EnvironmentOutlined,
  ClockCircleOutlined, EditOutlined, CheckCircleOutlined,
  PhoneOutlined, UserOutlined, FireOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import CustomTable from '../../CMS/pages/custom/CustomTable';

const { Option } = Select;

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = '#5c039b';

const TYPE_COLORS = {
  buy:            { bg: '#ede9fe', color: '#5b21b6', label: 'Buy' },
  sell:           { bg: '#fce7f3', color: '#9d174d', label: 'Sell' },
  rent:           { bg: '#dbeafe', color: '#1e40af', label: 'Rent' },
  consultation:   { bg: '#fef3c7', color: '#92400e', label: 'Consultation' },
  enquiry:        { bg: '#f3f4f6', color: '#374151', label: 'Enquiry' },
  schedule_visit: { bg: '#e0f2fe', color: '#075985', label: 'Site Visit' },
  partner:        { bg: '#f5f3ff', color: '#4c1d95', label: 'Partner' },
  investor:       { bg: '#fff7ed', color: '#9a3412', label: 'Investor' },
  developer:      { bg: '#f0fdf4', color: '#14532d', label: 'Developer' },
  ai_enquiry:     { bg: '#fdf4ff', color: '#701a75', label: 'AI Enquiry' },
};

const STATUS_CONFIG = {
  new: {
    color: 'blue', label: 'New',
    description: 'Lead just assigned - no contact yet',
    bg: '#dbeafe', text: '#1e40af',
  },
  submit: {
    color: 'blue', label: 'New',
    description: 'Lead just assigned - no contact yet',
    bg: '#dbeafe', text: '#1e40af',
  },
  contacted: {
    color: 'orange', label: 'Contacted',
    description: 'Advisor has initiated contact',
    bg: '#fef3c7', text: '#92400e',
  },
  in_discussion: {
    color: 'gold', label: 'In Discussion',
    description: 'Active ongoing conversation with the customer',
    bg: '#fef9c3', text: '#854d0e',
  },
  site_visit_scheduled: {
    color: 'purple', label: 'Site Visit Scheduled',
    description: 'Property viewing or meeting has been arranged',
    bg: '#f3e8ff', text: '#6b21a8',
  },
  offer_made: {
    color: 'cyan', label: 'Offer Made',
    description: 'Advisor has submitted an offer on behalf of the customer',
    bg: '#cffafe', text: '#0e7490',
  },
  reserved: {
    color: 'geekblue', label: 'Reserved',
    description: 'Unit reserved / booking form signed',
    bg: '#e0e7ff', text: '#3730a3',
  },
  spa_signed: {
    color: 'green', label: 'SPA Signed',
    description: 'Sales and Purchase Agreement signed',
    bg: '#dcfce7', text: '#166534',
  },
  completed: {
    color: 'green', label: 'Completed',
    description: 'Transaction completed; commission to be processed',
    bg: '#bbf7d0', text: '#14532d',
  },
  not_proceeding: {
    color: 'red', label: 'Not Proceeding',
    description: 'Lead has been marked as lost or unresponsive',
    bg: '#fee2e2', text: '#991b1b',
  },
};

const STATUS_FLOW = [
  'new', 'contacted', 'in_discussion', 'site_visit_scheduled',
  'offer_made', 'reserved', 'spa_signed', 'completed',
];

const STATUS_FILTER_OPTIONS = [
  ...STATUS_FLOW, 'not_proceeding',
].map(key => ({ value: key, label: STATUS_CONFIG[key].label }));

const STATUS_UPDATE_OPTIONS = [...STATUS_FLOW, 'not_proceeding'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TypeTag = ({ type }) => {
  const t = TYPE_COLORS[type] || { bg: '#f3f4f6', color: '#374151', label: type || '—' };
  return (
    <span style={{
      background: t.bg, color: t.color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {t.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || { color: 'default', label: status || '—' };
  return <Tag color={s.color} style={{ borderRadius: 20, fontSize: 11 }}>{s.label}</Tag>;
};

const normalizeStatus = s => (s === 'submit' ? 'new' : s);

const getAllowedStatusOptions = status => {
  const current = normalizeStatus(status) || 'new';
  return STATUS_UPDATE_OPTIONS.includes(current)
    ? STATUS_UPDATE_OPTIONS
    : ['new', ...STATUS_UPDATE_OPTIONS.filter(k => k !== 'new')];
};

const formatBudget = lead => {
  const min = lead?.requirements?.budget_min;
  const max = lead?.requirements?.budget_max;
  if (!min && !max) return '—';
  const fmt = n => Number(n || 0).toLocaleString('en-IN');
  if (min && max) return `AED ${fmt(min)} – AED ${fmt(max)}`;
  if (min) return `From AED ${fmt(min)}`;
  return `Up to AED ${fmt(max)}`;
};

const getLocation = lead =>
  lead?.source?.listing_id?.area ||
  lead?.requirements?.location_preferences?.[0]?.area ||
  lead?.preferred_city ||
  lead?.area ||
  '—';

// ─── Quick Status Update Modal ────────────────────────────────────────────────
// Kept inline on the list page so advisor can do quick updates without
// navigating away. "View Details" goes to the full detail page.
const UpdateStatusModal = ({ lead, visible, onClose, onUpdated }) => {
  const [status, setStatus] = useState('');
  const [notes,  setNotes]  = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && lead) {
      setStatus(normalizeStatus(lead.status) || 'new');
      setNotes('');
    }
  }, [visible, lead]);

  const handleSubmit = async () => {
    if (!status) return message.warning('Please select a status');
    setLoading(true);
    try {
      await apiService.put(`/gridlead/${lead._id}/status`, { status, notes });
      message.success('Lead status updated');
      onUpdated();
      onClose();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#f3e8ff', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <EditOutlined style={{ color: PRIMARY }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Update Lead Status</div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>
              {lead?.contact_info?.name?.first_name} {lead?.contact_info?.name?.last_name}
            </div>
          </div>
        </div>
      }
      footer={null}
      width={460}
    >
      <div style={{ padding: '8px 0' }}>
        <div style={{
          background: '#faf5ff', border: '1px solid #ede9fe',
          borderRadius: 10, padding: '10px 14px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Current:</span>
          <StatusBadge status={lead?.status} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>New Status</div>
          <Select value={status} onChange={setStatus} style={{ width: '100%' }} size="large">
            {getAllowedStatusOptions(lead?.status).map(k => {
              const v = STATUS_CONFIG[k];
              return (
                <Option key={k} value={k}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: v.text, display: 'inline-block',
                    }} />
                    <div>
                      <div style={{ lineHeight: 1.2 }}>{v.label}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.2 }}>{v.description}</div>
                    </div>
                  </div>
                </Option>
              );
            })}
          </Select>
          <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
            {STATUS_CONFIG[status]?.description}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Note <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
          </div>
          <Input.TextArea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Client confirmed site visit for Saturday..."
            style={{ borderRadius: 8, fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary" loading={loading} onClick={handleSubmit}
            style={{ background: PRIMARY, borderColor: PRIMARY, fontWeight: 600 }}
          >
            Update Status
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdvisorLeadsPage = () => {
  const navigate = useNavigate();

  const [leads,      setLeads]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters,    setFilters]    = useState({});
  const [updateLead, setUpdateLead] = useState(null);
  const [stats,      setStats]      = useState({
    total: 0, new: 0, inProgress: 0, completed: 0, notProceeding: 0,
  });

  const fetchLeads = useCallback(async (page = 1, limit = 10, extraFilters = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set('page', page);
      query.set('limit', limit);
      if (extraFilters.search) query.set('search', extraFilters.search);
      if (extraFilters.status) query.set('status', extraFilters.status);
      if (extraFilters.type)   query.set('type',   extraFilters.type);

      const res     = await apiService.get(`/gridlead/my-leads?${query.toString()}`);
      const payload = res?.data?.success !== undefined ? res.data : res;
      const leadsData = payload?.data || [];
      const pagData   = payload?.pagination || { page, limit, total: leadsData.length, totalPages: 1 };

      setLeads(leadsData);
      setPagination(pagData);
      setStats({
        total:        pagData?.total || leadsData.length,
        new:          leadsData.filter(l => ['submit', 'new'].includes(l.status)).length,
        inProgress:   leadsData.filter(l =>
          ['contacted','in_discussion','site_visit_scheduled','offer_made','reserved','spa_signed'].includes(l.status)
        ).length,
        completed:    leadsData.filter(l => l.status === 'completed').length,
        notProceeding: leadsData.filter(l => l.status === 'not_proceeding').length,
      });
    } catch {
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handlePageChange = (page, limit) => {
    fetchLeads(page, limit, filters);
    setPagination(prev => ({ ...prev, page, limit }));
  };

  const handleFilter = newFilters => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    fetchLeads(1, pagination.limit, merged);
  };

  // ── Navigate to full detail page ──────────────────────────────────────────
  // Change this path to match your router setup.
  // Common patterns:
  //   /advisor/leads/:id
  //   /dashboard/advisor/leads/:id
  //   /grid/advisor/lead/:id
  const goToDetail = id => navigate(`/dashboard/GridAdvisor/gridAdvisorLeads/${id}`);

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Client',
      key: 'full_name',
      sortable: true,
      render: (_, row) => {
        const fn = row?.contact_info?.name?.first_name || '';
        const ln = row?.contact_info?.name?.last_name  || '';
        const cc = row?.contact_info?.mobile?.country_code || '';
        const ph = row?.contact_info?.mobile?.number || '';
        return (
          // Clicking the client cell also navigates to detail
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => goToDetail(row._id)}
          >
            <Avatar size={34} style={{ background: PRIMARY, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
              {`${fn?.[0] || ''}${ln?.[0] || ''}`.toUpperCase()}
            </Avatar>
            <div>
              <div style={{
                fontWeight: 600, fontSize: 13, color: PRIMARY,
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}>
                {fn} {ln}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{cc} {ph}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Type',
      key: 'type',
      filterable: true,
      filterKey: 'type',
      filterOptions: Object.entries(TYPE_COLORS).map(([k, v]) => ({ value: k, label: v.label })),
      render: (_, row) => <TypeTag type={row?.enquiry_type} />,
    },
    {
      title: 'Status',
      key: 'status',
      filterable: true,
      filterKey: 'status',
      filterOptions: STATUS_FILTER_OPTIONS,
      render: val => <StatusBadge status={val} />,
    },
    {
      title: 'Location',
      key: 'area',
      render: (_, row) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          <EnvironmentOutlined style={{ marginRight: 4, color: PRIMARY }} />
          {getLocation(row)}
        </span>
      ),
    },
    {
      title: 'Budget',
      key: 'budget',
      render: (_, row) => (
        <span style={{ fontSize: 12, color: '#374151' }}>{formatBudget(row)}</span>
      ),
    },
    {
      title: 'Assigned At',
      key: 'assigned_at',
      sortable: true,
      render: val => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: '_id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {/* View Details — navigates to full detail page */}
          <Tooltip title="View Full Details">
            <Button
              size="small"
              icon={<ArrowRightOutlined />}
              onClick={() => goToDetail(row._id)}
              style={{
                background: PRIMARY, borderColor: PRIMARY,
                color: '#fff', fontWeight: 600,
              }}
            >
              View
            </Button>
          </Tooltip>

          {/* Quick status update — stays on list page */}
          <Tooltip title="Quick Status Update">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={e => { e.stopPropagation(); setUpdateLead(row); }}
              style={{ borderColor: '#e5e7eb', color: PRIMARY }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const statCards = [
    { label: 'Total Assigned', value: stats.total,        bg: '#faf5ff', color: PRIMARY,    icon: <UserOutlined /> },
    { label: 'New',            value: stats.new,          bg: '#dbeafe', color: '#1e40af',  icon: <FireOutlined /> },
    { label: 'In Progress',    value: stats.inProgress,   bg: '#fef3c7', color: '#92400e',  icon: <PhoneOutlined /> },
    { label: 'Completed',      value: stats.completed,    bg: '#dcfce7', color: '#166534',  icon: <CheckCircleOutlined /> },
    { label: 'Not Proceeding', value: stats.notProceeding,bg: '#fee2e2', color: '#991b1b',  icon: <ClockCircleOutlined /> },
  ];

  return (
    <div style={{ padding: '28px 32px', background: '#faf5ff', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: PRIMARY,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UserOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>My Leads</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            Leads assigned to you — click <strong>View</strong> for full details &amp; property suggestions
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchLeads(pagination.page, pagination.limit, filters)}
          style={{ borderColor: PRIMARY, color: PRIMARY }}
        >
          Refresh
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        {statCards.map((s, i) => (
          <div key={i} style={{
            background: '#fff', border: '1px solid #ede9fe',
            borderRadius: 12, padding: '16px 18px',
            boxShadow: '0 1px 4px rgba(92,3,155,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</span>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: s.bg, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <CustomTable
        columns={columns}
        data={leads}
        loading={loading}
        totalItems={pagination.total}
        currentPage={pagination.page}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        onFilter={handleFilter}
        showSearch
        onRowClick={row => goToDetail(row._id)}
      />

      {/* ── Quick status update modal ── */}
      <UpdateStatusModal
        lead={updateLead}
        visible={!!updateLead}
        onClose={() => setUpdateLead(null)}
        onUpdated={() => fetchLeads(pagination.page, pagination.limit, filters)}
      />
    </div>
  );
};

export default AdvisorLeadsPage;