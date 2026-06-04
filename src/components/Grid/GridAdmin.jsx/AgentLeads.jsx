import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  Modal, Button, Tag, Tooltip, Avatar, Radio,
  Spin, Empty, message,
} from 'antd';
import {
  UserAddOutlined, EyeOutlined, CheckCircleFilled,
  ReloadOutlined, UserOutlined, FireOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import CustomTable from '../../CMS/pages/custom/CustomTable';

const PRIMARY = '#5c039b';
const AGENT_TEAL = '#0d9488';

const FIXED_AGENT_FILTERS = {
  lead_type: 'agent',
  source_channel: 'agent_added',
};

const TYPE_COLORS = {
  buy: { bg: '#ede9fe', color: '#5b21b6', label: 'Buy' },
  sell: { bg: '#fce7f3', color: '#9d174d', label: 'Sell' },
  rent: { bg: '#dbeafe', color: '#1e40af', label: 'Rent' },
  consultation: { bg: '#fef3c7', color: '#92400e', label: 'Consultation' },
  schedule_visit: { bg: '#e0f2fe', color: '#075985', label: 'Site Visit' },
  hot_property: { bg: '#fee2e2', color: '#dc2626', label: 'Hot Property' },
  general_enquiry: { bg: '#f3f4f6', color: '#374151', label: 'General Enquiry' },
};

const STATUS_COLORS = {
  new: { color: 'blue', label: 'New' },
  contacted: { color: 'orange', label: 'Contacted' },
  qualified: { color: 'cyan', label: 'Qualified' },
  in_discussion: { color: 'purple', label: 'In Discussion' },
  site_visit_scheduled: { color: 'geekblue', label: 'Site Visit Scheduled' },
  offer_made: { color: 'gold', label: 'Offer Made' },
  reserved: { color: 'lime', label: 'Reserved' },
  spa_signed: { color: 'green', label: 'SPA Signed' },
  completed: { color: 'success', label: 'Completed' },
  not_proceeding: { color: 'red', label: 'Not Proceeding' },
};

const CLASSIFICATION_CONFIG = {
  hot: { color: 'red', label: 'Hot' },
  warm: { color: 'orange', label: 'Warm' },
  cold: { color: 'blue', label: 'Cold' },
};

export const TypeTag = ({ type }) => {
  const t = TYPE_COLORS[type] || { bg: '#f3f4f6', color: '#374151', label: type };
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

export const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { color: 'default', label: status };
  return <Tag color={s.color} style={{ borderRadius: 20, fontSize: 11 }}>{s.label}</Tag>;
};

export const ClassificationBadge = ({ value }) => {
  const c = CLASSIFICATION_CONFIG[value] || { color: 'default', label: value };
  return (
    <Tag color={c.color} style={{ borderRadius: 20, fontSize: 11, textTransform: 'capitalize' }}>
      {c.label || '—'}
    </Tag>
  );
};

const AdvisorChip = ({ advisor }) => {
  if (!advisor) return <span style={{ color: '#9ca3af', fontSize: 12 }}>— Unassigned</span>;
  const initials = `${advisor.firstName?.[0] || ''}${advisor.lastName?.[0] || ''}`.toUpperCase();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Avatar size={24} style={{ background: PRIMARY, fontSize: 10, fontWeight: 700 }}>{initials}</Avatar>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>
        {advisor.firstName} {advisor.lastName}
      </span>
    </div>
  );
};

const AgentChip = ({ agent }) => {
  if (!agent) return <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>;
  const first = agent.first_name || agent.firstName || '';
  const last = agent.last_name || agent.lastName || '';
  const initials = `${first[0] || ''}${last[0] || ''}`.toUpperCase();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Avatar size={24} style={{ background: AGENT_TEAL, fontSize: 10, fontWeight: 700 }}>{initials}</Avatar>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', lineHeight: 1.2 }}>
          {first} {last}
        </div>
        {agent.role && (
          <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'capitalize' }}>{agent.role}</div>
        )}
      </div>
    </div>
  );
};

// ─── Assign Modal ─────────────────────────────────────────────────────────────
export const AssignModal = ({ lead, visible, onClose, onAssigned }) => {
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [options, setOptions] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible && lead) {
      fetchAdvisors();
      setNotes('');
    }
  }, [visible, lead]);

  const fetchAdvisors = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/gridlead/${lead._id}/suggest-advisors`);
      const resData = res?.data || res;

      setOptions(resData?.options || []);
      setRecommended(resData?.recommended || null);

      if (lead.assigned_to) {
        setSelectedId(
          typeof lead.assigned_to === 'object' ? lead.assigned_to._id : lead.assigned_to
        );
      } else if (resData?.recommended) {
        setSelectedId(resData.recommended._id);
      }
    } catch {
      message.error('Could not load advisors');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedId) return message.warning('Please select an advisor');
    setAssigning(true);
    try {
      await apiService.put(`/gridlead/${lead._id}/assign`, {
        advisorId: selectedId,
        notes,
      });
      message.success(lead.assigned_to ? 'Advisor reassigned successfully' : 'Advisor assigned successfully');
      onAssigned();
      onClose();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal
      open={visible} onCancel={onClose}
      footer={null} width={520}
      title={lead?.assigned_to ? 'Reassign Advisor' : 'Assign Advisor'}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
      ) : (
        <>
          <div style={{
            background: '#ffffff', borderRadius: 8, padding: '10px 14px',
            marginBottom: 16, fontSize: 12, color: '#374151',
            border: '1px solid #e5e7eb'
          }}>
            <strong>
              {lead?.contact_info?.name?.first_name
                ? `${lead.contact_info.name.first_name} ${lead.contact_info.name.last_name || ''}`
                : 'No client info'}
            </strong>
            <span style={{ marginLeft: 8, color: '#6b7280' }}>
              · {lead?.requirements?.property_type || '—'}
              {lead?.requirements?.bedrooms ? ` · ${lead.requirements.bedrooms} BR` : ''}
            </span>
          </div>

          {recommended && !lead?.assigned_to && (
            <div style={{
              background: '#ede9fe', border: '1px solid #c4b5fd',
              borderRadius: 8, padding: '8px 12px', marginBottom: 12,
              fontSize: 12, color: '#5b21b6',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontWeight: 700 }}>⭐ Best Match:</span>
              {recommended.firstName} {recommended.lastName}
              <span style={{ color: '#7c3aed', marginLeft: 4 }}>
                (Score: {recommended.leaderboard?.compositeScore || 0} · 
                Active Leads: {recommended.workload?.activeLeadsCount || 0})
              </span>
            </div>
          )}

          <Radio.Group
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{ width: '100%' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {options.length === 0 && (
                <Empty description="No active advisors found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
              {options.map(adv => {
                const isBestMatch = recommended?._id === adv._id;
                return (
                  <Radio key={adv._id} value={adv._id} style={{ margin: 0 }}>
                    <div style={{
                      padding: '10px 14px',
                      border: `1px solid ${isBestMatch ? '#c4b5fd' : '#e5e7eb'}`,
                      borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
                      background: isBestMatch ? '#faf5ff' : '#fff',
                    }}>
                      <Avatar size={28} style={{ background: PRIMARY, fontSize: 11, fontWeight: 700 }}>
                        {`${adv.firstName?.[0] || ''}${adv.lastName?.[0] || ''}`.toUpperCase()}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {adv.firstName} {adv.lastName}
                          {isBestMatch && (
                            <span style={{
                              marginLeft: 6, fontSize: 10,
                              background: '#ede9fe', color: '#5b21b6',
                              padding: '1px 6px', borderRadius: 20,
                            }}>
                              Best Match
                            </span>
                          )}
                        </div>
                        {adv.email && (
                          <div style={{ fontSize: 11, color: '#6b7280' }}>{adv.email}</div>
                        )}
                      </div>

                      <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'right', lineHeight: 1.6 }}>
                        <div>Score: {adv.leaderboard?.compositeScore || 0}</div>
                        <div>Leads: {adv.workload?.activeLeadsCount || 0}</div>
                      </div>
                    </div>
                  </Radio>
                );
              })}
            </div>
          </Radio.Group>

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Assignment note (optional)"
            rows={2}
            style={{
              width: '100%', marginTop: 12,
              border: '1px solid #e5e7eb', borderRadius: 8,
              padding: '8px 10px', fontSize: 13, resize: 'none',
              fontFamily: 'inherit',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary" loading={assigning}
              onClick={handleAssign}
              disabled={!selectedId}
              style={{ background: PRIMARY }}
            >
              {lead?.assigned_to ? 'Reassign' : 'Assign'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};


// ─── Main Page ────────────────────────────────────────────────────────────────
const AgentLeads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const [assignLead, setAssignLead] = useState(null);
  const [filters, setFilters] = useState(FIXED_AGENT_FILTERS);

  const [stats, setStats] = useState({ total: 0, unassigned: 0, hot: 0, completed: 0 });

  const fetchLeads = useCallback(async (extraFilters = {}, page = 1, limit = 10) => {
    setLoading(true);
    try {
      const merged = { ...FIXED_AGENT_FILTERS, ...extraFilters };
      const query = new URLSearchParams();

      query.set('page', page);
      query.set('limit', limit);

      if (merged.search) query.set('search', merged.search);
      if (merged.status) query.set('status', merged.status);
      if (merged.type) query.set('type', merged.type);
      if (merged.classification) query.set('classification', merged.classification);

      const res = await apiService.get(`/gridlead/agent-only?${query.toString()}`);
      const leadsData = res?.data || [];
      const paginationData = res?.pagination || {};

      setLeads(leadsData);
      setPagination({
        page: paginationData.page || page,
        limit: paginationData.limit || limit,
        total: paginationData.total || leadsData.length,
        totalPages: paginationData.totalPages || 1,
      });

      setStats({
        total: paginationData.total || leadsData.length,
        unassigned: leadsData.filter(l => !l.assigned_to).length,
        hot: leadsData.filter(l => l.classification === 'hot' && !l.assigned_to).length,
        completed: leadsData.filter(l => l.status === 'completed').length,
      });
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch agent leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(FIXED_AGENT_FILTERS); }, [fetchLeads]);

  const handlePageChange = (page, limit) => fetchLeads(filters, page, limit);

  const handleFilter = (newFilters) => {
    const merged = { ...FIXED_AGENT_FILTERS, ...filters, ...newFilters };
    setFilters(merged);
    fetchLeads(merged, 1, pagination.limit);
  };

  // Navigates to the new full page detail view
const handleViewLead = (row) => {
  navigate(`/dashboard/admin/lead-detail-admin/${row._id}`); 
};

  const columns = [
    {
      title: 'Client Name',
      key: 'contact_info_name',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
            {row.contact_info?.name?.first_name
              ? `${row.contact_info.name.first_name} ${row.contact_info.name.last_name || ''}`
              : <span style={{ color: '#9ca3af', fontWeight: 400 }}>— No client</span>}
          </div>

          {row.contact_info?.email?.address && (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
              {row.contact_info.email.address}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Phone',
      key: 'contact_info_phone',
      render: (_, row) => (
        <span style={{ fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>
          {row.contact_info?.mobile?.number
            ? `${row.contact_info.mobile.country_code || ''} ${row.contact_info.mobile.number}`
            : <span style={{ color: '#9ca3af' }}>— N/A</span>}
        </span>
      ),
    },
    {
      title: 'Type',
      key: 'enquiry_type',
      filterable: true,
      filterKey: 'type',
      filterOptions: Object.entries(TYPE_COLORS).map(([k, v]) => ({ value: k, label: v.label })),
      render: (_, row) => <TypeTag type={row.enquiry_type} />,
    },
    {
      title: 'Status',
      key: 'status',
      filterable: true,
      filterKey: 'status',
      filterOptions: Object.entries(STATUS_COLORS).map(([k, v]) => ({ value: k, label: v.label })),
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Grade',
      key: 'classification',
      filterable: true,
      filterKey: 'classification',
      filterOptions: Object.entries(CLASSIFICATION_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
      render: (val) => <ClassificationBadge value={val} />,
    },
    {
      title: 'Created By (Agent)',
      key: 'created_by_agent',
      render: (_, row) => <AgentChip agent={row.created_by_agent} />,
    },
    {
      title: 'Assigned Advisor',
      key: 'assignedAdvisor',
      render: (_, row) => <AdvisorChip advisor={row.assignedAdvisor} />,
    },
    {
      title: 'Date',
      key: 'createdAt',
      render: (val) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {val ? new Date(val).toLocaleDateString('en-IN') : '—'}
        </span>
      ),
    },
    {
      title: 'Actions', 
      key: '_id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Tooltip title="View Details">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewLead(row)} />
          </Tooltip>
          <Tooltip title={row.assigned_to ? 'Reassign Advisor' : 'Assign Advisor'}>
            <Button
              size="small" icon={<UserAddOutlined />}
              onClick={() => setAssignLead(row)}
              style={!row.assigned_to ? { borderColor: PRIMARY, color: PRIMARY } : {}}
            >
              {row.assigned_to ? 'Reassign' : 'Assign'}
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const statCards = [
    { label: 'Agent Leads', value: stats.total, bg: '#f0fdfa', color: AGENT_TEAL, icon: <TeamOutlined /> },
    { label: 'Unassigned', value: stats.unassigned, bg: '#fff7ed', color: '#c2410c', icon: <UserOutlined /> },
    { label: 'Hot & Unassigned', value: stats.hot, bg: '#fef2f2', color: '#b91c1c', icon: <FireOutlined /> },
    { label: 'Completed', value: stats.completed, bg: '#f0fdf4', color: '#16a34a', icon: <CheckCircleFilled /> },
  ];

  return (
    <div style={{ padding: '28px 32px', background: '#f0fdfa', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Agent Leads</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            Leads created by agents — assign advisors to proceed
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchLeads(filters, pagination.page, pagination.limit)}
          style={{ borderColor: AGENT_TEAL, color: AGENT_TEAL }}
        >
          Refresh
        </Button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        {statCards.map((s, i) => (
          <div key={i} style={{
            background: '#fff', border: '1px solid #ccfbf1',
            borderRadius: 12, padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</span>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: s.bg, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{s.value}</div>
          </div>
        ))}
      </div>

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
      />

      <AssignModal
        lead={assignLead}
        visible={!!assignLead}
        onClose={() => setAssignLead(null)}
        onAssigned={() => {
          setAssignLead(null);
          fetchLeads(filters, pagination.page, pagination.limit);
        }}
      />
    </div>
  );
};

export default AgentLeads;