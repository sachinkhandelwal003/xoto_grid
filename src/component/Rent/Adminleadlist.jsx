import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Tag, Tooltip, Modal, Drawer, message, Select,
  Form, Input, notification, Divider, Badge,
} from 'antd';
import {
  UserAddOutlined, DeleteOutlined, EyeOutlined,
  HomeOutlined, UserOutlined, PhoneOutlined, MailOutlined,
  MessageOutlined, CalendarOutlined, TeamOutlined,
  EditOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import CustomTable from '../../components/CMS/pages/custom/CustomTable';

const { Option } = Select;

const THEME = { primary: '#7c3aed' };

const STATUS_COLORS = {
  new: 'blue', assigned: 'purple', contacted: 'orange',
  closed: 'green', lost: 'red', submit: 'geekblue',
};
const STATUS_LABELS = {
  new: 'New', assigned: 'Assigned', contacted: 'Contacted',
  closed: 'Closed', lost: 'Lost', submit: 'Submitted',
};

const getAgentName = (agent) => {
  if (!agent) return 'Agent';
  if (agent.full_name?.trim()) return agent.full_name.trim();
  if (agent.name) {
    if (typeof agent.name === 'string' && agent.name.trim()) return agent.name.trim();
    if (typeof agent.name === 'object') {
      const parts = [agent.name.first_name, agent.name.last_name].filter(Boolean);
      if (parts.length) return parts.join(' ');
    }
  }
  if (agent.fullName?.trim()) return agent.fullName.trim();
  const nameParts = [agent.firstName, agent.lastName].filter(Boolean);
  if (nameParts.length) return nameParts.join(' ');
  if (agent.username) return agent.username;
  if (agent.email) return agent.email.split('@')[0];
  return 'Agent';
};

const normalizeLead = (lead) => ({
  ...lead,
  customerName:
    lead.full_name ||
    `${lead.name?.first_name || ''} ${lead.name?.last_name || ''}`.trim() ||
    '—',
  customerEmail: lead.email || '',
  customerPhone: lead.mobile
    ? `${lead.mobile.country_code || ''} ${lead.mobile.number || ''}`.trim()
    : '',
  propertyTitle: lead.property?.title || '',
  propertyArea: lead.property?.location?.area || '',
  propertyEmirate: lead.property?.emirate || '',
  propertyPrice: lead.property?.price || 0,
  assignedAgentName: lead.assignedAgentName || null,
  assignedAgent: lead.assignedAgent || null,
  notes: Array.isArray(lead.notes)
    ? lead.notes.map((n) => (typeof n === 'string' ? n : n.text || '')).join('\n')
    : lead.notes || '',
});

// ── Reusable avatar (only for agents now) ──
const Avatar = ({ name, size = 32, bg = THEME.primary }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: bg,
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
  }}>
    {(name || '?').charAt(0).toUpperCase()}
  </div>
);

// ── Detail row in view modal ──
const DetailRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8, background: '#f5f3ff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: THEME.primary, fontSize: 14, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: '#111827', fontWeight: 500, marginTop: 2 }}>
        {value || <span style={{ color: '#d1d5db' }}>—</span>}
      </div>
    </div>
  </div>
);

// ── Stat card ──
const StatCard = ({ label, count, color, bg }) => (
  <div style={{
    background: bg, border: `1px solid ${color}33`,
    borderRadius: 14, padding: '14px 18px',
    display: 'flex', flexDirection: 'column', gap: 4,
  }}>
    <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{count}</div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{label}</div>
  </div>
);

/* ═══════════════════════════════ MAIN ═══════════════════════════════ */

const AdminLeadList = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeFilters, setActiveFilters] = useState({});

  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);

  const [assignModal, setAssignModal] = useState({ open: false, lead: null });
  const [assignForm] = Form.useForm();
  const [assignLoading, setAssignLoading] = useState(false);

  const [statusModal, setStatusModal] = useState({ open: false, lead: null });
  const [statusForm] = Form.useForm();
  const [statusLoading, setStatusLoading] = useState(false);

  const [viewModal, setViewModal] = useState({ open: false, lead: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, lead: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── FETCH LEADS ──
  const fetchLeads = useCallback(
    async (page = currentPage, limit = itemsPerPage, filters = activeFilters) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page, limit, type: 'rent',
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.assignedAgent ? { assignedAgent: filters.assignedAgent } : {}),
        });
        const res = await apiService.get(`/property/lead?${params.toString()}`);
        const body = res?.data ?? res ?? {};
        const list = body?.data ?? (Array.isArray(body) ? body : []);
        const total = body?.pagination?.total ?? body?.total ?? list.length;
        setData(list.map(normalizeLead));
        setTotalItems(total);
      } catch {
        message.error('Failed to load leads.');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage, activeFilters]
  );

  // ── FETCH AGENTS ──
  const fetchAgents = async () => {
    try {
      setAgentsLoading(true);
      const res = await apiService.get('/agent/get-all-agents?page=1&limit=100');
      const body = res?.data ?? res ?? {};
      const list = body?.data ?? (Array.isArray(body) ? body : []);
      setAgents(list);
    } catch (err) {
      
    } finally {
      setAgentsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1, itemsPerPage, {});
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setItemsPerPage(size);
    fetchLeads(page, size, activeFilters);
  };

  const handleFilter = (filters) => {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    setActiveFilters(cleaned);
    setCurrentPage(1);
    fetchLeads(1, itemsPerPage, cleaned);
  };

  // ── ASSIGN ──
  const handleAssignSubmit = async () => {
    try {
      const values = await assignForm.validateFields();
      setAssignLoading(true);
      const selectedAgent = agents.find((a) => (a._id || a.id) === values.agentId);
      await apiService.put(`/property/lead/${assignModal.lead._id}/assign`, {
        agentId: values.agentId,
        agentName: getAgentName(selectedAgent),
      });
      notification.success({
        message: 'Agent Assigned',
        description: `Lead assigned to ${getAgentName(selectedAgent)} successfully.`,
        placement: 'topRight',
      });
      setAssignModal({ open: false, lead: null });
      assignForm.resetFields();
      fetchLeads(currentPage, itemsPerPage, activeFilters);
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || 'Failed to assign agent.');
    } finally {
      setAssignLoading(false);
    }
  };

  // ── STATUS ──
  const handleStatusSubmit = async () => {
    try {
      const values = await statusForm.validateFields();
      setStatusLoading(true);
      await apiService.put(`/property/lead/${statusModal.lead._id}/status`, {
        status: values.status,
        notes: values.notes || '',
      });
      notification.success({
        message: 'Status Updated',
        description: `Status changed to "${STATUS_LABELS[values.status]}".`,
        placement: 'topRight',
      });
      setStatusModal({ open: false, lead: null });
      statusForm.resetFields();
      fetchLeads(currentPage, itemsPerPage, activeFilters);
    } catch (err) {
      if (err?.errorFields) return;
      message.error('Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async () => {
    if (!deleteModal.lead) return;
    try {
      setDeleteLoading(true);
      await apiService.delete(`/property/lead/${deleteModal.lead._id}`);
      message.success('Lead deleted successfully.');
      setDeleteModal({ open: false, lead: null });
      fetchLeads(currentPage, itemsPerPage, activeFilters);
    } catch {
      message.error('Failed to delete lead.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── COLUMNS ──
  const columns = [
    {
      key: 'propertyTitle',
      title: 'Property',
      sortable: true,
      render: (val, record) => (
        <div style={{ minWidth: 160 }}>
          <div style={{
            fontWeight: 700, fontSize: 13, color: '#111827',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200,
          }}>
            {val || <span style={{ color: '#d1d5db', fontWeight: 400 }}>No property</span>}
          </div>
          {(record.propertyArea || record.propertyEmirate) && (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <HomeOutlined style={{ fontSize: 10 }} />
              {[record.propertyArea, record.propertyEmirate].filter(Boolean).join(', ')}
            </div>
          )}
          {record.propertyPrice > 0 && (
            <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, marginTop: 3 }}>
              AED {Number(record.propertyPrice).toLocaleString()} / yr
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'customerName',
      title: 'Customer',
      sortable: true,
      render: (val, record) => (
        // ── No avatar — just name + contact info ──
        <div style={{ minWidth: 180 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{val || '—'}</div>
          {record.customerEmail && (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MailOutlined style={{ fontSize: 10 }} />{record.customerEmail}
            </div>
          )}
          {record.customerPhone && (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              <PhoneOutlined style={{ fontSize: 10 }} />{record.customerPhone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterKey: 'status',
      filterOptions: [
        { label: 'Submitted', value: 'submit' },
        { label: 'New', value: 'new' },
        { label: 'Assigned', value: 'assigned' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Closed', value: 'closed' },
        { label: 'Lost', value: 'lost' },
      ],
      render: (val) => (
        <Tag
          color={STATUS_COLORS[val] || 'default'}
          style={{ fontWeight: 600, borderRadius: 6, padding: '2px 10px' }}
        >
          {STATUS_LABELS[val] || val}
        </Tag>
      ),
    },
    {
      key: 'assignedAgentName',
      title: 'Agent',
      sortable: false,
      filterable: true,
      filterKey: 'assignedAgent',
      filterOptions: [
        { label: 'Unassigned', value: 'unassigned' },
        ...agents.map((a) => ({ label: getAgentName(a), value: a._id || a.id })),
      ],
      render: (val) =>
        val ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar name={val} size={28} bg='#6d28d9' />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{val}</span>
          </div>
        ) : (
          <Tag color="warning" style={{ fontSize: 11, borderRadius: 6 }}>Unassigned</Tag>
        ),
    },
    {
      key: 'createdAt',
      title: 'Received',
      sortable: true,
      render: (val) =>
        val ? (
          <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 }}>
            <CalendarOutlined style={{ fontSize: 11 }} />
            {new Date(val).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </div>
        ) : '—',
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} size="small"
              style={{ color: '#0284c7' }}
              onClick={() => setViewModal({ open: true, lead: record })} />
          </Tooltip>
          <Tooltip title="Assign Agent">
            <Button type="text" icon={<UserAddOutlined />} size="small"
              style={{ color: THEME.primary }}
              onClick={() => {
                setAssignModal({ open: true, lead: record });
                if (record.assignedAgent) assignForm.setFieldsValue({ agentId: record.assignedAgent });
              }} />
          </Tooltip>
          <Tooltip title="Update Status">
            <Button type="text" icon={<EditOutlined />} size="small"
              style={{ color: '#d97706' }}
              onClick={() => {
                setStatusModal({ open: true, lead: record });
                statusForm.setFieldsValue({ status: record.status, notes: record.notes || '' });
              }} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" icon={<DeleteOutlined />} size="small" danger
              onClick={() => setDeleteModal({ open: true, lead: record })} />
          </Tooltip>
        </div>
      ),
    },
  ];

  const statusCounts = data.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  const STATS = [
    { label: 'Total Leads', count: totalItems, color: '#374151', bg: '#f9fafb' },
    { label: 'Submitted', count: statusCounts.submit || 0, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Assigned', count: statusCounts.assigned || 0, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Contacted', count: statusCounts.contacted || 0, color: '#d97706', bg: '#fffbeb' },
    { label: 'Closed', count: statusCounts.closed || 0, color: '#059669', bg: '#ecfdf5' },
  ];

  /* ── Shared modal header style ── */
  const ModalHeader = ({ icon, title, color = THEME.primary }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      paddingBottom: 14, marginBottom: 20,
      borderBottom: `2px solid ${color}`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: color + '15',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, fontSize: 16,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{title}</span>
    </div>
  );

  /* ── Lead preview pill (used in assign & status modals) ── */
  const LeadPreview = ({ lead, accentColor = '#7c3aed', accentBg = '#faf5ff', accentBorder = '#e9d5ff' }) => (
    <div style={{
      background: accentBg, border: `1px solid ${accentBorder}`,
      borderRadius: 10, padding: '10px 14px', marginBottom: 20,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: accentColor, marginBottom: 4 }}>
        {lead.propertyTitle || <span style={{ color: '#9ca3af', fontWeight: 400 }}>No Property Linked</span>}
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <UserOutlined style={{ fontSize: 11 }} />
          <strong style={{ color: '#374151' }}>{lead.customerName}</strong>
        </span>
        {lead.customerPhone && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <PhoneOutlined style={{ fontSize: 11 }} />
            {lead.customerPhone}
          </span>
        )}
        {lead.customerEmail && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MailOutlined style={{ fontSize: 11 }} />
            {lead.customerEmail}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px 28px', background: '#f8f9fb', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
            Rental Leads
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <TeamOutlined /> Customer inquiries from rental listings
          </p>
        </div>
        <div style={{
          background: THEME.primary + '12', border: `1px solid ${THEME.primary}33`,
          borderRadius: 10, padding: '6px 16px', fontSize: 13,
          color: THEME.primary, fontWeight: 700,
        }}>
          {totalItems} total
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 22 }}>
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── TABLE ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <CustomTable
          columns={columns}
          data={data}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onFilter={handleFilter}
          showSearch={true}
        />
      </div>

      {/* ══════════════════════════════════════════
          ASSIGN AGENT MODAL
      ══════════════════════════════════════════ */}
      <Modal
        open={assignModal.open}
        title={null}
        footer={null}
        centered
        width={460}
        destroyOnClose
        onCancel={() => { setAssignModal({ open: false, lead: null }); assignForm.resetFields(); }}
      >
        {assignModal.lead && (
          <div style={{ padding: '4px 0' }}>
            <ModalHeader icon={<UserAddOutlined />} title="Assign Agent" />

            <LeadPreview lead={assignModal.lead} />

            <Form
              form={assignForm}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="agentId"
                label={
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    Select Agent
                  </span>
                }
                rules={[{ required: true, message: 'Please select an agent' }]}
                style={{ marginBottom: 24 }}
              >
                <Select
                  size="large"
                  showSearch
                  loading={agentsLoading}
                  placeholder={agentsLoading ? 'Loading agents...' : 'Search agent by name...'}
                  optionFilterProp="label"
                  style={{ width: '100%', borderRadius: 8 }}
                  notFoundContent={agentsLoading ? 'Loading...' : 'No agents found'}
                >
                  {agents.map((agent) => {
                    const name = getAgentName(agent);
                    return (
                      <Option key={agent._id || agent.id} value={agent._id || agent.id} label={name}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                          <Avatar name={name} size={30} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{name}</div>
                            {agent.email && (
                              <div style={{ fontSize: 11, color: '#9ca3af' }}>{agent.email}</div>
                            )}
                          </div>
                        </div>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Form>

            <Divider style={{ margin: '0 0 16px' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button
                size="middle"
                onClick={() => { setAssignModal({ open: false, lead: null }); assignForm.resetFields(); }}
                disabled={assignLoading}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="middle"
                loading={assignLoading}
                icon={<UserAddOutlined />}
                onClick={handleAssignSubmit}
                style={{ background: THEME.primary, borderColor: THEME.primary, minWidth: 130 }}
              >
                Assign Agent
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ══════════════════════════════════════════
          UPDATE STATUS MODAL
      ══════════════════════════════════════════ */}
      <Modal
        open={statusModal.open}
        title={null}
        footer={null}
        centered
        width={440}
        destroyOnClose
        onCancel={() => { setStatusModal({ open: false, lead: null }); statusForm.resetFields(); }}
      >
        {statusModal.lead && (
          <div style={{ padding: '4px 0' }}>
            <ModalHeader icon={<EditOutlined />} title="Update Lead Status" color="#d97706" />

            <LeadPreview
              lead={statusModal.lead}
              accentColor='#92400e'
              accentBg='#fffbeb'
              accentBorder='#fde68a'
            />

            <Form
              form={statusForm}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="status"
                label={
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    New Status
                  </span>
                }
                rules={[{ required: true, message: 'Please select a status' }]}
                style={{ marginBottom: 16 }}
              >
                <Select size="large" style={{ width: '100%' }}>
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <Option key={val} value={val}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag
                          color={STATUS_COLORS[val]}
                          style={{ borderRadius: 5, fontWeight: 600, margin: 0 }}
                        >
                          {label}
                        </Tag>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="notes"
                label={
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    Notes <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: 12 }}>(optional)</span>
                  </span>
                }
                style={{ marginBottom: 24 }}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Add internal notes about this status change..."
                  style={{ borderRadius: 8, resize: 'none' }}
                />
              </Form.Item>
            </Form>

            <Divider style={{ margin: '0 0 16px' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button
                size="middle"
                onClick={() => { setStatusModal({ open: false, lead: null }); statusForm.resetFields(); }}
                disabled={statusLoading}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="middle"
                loading={statusLoading}
                icon={<EditOutlined />}
                onClick={handleStatusSubmit}
                style={{ background: '#d97706', borderColor: '#d97706', minWidth: 130 }}
              >
                Update Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ══════════════════════════════════════════
          VIEW DETAILS — SIDEBAR DRAWER
      ══════════════════════════════════════════ */}
      <Drawer
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, lead: null })}
        placement="right"
        width={480}
        destroyOnClose
        title={null}
        closable={false}
        styles={{
          body: { padding: 0, background: '#f8f9fb' },
          header: { display: 'none' },
          wrapper: { boxShadow: '-4px 0 24px rgba(0,0,0,0.10)' },
        }}
      >
        {viewModal.lead && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* ── Sticky Header ── */}
            <div style={{
              background: '#fff',
              borderBottom: '1px solid #e5e7eb',
              padding: '18px 20px 16px',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: THEME.primary, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 800, flexShrink: 0,
                  }}>
                    {(viewModal.lead.customerName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', lineHeight: 1.3 }}>
                      {viewModal.lead.customerName}
                    </div>
                    <div style={{ marginTop: 5 }}>
                      <Tag
                        color={STATUS_COLORS[viewModal.lead.status]}
                        style={{ fontWeight: 600, borderRadius: 6, padding: '2px 10px', fontSize: 12 }}
                      >
                        {STATUS_LABELS[viewModal.lead.status] || viewModal.lead.status}
                      </Tag>
                    </div>
                  </div>
                </div>
                <Button
                  type="text"
                  size="small"
                  onClick={() => setViewModal({ open: false, lead: null })}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: '#f3f4f6', color: '#6b7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, padding: 0, flexShrink: 0,
                  }}
                >
                  ×
                </Button>
              </div>
            </div>

            {/* ── Scrollable Content ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

              {/* Contact Info */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                Contact Information
              </div>
              <div style={{ background: '#fff', borderRadius: 10, padding: '0 14px', marginBottom: 20, border: '1px solid #e5e7eb' }}>
                <DetailRow icon={<MailOutlined />} label="Email" value={viewModal.lead.customerEmail} />
                <DetailRow icon={<PhoneOutlined />} label="Phone" value={viewModal.lead.customerPhone} />
                {viewModal.lead.message && (
                  <DetailRow icon={<MessageOutlined />} label="Message" value={viewModal.lead.message} />
                )}
              </div>

              {/* Property */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                Property Details
              </div>
              <div style={{ background: '#fff', borderRadius: 10, padding: '0 14px', marginBottom: 20, border: '1px solid #e5e7eb' }}>
                <DetailRow
                  icon={<HomeOutlined />}
                  label="Property Title"
                  value={viewModal.lead.propertyTitle || 'No property linked'}
                />
                <DetailRow
                  icon={<HomeOutlined />}
                  label="Location"
                  value={[viewModal.lead.propertyArea, viewModal.lead.propertyEmirate].filter(Boolean).join(', ')}
                />
                {viewModal.lead.propertyPrice > 0 && (
                  <DetailRow
                    icon={<span style={{ fontWeight: 700, fontSize: 11 }}>AED</span>}
                    label="Annual Rent"
                    value={
                      <span style={{ color: '#059669', fontWeight: 700 }}>
                        AED {Number(viewModal.lead.propertyPrice).toLocaleString()}
                      </span>
                    }
                  />
                )}
              </div>

              {/* Assignment */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                Assignment
              </div>
              <div style={{ background: '#fff', borderRadius: 10, padding: '0 14px', marginBottom: 20, border: '1px solid #e5e7eb' }}>
                <DetailRow
                  icon={<UserOutlined />}
                  label="Assigned Agent"
                  value={
                    viewModal.lead.assignedAgentName
                      ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar name={viewModal.lead.assignedAgentName} size={22} bg='#6d28d9' />
                          <span>{viewModal.lead.assignedAgentName}</span>
                        </div>
                      )
                      : <span style={{ color: '#f59e0b', fontWeight: 600 }}>Not assigned yet</span>
                  }
                />
                <DetailRow
                  icon={<CalendarOutlined />}
                  label="Received On"
                  value={
                    viewModal.lead.createdAt
                      ? new Date(viewModal.lead.createdAt).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                      : '—'
                  }
                />
              </div>

              {/* Notes */}
              {viewModal.lead.notes && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                    Internal Notes
                  </div>
                  <div style={{
                    background: '#fffbeb', borderRadius: 10, padding: '12px 14px',
                    border: '1px solid #fde68a',
                  }}>
                    <div style={{ fontSize: 13, color: '#374151', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                      {viewModal.lead.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Sticky Footer Actions ── */}
            <div style={{
              background: '#fff',
              borderTop: '1px solid #e5e7eb',
              padding: '14px 20px',
              display: 'flex',
              gap: 10,
              flexShrink: 0,
            }}>
              <Button
                block
                size="large"
                icon={<EditOutlined />}
                style={{ borderColor: '#d97706', color: '#d97706' }}
                onClick={() => {
                  setViewModal({ open: false, lead: null });
                  setStatusModal({ open: true, lead: viewModal.lead });
                  statusForm.setFieldsValue({ status: viewModal.lead.status, notes: viewModal.lead.notes || '' });
                }}
              >
                Update Status
              </Button>
              <Button
                block
                type="primary"
                size="large"
                icon={<UserAddOutlined />}
                style={{ background: THEME.primary, borderColor: THEME.primary }}
                onClick={() => {
                  setViewModal({ open: false, lead: null });
                  setAssignModal({ open: true, lead: viewModal.lead });
                  if (viewModal.lead.assignedAgent) assignForm.setFieldsValue({ agentId: viewModal.lead.assignedAgent });
                }}
              >
                Assign Agent
              </Button>
            </div>

          </div>
        )}
      </Drawer>

      {/* ══════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ══════════════════════════════════════════ */}
      <Modal
        open={deleteModal.open}
        title={null}
        footer={null}
        centered
        width={400}
        destroyOnClose
        closable={!deleteLoading}
        onCancel={() => !deleteLoading && setDeleteModal({ open: false, lead: null })}
      >
        <div style={{ padding: '8px 0 4px' }}>
          {/* Icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: '#fef2f2',
            border: '1px solid #fecaca', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ExclamationCircleOutlined style={{ fontSize: 26, color: '#ef4444' }} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
              Delete this lead?
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
              You are about to permanently delete the lead from{' '}
              <strong style={{ color: '#111827' }}>{deleteModal.lead?.customerName}</strong>
              {deleteModal.lead?.propertyTitle && (
                <> for <strong style={{ color: '#111827' }}>"{deleteModal.lead?.propertyTitle}"</strong></>
              )}
              . This action cannot be undone.
            </p>
          </div>

          {/* Lead info chip */}
          {deleteModal.lead && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: '8px 12px', marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c' }}>
                  {deleteModal.lead.customerName}
                </div>
                {deleteModal.lead.customerEmail && (
                  <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>
                    {deleteModal.lead.customerEmail}
                  </div>
                )}
              </div>
              <Tag color={STATUS_COLORS[deleteModal.lead.status]} style={{ fontWeight: 600, borderRadius: 5 }}>
                {STATUS_LABELS[deleteModal.lead.status] || deleteModal.lead.status}
              </Tag>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              block
              size="large"
              onClick={() => setDeleteModal({ open: false, lead: null })}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              block
              size="large"
              danger
              type="primary"
              loading={deleteLoading}
              onClick={handleDelete}
              icon={<DeleteOutlined />}
            >
              Delete Lead
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLeadList;