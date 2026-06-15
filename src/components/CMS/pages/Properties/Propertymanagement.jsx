import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { useAuth } from '../../../../auth/AuthContext';
import { VAULT_ROLE_SLUG_MAP } from '../../../../types/auth';
import {
  Button, Input, Select, Tag, Spin, Empty,
  Pagination, Tooltip, Badge, Drawer, Form, Space,
  Popconfirm, message, InputNumber,Popover
} from 'antd';
import {
  SearchOutlined, FilterOutlined,
  FireFilled, StarFilled, EnvironmentOutlined,
  AppstoreOutlined, UnorderedListOutlined,
  CheckCircleFilled, ClockCircleFilled, CloseCircleFilled,
  EyeOutlined, DeleteOutlined, ReloadOutlined, EditOutlined,
  HomeOutlined, UserOutlined, ColumnWidthOutlined,QrcodeOutlined,
} from '@ant-design/icons';

const { Option } = Select;

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  primary:  '#7c3aed',
  hot:      '#ef4444',
  featured: '#f59e0b',
  approved: '#10b981',
  pending:  '#f59e0b',
  rejected: '#ef4444',
  inactive: '#6b7280',
  bg:       '#f5f3ff',
  card:     '#ffffff',
  border:   '#ede9fe',
  text:     '#1e1b4b',
  muted:    '#64748b',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => n ? `AED ${Number(n).toLocaleString()}` : '—';

const statusConfig = {
  approved: { color: C.approved, icon: <CheckCircleFilled />, label: 'Live'     },
  pending:  { color: C.pending,  icon: <ClockCircleFilled />, label: 'Pending'  },
  rejected: { color: C.rejected, icon: <CloseCircleFilled />, label: 'Rejected' },
  inactive: { color: C.inactive, icon: <CloseCircleFilled />, label: 'Inactive' },
  changes_requested:  { color: '#f97316', icon: <ClockCircleFilled />, label: 'Changes Requested' }, // ← add

};



const typeColors = {
  off_plan:   '#7c3aed',
  secondary:  '#0ea5e9',
  rental:     '#10b981',
  commercial: '#f59e0b',
};

const typeLabels = {
  off_plan:   'Off-Plan',
  secondary:  'Secondary',
  rental:     'Rental',
  commercial: 'Commercial',
};

// ─── Property Card ─────────────────────────────────────────────────────────────
const PropertyCard = ({ property, onApprove, onReject, onToggleHot, onToggleFeatured, onDelete, onView, onEdit, onRequestChanges, }) => {
  const {
    _id, propertyName, area, city, propertySubType,
    approvalStatus, listingStatus, isFeatured, isHot,
    price, price_min, price_max, mainLogo, photos,
    bedrooms, bathrooms, builtUpArea, builtUpArea_min, builtUpArea_max,
    developer, viewCount,
  } = property;

  const status    = listingStatus === 'active' ? 'approved'
                  : approvalStatus === 'pending' ? 'pending'
                  : approvalStatus === 'rejected' ? 'rejected'
                  : 'inactive';
  const sc        = statusConfig[status] || statusConfig.pending;
  const typeColor = typeColors[propertySubType] || '#7c3aed';
  const coverImg  = mainLogo || photos?.architecture?.[0] || photos?.other?.[0] || null;

  const displayPrice = price_min && price_max && price_min !== price_max
    ? `${fmt(price_min)} – ${fmt(price_max)}`
    : fmt(price || price_min);

  const areaStr = builtUpArea_min && builtUpArea_max && builtUpArea_min !== builtUpArea_max
    ? `${builtUpArea_min?.toLocaleString()} – ${builtUpArea_max?.toLocaleString()} sqft`
    : builtUpArea ? `${builtUpArea?.toLocaleString()} sqft` : null;

  return (
    <div
      style={{
        background: C.card,
        borderRadius: 16,
        border: `1px solid ${isHot ? C.hot + '40' : isFeatured ? C.featured + '40' : C.border}`,
        overflow: 'hidden',
        boxShadow: isHot
          ? `0 0 0 2px ${C.hot}30, 0 4px 20px rgba(0,0,0,0.08)`
          : '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* ── Image ── */}
      <div style={{ position: 'relative', height: 180, background: '#f3f0ff', flexShrink: 0, cursor: 'pointer' }} onClick={() => onView(_id)}>
        {coverImg ? (
          <img
            src={coverImg}
            alt={propertyName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 40, color: '#c4b5fd',
          }}>🏢</div>
        )}

        {/* Badges top-left */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            background: typeColor, color: '#fff',
            fontSize: 10, fontWeight: 700, padding: '3px 8px',
            borderRadius: 20, letterSpacing: '0.05em',
          }}>
            {typeLabels[propertySubType] || propertySubType}
          </span>
          {isHot && (
            <span style={{
              background: C.hot, color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '3px 8px',
              borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <FireFilled style={{ fontSize: 9 }} /> HOT
            </span>
          )}
          {isFeatured && (
            <span style={{
              background: C.featured, color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '3px 8px',
              borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <StarFilled style={{ fontSize: 9 }} /> FEATURED
            </span>
          )}
        </div>

        {/* Status badge top-right */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span style={{
            background: sc.color + '20', color: sc.color,
            border: `1px solid ${sc.color}40`,
            fontSize: 10, fontWeight: 700, padding: '3px 8px',
            borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3,
          }}>
            {sc.icon} {sc.label}
          </span>
        </div>

        {/* View count */}
        {viewCount > 0 && (
          <div style={{
            position: 'absolute', bottom: 8, right: 10,
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            fontSize: 10, padding: '2px 7px', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <EyeOutlined /> {viewCount}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div
            style={{
              fontSize: 14, fontWeight: 700, color: C.text,
              lineHeight: 1.3, marginBottom: 4,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={() => onView(_id)}
          >
            {propertyName}
          </div>
          {(area || city) && (
            <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
              <EnvironmentOutlined style={{ fontSize: 11 }} />
              {[area, city].filter(Boolean).join(', ')}
            </div>
          )}
        </div>

{/* Stats row */}
{(bedrooms > 0 || bathrooms > 0 || areaStr) && (
  <div style={{ display: 'flex', gap: 10, fontSize: 12, color: C.muted, flexWrap: 'wrap', alignItems: 'center' }}>
    {bedrooms > 0 && (
      <span style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: '#f5f3ff', borderRadius: 6,
        padding: '3px 8px', fontWeight: 600, color: '#5b21b6',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        {bedrooms} Bed
      </span>
    )}
    {bathrooms > 0 && (
      <span style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: '#f0f9ff', borderRadius: 6,
        padding: '3px 8px', fontWeight: 600, color: '#0369a1',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/>
          <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/>
        </svg>
        {bathrooms} Bath
      </span>
    )}
    {areaStr && (
      <span style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: '#f0fdf4', borderRadius: 6,
        padding: '3px 8px', fontWeight: 600, color: '#166534',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 3H3v18h18V3z"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
        {areaStr}
      </span>
    )}
  </div>
)}

        {/* Price */}
        <div style={{ fontSize: 15, fontWeight: 800, color: C.primary, marginTop: 'auto' }}>
          {displayPrice}
        </div>

        {/* Developer */}
        {developer?.name && (
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>
            By <span style={{ color: C.primary, fontWeight: 700 }}>{developer.name}</span>
          </div>
        )}
      </div>

      {/* ── Action bar ── */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: '10px 12px',
        display: 'flex', gap: 6, flexWrap: 'wrap',
        background: '#fafafa',
      }}>
        {/* View Button */}
        <Tooltip title="View Details">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onView(_id)}
            style={{
              fontSize: 11,
              background: C.primary + '10',
              borderColor: C.primary + '40',
              color: C.primary,
              fontWeight: 600,
            }}
          >
            View
          </Button>
        </Tooltip>

        {/* Edit Button — only for secondary and rental */}
        {/* {(property.propertySubType === 'secondary' || property.propertySubType === 'rental') && (
          <Tooltip title="Edit Property">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(property)}
              style={{
                fontSize: 11,
                background: '#0ea5e910',
                borderColor: '#0ea5e940',
                color: '#0ea5e9',
                fontWeight: 600,
              }}
            >
              Edit
            </Button>
          </Tooltip>
        )} */}

    {approvalStatus === 'pending' && (
  <>
    <Button size="small" type="primary" ghost
      style={{ fontSize: 11, borderColor: C.approved, color: C.approved }}
      onClick={() => onApprove(_id)}
    >
      ✓ Approve
    </Button>
    <Button size="small" danger ghost onClick={() => onReject(_id)}>
      ✕ Reject
    </Button>
    {/* ← Add this */}
    <Button size="small"
      style={{ fontSize: 11, borderColor: '#f97316', color: '#f97316' }}
      onClick={() => onRequestChanges(_id)}
    >
      ↩ Changes
    </Button>
  </>
)}

        <Tooltip title={isHot ? 'Remove Hot' : 'Mark Hot (max 3)'}>
          <Button
            size="small"
            style={{
              fontSize: 11,
              background: isHot ? C.hot + '15' : 'transparent',
              borderColor: isHot ? C.hot : '#d1d5db',
              color: isHot ? C.hot : C.muted,
            }}
            icon={<FireFilled />}
            onClick={() => onToggleHot(_id)}
          >
            Hot
          </Button>
        </Tooltip>

        <Tooltip title={isFeatured ? 'Unfeature' : 'Feature'}>
          <Button
            size="small"
            style={{
              fontSize: 11,
              background: isFeatured ? C.featured + '15' : 'transparent',
              borderColor: isFeatured ? C.featured : '#d1d5db',
              color: isFeatured ? C.featured : C.muted,
            }}
            icon={<StarFilled />}
            onClick={() => onToggleFeatured(_id)}
          />
        </Tooltip>
   {/* ⭐ INSERT QR BUTTON HERE */}
        {property.qr_code && (
          <Popover
            content={<img src={property.qr_code} alt="QR Code" style={{ width: 200 }} />}
            title="Scan QR Code"
            trigger="hover"
          >
            <Tooltip title="">
              <Button
                size="small"
                icon={<QrcodeOutlined />}
                style={{
                  borderColor: '#d1d5db',
                  color: C.muted,
                }}
              >
                QR
              </Button>
            </Tooltip>
          </Popover>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <Popconfirm title="Delete this property?" onConfirm={() => onDelete(_id)} okButtonProps={{ danger: true }}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} style={{ fontSize: 11 }} />
          </Popconfirm>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PropertyManagement = () => {
  const openRejectModal = (id) => {
  setRejectModal({ open: true, id, reason: '' });
};
  const [rejectModal, setRejectModal] = useState({
  open: false,
  id: null,
  reason: ''
});

  const navigate = useNavigate();
  const { user } = useAuth();

  const roleCode = typeof user?.role === 'object' ? String(user.role.code) : String(user?.role || '');
  const roleSlug = VAULT_ROLE_SLUG_MAP[roleCode] || 'admin';

  const [properties,       setProperties]       = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [total,            setTotal]            = useState(0);
  const [stats,            setStats]            = useState(null);
  const [filterOpen,       setFilterOpen]       = useState(false);
  const [viewMode,         setViewMode]         = useState('grid');
  const [statusFilter, setStatusFilter] = useState('All');

  const [filters, setFilters] = useState({
    search: '', propertySubType: '', approvalStatus: '', listingStatus: '',
    isHot: '', isFeatured: '', minPrice: '', maxPrice: '',
    area: '', bedroomType: '', furnishing: '',
    sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 12,
  });

  const [tempFilters,       setTempFilters]       = useState({ ...filters });
  const [activeFilterCount, setActiveFilterCount] = useState(0);
const [requestChangesModal, setRequestChangesModal] = useState({
  open: false, id: null, comment: ''
});
  useEffect(() => {
    const keys = ['propertySubType','approvalStatus','listingStatus','isHot','isFeatured',
                  'minPrice','maxPrice','area','bedroomType','furnishing'];
    setActiveFilterCount(keys.filter(k => filters[k] !== '').length);
  }, [filters]);

  useEffect(() => {
    let newApprovalStatus = '';
    if (statusFilter === 'Live') {
      newApprovalStatus = 'approved';
    } else if (statusFilter !== 'All') {
      newApprovalStatus = statusFilter.toLowerCase();
    }
    setFilters(f => ({ ...f, approvalStatus: newApprovalStatus, page: 1 }));
  }, [statusFilter]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== undefined) params[k] = v;
      });
      const res = await apiService.get('/properties', params);
      setProperties(Array.isArray(res?.data) ? res.data : []);
      setTotal(res?.pagination?.totalItems || 0);
      if (res?.stats) setStats(res.stats);
    } catch {
      message.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchProperties, 400);
    return () => clearTimeout(t);
  }, [fetchProperties]);

  const applyFilters = () => { setFilters({ ...tempFilters, page: 1 }); setFilterOpen(false); };

  const resetFilters = () => {
    const reset = {
      search: '', propertySubType: '', approvalStatus: '', listingStatus: '',
      isHot: '', isFeatured: '', minPrice: '', maxPrice: '',
      area: '', bedroomType: '', furnishing: '',
      sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 12,
    };
    setTempFilters(reset); setFilters(reset); setFilterOpen(false);
  };

const handleApprove = async (id) => {
  try {
    await apiService.put(`/properties/${id}/approve`);  // patch → put
    message.success('Property approved and live');
    fetchProperties();
  } catch (e) { message.error(e?.response?.data?.message || 'Failed to approve'); }
};

const handleReject = async (id) => {
  try {
    await apiService.put(`/properties/${id}/reject`, { rejectionReason: 'Rejected by admin' });
    message.success('Property rejected');
    fetchProperties();
  } catch (e) { message.error(e?.response?.data?.message || 'Failed to reject'); }
};

const handleToggleHot = async (id) => {
  try {
    const res = await apiService.put(`/properties/${id}/hot`);
    message.success(res?.message || 'Hot status updated');
    fetchProperties();
  } catch (e) { message.error(e?.response?.data?.message || 'Failed'); }
};

const handleToggleFeatured = async (id) => {
  try {
    await apiService.put(`/properties/${id}/feature`);
    message.success('Featured status updated');
    fetchProperties();
  } catch (e) { message.error(e?.response?.data?.message || 'Failed'); }
};

const handleDelete = async (id) => {
  try {
    await apiService.delete(`/properties/${id}`);
    message.success('Property deleted');
    fetchProperties();
  } catch (e) { message.error(e?.response?.data?.message || 'Failed to delete'); }
};

const handleRejectConfirm = async () => {
  if (!rejectModal.reason.trim()) {
    message.error('Rejection reason is required');
    return;
  }

  try {
    await apiService.put(
      `/properties/${rejectModal.id}/reject`,
      { rejectionReason: rejectModal.reason }
    );

    message.success('Property rejected');
    setRejectModal({ open: false, id: null, reason: '' });
    fetchProperties();

  } catch (e) {
    message.error('Failed to reject');
  }
};
const handleRequestChanges = async () => {
  if (!requestChangesModal.comment.trim()) {
    message.error('Admin comments are required');
    return;
  }
  try {
    await apiService.put(`/properties/${requestChangesModal.id}/request-changes`, {
      adminComments: requestChangesModal.comment
    });
    message.success('Changes requested');
    setRequestChangesModal({ open: false, id: null, comment: '' });
    fetchProperties();
  } catch (e) {
    message.error('Failed to request changes');
  }
};
  const handleView = (id) => {
    navigate(`/dashboard/${roleSlug}/property/view/${id}`);
  };

  const handleEdit = (property) => {
    const { _id, propertySubType } = property;
    if (propertySubType === 'rental') {
      navigate(`/rental/properties/edit/${_id}`);
    } else if (propertySubType === 'secondary') {
      navigate(`/dashboard/${roleSlug}/create-secondary-plans/${_id}`);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px', background: C.bg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 24, gap: 16, flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: C.text }}>
            Property Management
          </h2>
          <p style={{ margin: '4px 0 0', color: C.muted, fontSize: 13 }}>
            {total} listings total
            {stats && ` · ${stats.byStatus?.activeCount || 0} live`}
            {stats && ` · ${stats.byStatus?.pendingCount || 0} pending`}
          </p>
        </div>
      </div>

      {/* STATUS FILTER TABS */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap'
      }}>
        {["All", "Live", "Pending", "Rejected", "Draft"].map(tab => (
          <button
            key={tab}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "1.5px solid #e2e8f0",
              background: statusFilter === tab ? '#7c3aed' : '#fff',
              color: statusFilter === tab ? '#fff' : '#64748b',
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.2s ease"
            }}
            onClick={() => setStatusFilter(tab)}
          >
            {tab}
            {tab === "All" ? "" :
             tab === "Live" ? ` (${stats?.byStatus?.activeCount || 0})` :
             ` (${tab === "Pending" ? (stats?.byStatus?.pendingCount || 0) : 0})`}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 10, marginBottom: 20,
        }}>
          {[
            { label: 'Off-Plan',   value: stats.byType?.offPlan,          color: typeColors.off_plan   },
            { label: 'Secondary',  value: stats.byType?.secondary,        color: typeColors.secondary  },
            { label: 'Rental',     value: stats.byType?.rental,           color: typeColors.rental     },
            { label: 'Commercial', value: stats.byType?.commercial,       color: typeColors.commercial },
            { label: 'Pending',    value: stats.byStatus?.pendingCount,   color: C.pending  },
            { label: 'Live',       value: stats.byStatus?.activeCount,    color: C.approved },
            { label: 'Hot 🔥',     value: stats.hotCount,                 color: C.hot      },
          ].map(({ label, value, color }) => (
           <div style={{
  background: '#fff',
  borderRadius: 8,
  padding: '14px 16px',
  border: '1px solid #e5e7eb',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}}>
  <div style={{
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 500,
  }}>
    {label}
  </div>

  <div style={{
    fontSize: 22,
    fontWeight: 650,
    color: '#111827',
  }}>
    {value ?? 0}
  </div>
</div>
          ))}
        </div>
      )}

      {/* Search + Filter bar */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '14px 16px',
        border: `1px solid ${C.border}`, marginBottom: 20,
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <Input
          prefix={<SearchOutlined style={{ color: C.muted }} />}
          placeholder="Search by name, area, developer..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          allowClear
          style={{ flex: 1, minWidth: 200, borderRadius: 8 }}
          size="large"
        />

        <Select
          placeholder="Type"
          value={filters.propertySubType || undefined}
          onChange={v => setFilters(f => ({ ...f, propertySubType: v || '', page: 1 }))}
          allowClear style={{ width: 130 }} size="large"
        >
          <Option value="off_plan">Off-Plan</Option>
          <Option value="secondary">Secondary</Option>
          <Option value="rental">Rental</Option>
          <Option value="commercial">Commercial</Option>
        </Select>

        <Select
          placeholder="Status"
          value={filters.approvalStatus || undefined}
          onChange={v => setFilters(f => ({ ...f, approvalStatus: v || '', page: 1 }))}
          allowClear style={{ width: 120 }} size="large"
        >
          <Option value="pending">Pending</Option>
          <Option value="approved">Approved</Option>
          <Option value="rejected">Rejected</Option>
        </Select>

        <Select
          placeholder="Hot 🔥"
          value={filters.isHot || undefined}
          onChange={v => setFilters(f => ({ ...f, isHot: v || '', page: 1 }))}
          allowClear style={{ width: 110 }} size="large"
        >
          <Option value="true">Hot Only</Option>
          <Option value="false">Not Hot</Option>
        </Select>

        <Badge count={activeFilterCount} offset={[-4, 4]}>
          <Button
            icon={<FilterOutlined />} size="large"
            onClick={() => { setTempFilters({ ...filters }); setFilterOpen(true); }}
            style={{
              borderColor: activeFilterCount > 0 ? C.primary : undefined,
              color: activeFilterCount > 0 ? C.primary : undefined,
            }}
          >
            More Filters
          </Button>
        </Badge>

        <Button icon={<ReloadOutlined />} size="large" onClick={fetchProperties} />

        <Select
          value={`${filters.sortBy}_${filters.sortOrder}`}
          onChange={v => {
            const [sortBy, sortOrder] = v.split('_');
            setFilters(f => ({ ...f, sortBy, sortOrder, page: 1 }));
          }}
          style={{ width: 160 }} size="large"
        >
          <Option value="createdAt_desc">Newest First</Option>
          <Option value="createdAt_asc">Oldest First</Option>
          <Option value="price_asc">Price: Low → High</Option>
          <Option value="price_desc">Price: High → Low</Option>
        </Select>

        <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
          <Button
            type={viewMode === 'grid' ? 'primary' : 'text'}
            icon={<AppstoreOutlined />}
            onClick={() => setViewMode('grid')}
            style={{ borderRadius: 0, border: 'none', background: viewMode === 'grid' ? C.primary : 'transparent' }}
          />
          <Button
            type={viewMode === 'list' ? 'primary' : 'text'}
            icon={<UnorderedListOutlined />}
            onClick={() => setViewMode('list')}
            style={{ borderRadius: 0, border: 'none', background: viewMode === 'list' ? C.primary : 'transparent' }}
          />
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {filters.propertySubType && (
            <Tag closable onClose={() => setFilters(f => ({ ...f, propertySubType: '' }))} color="purple">
              {typeLabels[filters.propertySubType]}
            </Tag>
          )}
          {filters.approvalStatus && (
            <Tag closable onClose={() => setFilters(f => ({ ...f, approvalStatus: '' }))} color="orange">
              {filters.approvalStatus}
            </Tag>
          )}
          {filters.isHot === 'true' && (
            <Tag closable onClose={() => setFilters(f => ({ ...f, isHot: '' }))} color="red">🔥 Hot Only</Tag>
          )}
          {filters.isFeatured === 'true' && (
            <Tag closable onClose={() => setFilters(f => ({ ...f, isFeatured: '' }))} color="gold">⭐ Featured</Tag>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <Tag closable onClose={() => setFilters(f => ({ ...f, minPrice: '', maxPrice: '' }))} color="blue">
              Price: {filters.minPrice || '0'} – {filters.maxPrice || '∞'}
            </Tag>
          )}
          {filters.area && (
            <Tag closable onClose={() => setFilters(f => ({ ...f, area: '' }))} color="cyan">{filters.area}</Tag>
          )}
          {filters.bedroomType && (
            <Tag closable onClose={() => setFilters(f => ({ ...f, bedroomType: '' }))} color="geekblue">
              {filters.bedroomType}
            </Tag>
          )}
          <Button type="link" size="small" onClick={resetFilters} style={{ padding: 0, color: C.muted }}>
            Clear all
          </Button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : properties.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 16, padding: 60,
          textAlign: 'center', border: `1px solid ${C.border}`,
        }}>
          <Empty description="No properties found" />
          <Button type="primary" style={{ marginTop: 16, background: C.primary }} onClick={resetFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
            gap: 16,
          }}>
            {properties.map(p => (
              <PropertyCard
                key={p._id}
                property={p}
                onApprove={handleApprove}
                onReject={openRejectModal}
                onRequestChanges={(id) => setRequestChangesModal({ open: true, id, comment: '' })}
                onToggleHot={handleToggleHot}
                onToggleFeatured={handleToggleFeatured}
                onDelete={handleDelete}
                onView={handleView}
                onEdit={handleEdit}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'right', marginTop: 32 }}>
            <Pagination
              current={filters.page}
              pageSize={filters.limit}
              total={total}
              showSizeChanger
              pageSizeOptions={['12', '24', '48']}
              onChange={(page, limit) => setFilters(f => ({ ...f, page, limit }))}
              showTotal={(t, [s, e]) => `${s}–${e} of ${t}`}
            />
          </div>
        </>
      )}

      {/* Filter Drawer */}
      <Drawer
        title="Advanced Filters"
        placement="right"
        width={360}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        extra={
          <Space>
            <Button onClick={resetFilters}>Reset</Button>
            <Button type="primary" onClick={applyFilters} style={{ background: C.primary }}>Apply</Button>
          </Space>
        }
      >
        <Form layout="vertical" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Form.Item label="Price Range (AED)">
            <Input.Group compact>
              <InputNumber
                placeholder="Min"
                value={tempFilters.minPrice || undefined}
                onChange={v => setTempFilters(f => ({ ...f, minPrice: v || '' }))}
                style={{ width: '50%' }}
                formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                min={0}
              />
              <InputNumber
                placeholder="Max"
                value={tempFilters.maxPrice || undefined}
                onChange={v => setTempFilters(f => ({ ...f, maxPrice: v || '' }))}
                style={{ width: '50%' }}
                formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                min={0}
              />
            </Input.Group>
          </Form.Item>

          <Form.Item label="Property Type">
            <Select allowClear value={tempFilters.propertySubType || undefined}
              onChange={v => setTempFilters(f => ({ ...f, propertySubType: v || '' }))}
              placeholder="All types" style={{ width: '100%' }}>
              <Option value="off_plan">Off-Plan</Option>
              <Option value="secondary">Secondary</Option>
              <Option value="rental">Rental</Option>
              <Option value="commercial">Commercial</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Approval Status">
            <Select allowClear value={tempFilters.approvalStatus || undefined}
              onChange={v => setTempFilters(f => ({ ...f, approvalStatus: v || '' }))}
              placeholder="Any" style={{ width: '100%' }}>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Listing Status">
            <Select allowClear value={tempFilters.listingStatus || undefined}
              onChange={v => setTempFilters(f => ({ ...f, listingStatus: v || '' }))}
              placeholder="Any" style={{ width: '100%' }}>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="pending">Pending</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Bedrooms">
            <Select allowClear value={tempFilters.bedroomType || undefined}
              onChange={v => setTempFilters(f => ({ ...f, bedroomType: v || '' }))}
              placeholder="Any" style={{ width: '100%' }}>
              {['studio','1bed','2bed','3bed','4bed','5bed','6bed','7bed','8plus'].map(b => (
                <Option key={b} value={b}>{b === 'studio' ? 'Studio' : b.replace('bed', ' Bed')}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Furnishing">
            <Select allowClear value={tempFilters.furnishing || undefined}
              onChange={v => setTempFilters(f => ({ ...f, furnishing: v || '' }))}
              placeholder="Any" style={{ width: '100%' }}>
              <Option value="furnished">Furnished</Option>
              <Option value="semi_furnished">Semi-Furnished</Option>
              <Option value="unfurnished">Unfurnished</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Area / Location">
            <Input
              value={tempFilters.area}
              onChange={e => setTempFilters(f => ({ ...f, area: e.target.value }))}
              placeholder="e.g. Dubai Marina"
            />
          </Form.Item>

          <Form.Item label="Hot Properties 🔥">
            <Select allowClear value={tempFilters.isHot || undefined}
              onChange={v => setTempFilters(f => ({ ...f, isHot: v || '' }))}
              placeholder="All" style={{ width: '100%' }}>
              <Option value="true">Hot Only</Option>
              <Option value="false">Not Hot</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Featured ⭐">
            <Select allowClear value={tempFilters.isFeatured || undefined}
              onChange={v => setTempFilters(f => ({ ...f, isFeatured: v || '' }))}
              placeholder="All" style={{ width: '100%' }}>
              <Option value="true">Featured Only</Option>
              <Option value="false">Not Featured</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
      <Modal
  title="Reject Property"
  open={rejectModal.open}
  onCancel={() => setRejectModal({ open: false, id: null, reason: '' })}
  onOk={() => handleRejectConfirm()}
>
  <Input.TextArea
    placeholder="Enter rejection reason..."
    value={rejectModal.reason}
    onChange={(e) =>
      setRejectModal(prev => ({ ...prev, reason: e.target.value }))
    }
    rows={4}
  />
</Modal>
   <Modal
        title="Request Changes"
        open={requestChangesModal.open}
        onCancel={() => setRequestChangesModal({ open: false, id: null, comment: '' })}
        onOk={handleRequestChanges}
        okText="Send Request"
        okButtonProps={{ style: { background: '#f97316', borderColor: '#f97316' } }}
      >
        <p style={{ color: '#6b7280', marginBottom: 12 }}>
          Explain what changes the developer needs to make:
        </p>
        <Input.TextArea
          rows={4}
          placeholder="e.g. Please update the floor plan images and correct the price range..."
          value={requestChangesModal.comment}
          onChange={e => setRequestChangesModal(prev => ({ ...prev, comment: e.target.value }))}
        />
        </Modal>
    </div>
  );
};

export default PropertyManagement;