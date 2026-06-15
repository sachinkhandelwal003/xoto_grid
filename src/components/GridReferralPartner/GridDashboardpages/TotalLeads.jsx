import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight,
  FiRefreshCw, FiPlus, FiEye, FiUser, FiHome, FiPhone, FiMail, FiMapPin, FiActivity, FiCheckCircle, FiClock, FiEdit, FiTrash2
} from 'react-icons/fi';
import { Input, Select, Button, Tooltip, message, Modal, Form, InputNumber, Drawer, Descriptions, Tag, Avatar, Row, Col, Statistic, Card, Tabs } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Option } = Select;
const { TextArea } = Input;

const PRIMARY  = '#4A027C';
const GRADIENT = 'linear-gradient(135deg, #4A027C 0%, #7C3AED 100%)';

// --- BADGE MAPS ---
const STATUS_COLORS = {
  new:                  { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  contacted:            { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  qualified:            { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
  in_discussion:        { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  site_visit_scheduled: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  offer_made:           { bg: '#FFF7ED', text: '#EA580C', border: '#FDBA74' },
  reserved:             { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
  spa_signed:           { bg: '#ECFDF5', text: '#059669', border: '#6EE7B7' },
  completed:            { bg: '#F0FDF4', text: '#15803D', border: '#86EFAC' },
  not_proceeding:       { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
};

const CLASS_COLORS = {
  hot:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  warm: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  cold: { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
};

const ENQUIRY_LABELS = {
  buy: 'Buy', sell: 'Sell', rent: 'Rent', mortgage: 'Mortgage',
  consultation: 'Consultation', enquiry: 'Enquiry', schedule_visit: 'Site Visit',
  hot_property: 'Hot Property', partner: 'Partner', investor: 'Investor',
  developer: 'Developer', ai_enquiry: 'AI Enquiry', general_enquiry: 'General Enquiry',
};

const COMMISSION_COLORS = {
  pending:  { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  approved: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  paid:     { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  cancelled:{ bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
};

// --- BADGE COMPONENTS ---
const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || { bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB' };
  return (
    <span style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
      className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap">
      {status?.replace(/_/g, ' ') || '—'}
    </span>
  );
};

const ClassBadge = ({ cls }) => {
  const c = CLASS_COLORS[cls] || { bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB' };
  return (
    <span style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
      className="px-2.5 py-1 rounded-full text-xs font-bold uppercase">
      {cls || '—'}
    </span>
  );
};

const EnquiryTag = ({ type }) => (
  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
    {ENQUIRY_LABELS[type] || type?.replace(/_/g, ' ') || '—'}
  </span>
);

const CommissionBadge = ({ status }) => {
  const c = COMMISSION_COLORS[status] || { bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB' };
  return (
    <span style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
      className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap">
      {status?.replace(/_/g, ' ') || '—'}
    </span>
  );
};

// --- INLINE CUSTOM TABLE ---
const CustomTable = ({
  columns, data = [], totalItems: propTotalItems,
  currentPage: propCurrentPage = 1, itemsPerPage: propItemsPerPage = 10,
  onPageChange, onFilter, loading = false, showSearch = true,
}) => {
  const [filters,    setFilters]    = useState({ status: '', search: '' });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeout               = useRef(null);
  const [localPage,  setLocalPage]  = useState(1);
  const [localLimit, setLocalLimit] = useState(propItemsPerPage);

  const currentPage  = onPageChange ? propCurrentPage  : localPage;
  const itemsPerPage = onPageChange ? propItemsPerPage : localLimit;

  const filteredData = useMemo(() => {
    let d = [...data];
    if (!onFilter && searchTerm) {
      const t = searchTerm.toLowerCase().trim();
      d = d.filter((item) =>
        columns.some((col) => {
          const v = item[col.key];
          return v ? String(v).toLowerCase().includes(t) : false;
        }) || Object.values(item).some((val) => {
          if (!val || typeof val === 'object') return false;
          return String(val).toLowerCase().includes(t);
        })
      );
    }
    if (sortConfig.key) {
      d.sort((a, b) => {
        const av = String(a[sortConfig.key] || '').toLowerCase();
        const bv = String(b[sortConfig.key] || '').toLowerCase();
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ?  1 : -1;
        return 0;
      });
    }
    return d;
  }, [data, searchTerm, columns, sortConfig, onFilter]);

  const totalItems    = onPageChange ? propTotalItems : filteredData.length;
  const totalPages    = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem     = (currentPage - 1) * itemsPerPage + 1;
  const endItem       = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedData = onPageChange
    ? filteredData
    : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = (key, value) => {
    const n = { ...filters, [key]: value === '' ? undefined : value };
    setFilters(n);
    if (onFilter) onFilter(n);
  };

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearchTerm(v);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (v === '') {
      if (onFilter) onFilter({ ...filters, search: '' });
    } else {
      searchTimeout.current = setTimeout(() => {
        if (onFilter) onFilter({ ...filters, search: v });
        else setLocalPage(1);
      }, 600);
    }
  };

  useEffect(() => () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); }, []);

  const requestSort = (key) => {
    const d = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction: d });
  };

  const handleClear = () => {
    setFilters({ status: '', search: '' });
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'asc' });
    if (onFilter) onFilter({ status: '', search: '' });
  };

  const changePage = (page, limit) => {
    if (onPageChange) onPageChange(page, limit);
    else { setLocalPage(page); if (limit) setLocalLimit(limit); }
  };

  const hasFilters = Object.values(filters).some((v) => v !== '' && v !== undefined) || searchTerm !== '';

  const renderPages = () => {
    const btns = []; const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end   = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);

    if (start > 1)
      btns.push(<Button key="first" size="small" onClick={() => changePage(1, itemsPerPage)}><FiChevronsLeft /></Button>);
    btns.push(<Button key="prev" size="small" onClick={() => changePage(currentPage - 1, itemsPerPage)} disabled={currentPage === 1}><FiChevronLeft /></Button>);
    for (let i = start; i <= end; i++) {
      btns.push(
        <Button key={i} size="small" onClick={() => changePage(i, itemsPerPage)}
          type={currentPage === i ? 'primary' : 'default'}
          style={currentPage === i ? { backgroundColor: PRIMARY, borderColor: PRIMARY } : {}}>
          {i}
        </Button>
      );
    }
    btns.push(<Button key="next" size="small" onClick={() => changePage(currentPage + 1, itemsPerPage)} disabled={currentPage >= totalPages}><FiChevronRight /></Button>);
    if (end < totalPages)
      btns.push(<Button key="last" size="small" onClick={() => changePage(totalPages, itemsPerPage)}><FiChevronsRight /></Button>);
    return btns;
  };

  return (
    <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-100">
      {showSearch && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-grow max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <Input placeholder="Search by name, phone, email…" value={searchTerm} onChange={handleSearch}
                onPressEnter={() => { if (searchTimeout.current) clearTimeout(searchTimeout.current); if (onFilter) onFilter({ ...filters, search: searchTerm }); }}
                className="pl-9" allowClear />
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {columns.filter((c) => c.filterable).map((col) => (
                <Select key={col.key} value={filters[col.filterKey || col.key] || ''}
                  onChange={(v) => handleFilterChange(col.filterKey || col.key, v)}
                  style={{ width: 165 }} allowClear placeholder={`All ${col.title}`}>
                  <Option value="">All {col.title}</Option>
                  {col.filterOptions?.map((o) => <Option key={o.value} value={o.value}>{o.label}</Option>)}
                </Select>
              ))}
              {hasFilters && <Button onClick={handleClear} danger ghost size="small">Clear</Button>}
              <Button icon={<FiRefreshCw size={13} />} onClick={() => changePage(currentPage, itemsPerPage)}
                style={{ borderColor: PRIMARY, color: PRIMARY }}>Refresh</Button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr style={{ background: '#FAFAFA' }}>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
              {columns.map((col) => (
                <th key={col.key} onClick={() => col.sortable && requestSort(col.key)}
                  className={`px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-purple-700' : ''}`}>
                  <span className="flex items-center gap-1">
                    {col.title}
                    {col.sortable && sortConfig.key === col.key && (
                      <span style={{ color: PRIMARY }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 animate-spin"
                      style={{ borderColor: '#DDD6FE', borderTopColor: PRIMARY }} />
                    <span className="text-sm text-gray-400">Loading leads…</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => (
                <tr key={item._id || idx} className="transition-colors duration-100 hover:bg-purple-50/30">
                  <td className="px-5 py-4 text-xs text-gray-400 font-medium">{startItem + idx}</td>
                  {columns.map((col) => (
                    <td key={`${item._id || idx}-${col.key}`} className="px-5 py-4 text-sm text-gray-800 whitespace-nowrap">
                      {col.render ? col.render(item[col.key], item) : item[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#F5F3FF' }}>
                      <FiUser size={24} style={{ color: PRIMARY }} />
                    </div>
                    <p className="text-sm font-semibold text-gray-500">No leads found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-3.5 border-t border-gray-100 gap-3 bg-gray-50">
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-700">{startItem}–{endItem}</span> of{' '}
            <span className="font-semibold text-gray-700">{totalItems}</span> leads
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Per page:</span>
            <Select value={itemsPerPage} onChange={(v) => changePage(1, parseInt(v))} style={{ width: 70 }} size="small">
              {[10, 25, 50, 100].map((s) => <Option key={s} value={s}>{s}</Option>)}
            </Select>
            <div className="flex gap-1">{renderPages()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE ---
const TotalLeads = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [leads,        setLeads]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [pagination,   setPagination]   = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters,      setFilters]      = useState({});
  const [stats,        setStats]        = useState({ 
    total: 0, new: 0, in_progress: 0, completed: 0, 
    submitted: 0, pendingCommission: 0, paidCommission: 0 
  });
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiService.get('/gridlead/referral/stats');
      const payload = res?.data?.success !== undefined ? res.data : res;
      if (payload?.success && payload?.data?.stats) {
        setStats(payload.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch referral partner stats', err);
    }
  }, []);

  const fetchLeads = useCallback(async (page = 1, limit = 10, extraFilters = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set('page', page); query.set('limit', limit);
      if (extraFilters.search)         query.set('search',         extraFilters.search);
      if (extraFilters.status)         query.set('status',         extraFilters.status);
      if (extraFilters.type)           query.set('type',           extraFilters.type);
      if (extraFilters.classification) query.set('classification', extraFilters.classification);

      const res       = await apiService.get(`/gridlead/referral/my-leads?${query.toString()}`);
      const payload   = res?.data?.success !== undefined ? res.data : res;
      const leadsData = payload?.data || [];
      const pagData   = payload?.pagination || { page, limit, total: leadsData.length, totalPages: 1 };

      setLeads(leadsData);
      setPagination(pagData);
      fetchStats();
    } catch {
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => { fetchLeads(); fetchStats(); }, [fetchLeads, fetchStats]);

  const handlePageChange = (page, limit) => {
    setPagination((p) => ({ ...p, page, limit }));
    fetchLeads(page, limit, filters);
  };

  const handleFilter = (newFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    fetchLeads(1, pagination.limit, merged);
  };

  const handleAddLead = async (values) => {
    setModalLoading(true);
    try {
      const payload = {
        first_name: values.firstName,
        last_name: values.lastName,
        phone_number: values.phoneNumber,
        country_code: values.countryCode || '+971',
        email: values.email,
        property_type: values.propertyType,
        transaction_type: values.transactionType,
        location_preferences: values.areaOfInterest ? [{ area: values.areaOfInterest }] : [],
        budget_min: values.budgetMin,
        budget_max: values.budgetMax,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        area_sqft_min: values.areaMin,
        area_sqft_max: values.areaMax,
        furnished: values.furnished,
        ready_by_date: values.readyByDate,
        additional_notes: values.additionalNotes,
      };

      await apiService.post('/gridlead/referral/create-lead', payload);
      
      message.success('Referral lead submitted successfully!');
      setIsAddModalVisible(false);
      form.resetFields();
      fetchLeads();
    } catch (err) {
      console.error('Failed to submit referral lead', err);
      message.error(err?.response?.data?.message || 'Failed to submit referral lead.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditLead = async (values) => {
    setModalLoading(true);
    try {
      const nameParts = (values.customerName || '').trim().split(/\s+/);
      const first_name = nameParts[0] || '';
      const last_name  = nameParts.slice(1).join(' ') || '';

      const payload = {
        requirements: {
          first_name,
          last_name,
          phone_number: values.phoneNumber,
          country_code: values.countryCode || '+971',
          ...(values.email         && { email: values.email }),
          ...(values.areaOfInterest && { interest_area: values.areaOfInterest }),
          ...(values.budget         && { budget_max: values.budget }),
          ...(values.propertyType   && { property_type: values.propertyType }),
          transaction_type: selectedLead?.requirements?.transaction_type || 'buy',
        },
        reason: 'Updated by referral partner',
      };

      await apiService.put(`/gridlead/referral/${selectedLead._id}/update-requirements`, payload);

      message.success('Lead updated successfully!');
      setIsEditModalVisible(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (err) {
      console.error('Failed to update lead', err);
      message.error(err?.response?.data?.message || 'Failed to update lead.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    try {
      message.warning('Delete functionality not available yet');
    } catch (err) {
      console.error('Failed to delete lead', err);
      message.error('Failed to delete lead');
    }
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    const fn = lead.contact_info?.name?.first_name || '';
    const ln = lead.contact_info?.name?.last_name  || '';
    form.setFieldsValue({
      customerName:   `${fn} ${ln}`.trim(),
      phoneNumber:    lead.contact_info?.mobile?.number,
      countryCode:    lead.contact_info?.mobile?.country_code || '+971',
      email:          lead.contact_info?.email?.address,
      areaOfInterest: lead.requirements?.location_preferences?.[0]?.area,
      budget:         lead.requirements?.budget_max,
      propertyType:   lead.requirements?.property_type,
    });
    setIsEditModalVisible(true);
  };

  const openViewDrawer = (lead) => {
    setSelectedLead(lead);
    setDrawerVisible(true);
  };

  const statCards = [
    { label: 'Total Leads', value: stats.total,      color: PRIMARY,   bg: '#F5F3FF', icon: FiUser },
    { label: 'New',         value: stats.new,        color: '#1D4ED8', bg: '#EFF6FF', icon: FiActivity },
    { label: 'In Progress', value: stats.in_progress, color: '#D97706', bg: '#FFFBEB', icon: FiClock },
    { label: 'Completed',   value: stats.completed,  color: '#15803D', bg: '#F0FDF4', icon: FiCheckCircle },
    { label: 'Submitted',   value: stats.submitted,  color: '#7C3AED', bg: '#F5F3FF', icon: FiCheckCircle },
    { label: 'Pending Comm', value: stats.pendingCommission, color: '#D97706', bg: '#FFFBEB', icon: FiClock },
  ];

  const columns = [
    {
      key: 'contact_info', title: 'Client', sortable: false,
      render: (_, row) => {
        const fn    = row.contact_info?.name?.first_name || '';
        const ln    = row.contact_info?.name?.last_name  || '';
        const phone = row.contact_info?.mobile?.number   || '—';
        const email = row.contact_info?.email?.address   || null;
        return (
          <div className="flex items-center gap-3 min-w-[160px]">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: GRADIENT }}>
              {(fn?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm leading-tight">
                {`${fn} ${ln}`.trim() || 'Unknown'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <FiPhone size={10} /> {phone}
              </p>
              {email && (
                <p className="text-xs text-gray-400 flex items-center gap-1 truncate max-w-[150px]">
                  <FiMail size={10} /> {email}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'enquiry_type', title: 'Type', sortable: true,
      filterable: true, filterKey: 'type',
      filterOptions: [
        { value: 'buy', label: 'Buy' }, { value: 'rent', label: 'Rent' },
        { value: 'sell', label: 'Sell' }, { value: 'consultation', label: 'Consultation' },
        { value: 'general_enquiry', label: 'General Enquiry' },
      ],
      render: (val) => <EnquiryTag type={val} />,
    },
    {
      key: 'requirements', title: 'Requirements', sortable: false,
      render: (_, row) => {
        const req  = row.requirements || {};
        const parts = [];
        if (req.property_type)    parts.push(req.property_type);
        if (req.bedrooms != null) parts.push(req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} BR`);
        if (req.budget_max)       parts.push(`AED ${(req.budget_max / 1000).toFixed(0)}k`);
        const locs = req.location_preferences?.map((l) => (typeof l === 'string' ? l : l.area)).filter(Boolean);
        if (locs?.length) parts.push(locs[0]);
        if (!parts.length) return <span className="text-gray-300 text-xs">No details</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {parts.map((p, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-xs border"
                style={{ background: '#F5F3FF', color: PRIMARY, borderColor: '#DDD6FE' }}>
                {p}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'status', title: 'Status', sortable: true,
      filterable: true,
      filterOptions: [
        { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' },
        { value: 'in_discussion', label: 'In Discussion' },
        { value: 'site_visit_scheduled', label: 'Site Visit Scheduled' },
        { value: 'offer_made', label: 'Offer Made' }, { value: 'reserved', label: 'Reserved' },
        { value: 'spa_signed', label: 'SPA Signed' }, { value: 'completed', label: 'Completed' },
        { value: 'not_proceeding', label: 'Not Proceeding' },
      ],
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'classification', title: 'Priority', sortable: true,
      filterable: true,
      filterOptions: [
        { value: 'hot', label: '🔥 Hot' }, { value: 'warm', label: '🌤 Warm' }, { value: 'cold', label: '❄️ Cold' },
      ],
      render: (val) => <ClassBadge cls={val} />,
    },
    {
      key: 'referral_info', title: 'Commission', sortable: true,
      render: (_, row) => <CommissionBadge status={row.referral_info?.commission_status} />,
    },
    {
      key: 'actions', title: 'Actions', sortable: false,
      render: (_, row) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
            <Button
              shape="circle"
              size="small"
              icon={<FiEye size={14} />}
              style={{ color: PRIMARY, borderColor: PRIMARY }}
              onClick={() => navigate(`/dashboard/gridreferralpartner/lead/${row._id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit Lead">
            <Button
              shape="circle"
              size="small"
              icon={<FiEdit size={14} />}
              style={{ color: PRIMARY, borderColor: PRIMARY }}
              onClick={() => openEditModal(row)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const LeadFormModal = ({ isEdit, initialValues }) => (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FiUser style={{ color: PRIMARY }} />
          <span>{isEdit ? 'Edit Referral Lead' : 'Add New Referral Lead'}</span>
        </div>
      }
      open={isEdit ? isEditModalVisible : isAddModalVisible}
      onCancel={() => {
        if (isEdit) {
          setIsEditModalVisible(false);
          setSelectedLead(null);
        } else {
          setIsAddModalVisible(false);
        }
        form.resetFields();
      }}
      confirmLoading={modalLoading}
      onOk={() => form.submit()}
      okText={isEdit ? 'Update Lead' : 'Submit Lead'}
      okButtonProps={{ style: { backgroundColor: PRIMARY } }}
      destroyOnClose
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={isEdit ? handleEditLead : handleAddLead}
        initialValues={{ countryCode: '+971', ...initialValues }}
        style={{ marginTop: '16px' }}
      >
        {/* Customer Name */}
        <Form.Item
          name="customerName"
          label="Customer Name"
          rules={[{ required: true, message: 'Customer name is required' }]}
        >
          <Input prefix={<FiUser size={13} color="#94A3B8" />} placeholder="e.g. Ahmed Al Mansouri" />
        </Form.Item>

        {/* Phone */}
        <Form.Item label="Customer Phone" required style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Form.Item name="countryCode" noStyle rules={[{ required: true, message: 'Required' }]}>
              <Select showSearch style={{ width: '130px' }} optionFilterProp="children"
                filterOption={(input, option) => option?.children?.toString().toLowerCase().includes(input.toLowerCase())}
              >
                <Option value="+971">+971 (UAE)</Option>
                <Option value="+91">+91 (India)</Option>
                <Option value="+1">+1 (USA)</Option>
                <Option value="+44">+44 (UK)</Option>
                <Option value="+966">+966 (KSA)</Option>
                <Option value="+974">+974 (Qatar)</Option>
                <Option value="+965">+965 (Kuwait)</Option>
                <Option value="+973">+973 (Bahrain)</Option>
                <Option value="+968">+968 (Oman)</Option>
              </Select>
            </Form.Item>
            <Form.Item name="phoneNumber" noStyle rules={[
              { required: true, message: 'Phone number is required' },
              { pattern: /^\d{6,15}$/, message: 'Enter a valid phone number' },
            ]}>
              <Input prefix={<FiPhone size={13} color="#94A3B8" />} placeholder="501234567" style={{ flex: 1 }} />
            </Form.Item>
          </div>
        </Form.Item>

        {/* Email */}
        <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Enter a valid email' }]} style={{ marginTop: '16px' }}>
          <Input prefix={<FiMail size={13} color="#94A3B8" />} placeholder="client@email.com" />
        </Form.Item>

        {/* Interest Area + Property Type — 2 col */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="areaOfInterest" label="Interest Area">
              <Input prefix={<FiMapPin size={13} color="#94A3B8" />} placeholder="e.g. Dubai Marina" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="propertyType" label="Property Type">
              <Select placeholder="Select type" allowClear>
                <Option value="Apartment">Apartment</Option>
                <Option value="Villa">Villa</Option>
                <Option value="Townhouse">Townhouse</Option>
                <Option value="Penthouse">Penthouse</Option>
                <Option value="Commercial">Commercial</Option>
                <Option value="Land">Land</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Budget */}
        <Form.Item name="budget" label="Budget (AED)">
          <InputNumber
            style={{ width: '100%' }}
            placeholder="e.g. 1,500,000"
            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={v => v?.replace(/,/g, '')}
            min={0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen" style={{ backgroundColor: '#F8F7FF' }}>
      {/* Header with Add Lead Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">My Referrals</h1>
          <p className="text-sm text-gray-400 mt-1 m-0">Manage and track all leads you've referred</p>
        </div>
        <Button 
          type="primary" 
          icon={<FiPlus />} 
          size="large"
          style={{ backgroundColor: PRIMARY, borderRadius: '10px' }}
          onClick={() => navigate('/dashboard/gridreferralpartner/submit-leads')}
        >
          Add New Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <Row gutter={[16, 16]}>
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Col xs={24} sm={12} md={8} lg={4} key={s.label}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: s.color, borderRadius: '12px' }}>
                  <Statistic 
                    title={<span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</span>} 
                    value={s.value} 
                    prefix={<Icon style={{ color: s.color }} />} 
                    valueStyle={{ color: s.color, fontWeight: 700, fontSize: '28px' }}
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      <CustomTable
        columns={columns}
        data={leads}
        totalItems={pagination.total}
        currentPage={pagination.page}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        onFilter={handleFilter}
        loading={loading}
        showSearch
      />

      {/* Add/Edit Lead Modal */}
      <LeadFormModal isEdit={false} />
      {selectedLead && <LeadFormModal isEdit={true} initialValues={{}} />}

      {/* View Lead Details Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <FiEye style={{ color: PRIMARY }} />
            <span>Lead Details</span>
          </div>
        }
        placement="right"
        width={600}
        onClose={() => { setDrawerVisible(false); setSelectedLead(null); }}
        open={drawerVisible}
        destroyOnClose
      >
        {selectedLead && (
          <div className="space-y-6">
            <Card bordered={false} className="shadow-sm">
              <div className="flex items-start gap-4">
                <Avatar size={64} icon={<FiUser />} style={{ backgroundColor: PRIMARY }} />
                <div className="flex-1">
                  <h3 className="text-xl font-bold m-0 text-gray-800">
                    {`${selectedLead.contact_info?.name?.first_name || ''} ${selectedLead.contact_info?.name?.last_name || ''}`.trim() || 'Unknown Client'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <EnquiryTag type={selectedLead.enquiry_type} />
                    <StatusBadge status={selectedLead.status} />
                    {selectedLead.referral_info?.commission_status && (
                      <CommissionBadge status={selectedLead.referral_info.commission_status} />
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Submitted On: {new Date(selectedLead.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Contact Information" size="small" bordered={false} className="shadow-sm">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Name">
                  {`${selectedLead.contact_info?.name?.first_name || ''} ${selectedLead.contact_info?.name?.last_name || ''}`.trim() || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedLead.contact_info?.email?.address ? (
                    <a href={`mailto:${selectedLead.contact_info.email.address}`} className="text-blue-600">
                      {selectedLead.contact_info.email.address}
                    </a>
                  ) : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {selectedLead.contact_info?.mobile?.number ? (
                    <a href={`tel:${selectedLead.contact_info.mobile.country_code}${selectedLead.contact_info.mobile.number}`} className="text-blue-600">
                      {selectedLead.contact_info.mobile.country_code} {selectedLead.contact_info.mobile.number}
                    </a>
                  ) : '—'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Requirements" size="small" bordered={false} className="shadow-sm">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Looking to">
                  {selectedLead.requirements?.transaction_type || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Property Type">
                  {selectedLead.requirements?.property_type || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Area of Interest">
                  {selectedLead.requirements?.location_preferences?.map((l) => (typeof l === 'string' ? l : l.area)).join(', ') || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Budget">
                  {selectedLead.requirements?.budget_min && selectedLead.requirements?.budget_max 
                    ? `AED ${(selectedLead.requirements.budget_min / 1000).toFixed(0)}k - ${(selectedLead.requirements.budget_max / 1000).toFixed(0)}k`
                    : selectedLead.requirements?.budget_max 
                      ? `AED ${(selectedLead.requirements.budget_max / 1000).toFixed(0)}k`
                      : selectedLead.requirements?.budget_min
                        ? `AED ${(selectedLead.requirements.budget_min / 1000).toFixed(0)}k`
                        : '—'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Bedrooms">
                  {selectedLead.requirements?.bedrooms != null 
                    ? (selectedLead.requirements.bedrooms === 0 ? 'Studio' : `${selectedLead.requirements.bedrooms}`)
                    : '—'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Bathrooms">
                  {selectedLead.requirements?.bathrooms || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Furnished">
                  {selectedLead.requirements?.furnished || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Additional Notes">
                  {selectedLead.requirements?.additional_notes || '—'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Status" size="small" bordered={false} className="shadow-sm">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Current Status">
                  <StatusBadge status={selectedLead.status} />
                </Descriptions.Item>
                <Descriptions.Item label="Priority">
                  <ClassBadge cls={selectedLead.classification} />
                </Descriptions.Item>
                <Descriptions.Item label="Submitted to Xoto">
                  {selectedLead.submitted_to_xoto ? 'Yes' : 'No'}
                </Descriptions.Item>
                {selectedLead.submitted_to_xoto_at && (
                  <Descriptions.Item label="Submitted At">
                    {new Date(selectedLead.submitted_to_xoto_at).toLocaleString()}
                  </Descriptions.Item>
                )}
                {selectedLead.referral_info?.commission_status && (
                  <Descriptions.Item label="Commission Status">
                    <CommissionBadge status={selectedLead.referral_info.commission_status} />
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TotalLeads;
