import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Input, Select, Spin, Pagination, Tooltip, message } from 'antd';
import {
  SearchOutlined, ReloadOutlined,
  EyeOutlined, EditOutlined,
  CheckOutlined, CloseOutlined,
  EnvironmentOutlined, MessageOutlined,
  AppstoreOutlined, UnorderedListOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { useAuth } from '../../../../auth/AuthContext';
import { VAULT_ROLE_SLUG_MAP } from '../../../../types/auth';

const { Option } = Select;

// ─── Theme — identical to PropertyManagement ──────────────────────────────────
const C = {
  primary:  '#7c3aed',
  approved: '#10b981',
  pending:  '#f59e0b',
  rejected: '#ef4444',
  changes:  '#f97316',
  bg:       '#f5f3ff',
  card:     '#ffffff',
  border:   '#ede9fe',
  text:     '#1e1b4b',
  muted:    '#64748b',
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

const fmt = n => n ? `AED ${Number(n).toLocaleString()}` : '—';

// ─── Admin Notes Bubble ───────────────────────────────────────────────────────
const NotesBubble = ({ comment }) => {
  if (!comment) return null;
  return (
    <div style={{
      background: '#fff7ed',
      border: '1px solid #fed7aa',
      borderLeft: `3px solid ${C.changes}`,
      borderRadius: '0 8px 8px 8px',
      padding: '10px 12px',
      fontSize: 12,
      color: C.muted,
      lineHeight: 1.6,
      marginTop: 6,
    }}>
      <div style={{
        fontWeight: 700, color: C.changes,
        marginBottom: 4, fontSize: 10,
        letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        Admin Notes
      </div>
      {comment}
    </div>
  );
};

// ─── Changes Requested Card ───────────────────────────────────────────────────
const ChangesCard = ({ property, onApprove, onReject, onView }) => {
  const {
    _id, propertyName, area, city, propertySubType,
    price, price_min, price_max, mainLogo, photos,
    bedrooms, bathrooms, builtUpArea, builtUpArea_min, builtUpArea_max,
    developer, adminComments, updatedAt, viewCount,
  } = property;

  const coverImg     = mainLogo || photos?.architecture?.[0] || photos?.other?.[0] || null;
  const typeColor    = typeColors[propertySubType] || C.primary;
  const displayPrice = price_min && price_max && price_min !== price_max
    ? `${fmt(price_min)} – ${fmt(price_max)}`
    : fmt(price || price_min);
  const areaStr = builtUpArea_min && builtUpArea_max && builtUpArea_min !== builtUpArea_max
    ? `${builtUpArea_min?.toLocaleString()} – ${builtUpArea_max?.toLocaleString()} sqft`
    : builtUpArea ? `${builtUpArea?.toLocaleString()} sqft` : null;
  const daysAgo = updatedAt
    ? Math.floor((Date.now() - new Date(updatedAt)) / 86400000)
    : null;

  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div
      style={{
        background: C.card,
        borderRadius: 16,
        border: `1px solid ${C.changes}30`,
        overflow: 'hidden',
        boxShadow: `0 0 0 1px ${C.changes}15, 0 2px 12px rgba(0,0,0,0.06)`,
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Orange top accent stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${C.changes}, #fb923c, #fdba74)`, flexShrink: 0 }} />

      {/* Image */}
      <div
        style={{ position: 'relative', height: 180, background: '#fff7ed', flexShrink: 0, cursor: 'pointer' }}
        onClick={() => onView(_id)}
      >
        {coverImg ? (
          <img
            src={coverImg}
            alt={propertyName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.93 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fed7aa',
          }}>
            <AppstoreOutlined style={{ fontSize: 40 }} />
          </div>
        )}

        {/* Type badge — top left */}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span style={{
            background: typeColor, color: '#fff',
            fontSize: 10, fontWeight: 700, padding: '3px 8px',
            borderRadius: 20, letterSpacing: '0.05em',
          }}>
            {typeLabels[propertySubType] || propertySubType}
          </span>
        </div>

        {/* Changes requested badge — top right */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span style={{
            background: C.changes + '20', color: C.changes,
            border: `1px solid ${C.changes}40`,
            fontSize: 10, fontWeight: 700, padding: '3px 8px',
            borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <EditOutlined style={{ fontSize: 9 }} /> CHANGES REQ.
          </span>
        </div>

        {/* Updated days ago — bottom right */}
        {daysAgo !== null && (
          <div style={{
            position: 'absolute', bottom: 8, right: 10,
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            fontSize: 10, padding: '2px 7px', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <EditOutlined style={{ fontSize: 9 }} />
            Updated {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
          </div>
        )}

        {/* View count — bottom left */}
        {viewCount > 0 && (
          <div style={{
            position: 'absolute', bottom: 8, left: 10,
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            fontSize: 10, padding: '2px 7px', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <EyeOutlined /> {viewCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div
            style={{
              fontSize: 14, fontWeight: 700, color: C.text,
              lineHeight: 1.3, marginBottom: 4,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden', cursor: 'pointer',
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
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
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
                  <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z" />
                  <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25" />
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
                  <path d="M21 3H3v18h18V3z" /><path d="M3 9h18M9 21V9" />
                </svg>
                {areaStr}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div style={{ fontSize: 15, fontWeight: 800, color: C.changes, marginTop: 'auto' }}>
          {displayPrice}
        </div>

        {/* Developer */}
        {developer?.name && (
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>
            By <span style={{ color: C.primary, fontWeight: 700 }}>{developer.name}</span>
          </div>
        )}

        {/* Admin notes toggle */}
        {adminComments && (
          <div>
            <button
              onClick={() => setNotesOpen(o => !o)}
              style={{
                border: 'none', background: 'none', padding: 0,
                cursor: 'pointer', color: C.changes, fontSize: 11, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <MessageOutlined />
              {notesOpen ? 'Hide admin notes' : 'View admin notes'}
            </button>
            {notesOpen && <NotesBubble comment={adminComments} />}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div style={{
        borderTop: `1px solid ${C.changes}20`,
        padding: '10px 12px',
        display: 'flex', gap: 6, flexWrap: 'wrap',
        background: '#fafafa',
      }}>
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

        <Button
          size="small"
          type="primary"
          ghost
          icon={<CheckOutlined />}
          style={{ fontSize: 11, borderColor: C.approved, color: C.approved }}
          onClick={() => onApprove(_id)}
        >
          Approve
        </Button>

        <Button
          size="small"
          danger
          ghost
          icon={<CloseOutlined />}
          style={{ fontSize: 11 }}
          onClick={() => onReject(_id)}
        >
          Reject
        </Button>
      </div>
    </div>
  );
};

// ─── Edit Review Queue Page ───────────────────────────────────────────────────
const EditReviewQueue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = typeof user?.role === 'object' ? String(user.role.code) : String(user?.role || '');
  const roleSlug = VAULT_ROLE_SLUG_MAP[roleCode] || 'admin';

  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [total,      setTotal]      = useState(0);
  const [stats,      setStats]      = useState(null);
  const [viewMode,   setViewMode]   = useState('grid');
  const [search,     setSearch]     = useState('');
  const [subType,    setSubType]    = useState('');
  const [sortBy,     setSortBy]     = useState('updatedAt_desc');
  const [page,       setPage]       = useState(1);
  const limit = 12;

  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });
  const [submitting,  setSubmitting]  = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const [sb, so] = sortBy.split('_');
      const params = { approvalStatus: 'changes_requested', page, limit, sortBy: sb, sortOrder: so };
      if (search)  params.search = search;
      if (subType) params.propertySubType = subType;
      const res = await apiService.get('/properties', params);
      setProperties(Array.isArray(res?.data) ? res.data : []);
      setTotal(res?.pagination?.totalItems || 0);
      if (res?.stats) setStats(res.stats);
    } catch {
      message.error('Failed to load edit review queue');
    } finally {
      setLoading(false);
    }
  }, [search, subType, sortBy, page]);

  useEffect(() => {
    const t = setTimeout(fetchProperties, 400);
    return () => clearTimeout(t);
  }, [fetchProperties]);

  const handleApprove = async id => {
    try {
      await apiService.put(`/properties/${id}/approve`);
      message.success('Property approved and live');
      fetchProperties();
    } catch (e) { message.error(e?.response?.data?.message || 'Failed to approve'); }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.reason.trim()) { message.error('Rejection reason is required'); return; }
    setSubmitting(true);
    try {
      await apiService.put(`/properties/${rejectModal.id}/reject`, { rejectionReason: rejectModal.reason });
      message.success('Property rejected');
      setRejectModal({ open: false, id: null, reason: '' });
      fetchProperties();
    } catch { message.error('Failed to reject'); }
    finally { setSubmitting(false); }
  };

  // Derived stats
  const devCount   = [...new Set(properties.map(p => p.developer?.name).filter(Boolean))].length;
  const oldest     = properties.reduce((acc, p) => {
    const d = new Date(p.updatedAt);
    return (!acc || d < acc) ? d : acc;
  }, null);
  const oldestDays = oldest ? Math.floor((Date.now() - oldest) / 86400000) : 0;

  return (
    <div style={{ padding: '24px', background: C.bg, minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 24, gap: 16, flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: C.text }}>
            Edit Review Queue
          </h2>
          <p style={{ margin: '4px 0 0', color: C.muted, fontSize: 13 }}>
            {total} propert{total !== 1 ? 'ies' : 'y'} resubmitted after changes
            {oldestDays > 0 && ` · oldest updated ${oldestDays}d ago`}
          </p>
        </div>

        <span style={{
          background: C.changes + '18', border: `1px solid ${C.changes}40`,
          color: C.changes, fontWeight: 700, fontSize: 13,
          padding: '6px 14px', borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <EditOutlined /> {total} Awaiting Review
        </span>
      </div>

      {/* ── Stats bar ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 10, marginBottom: 20,
      }}>
        {[
          { label: 'In Queue',      value: total,      color: C.changes  },
          { label: 'Developers',    value: devCount,   color: C.primary  },
          { label: 'Oldest (days)', value: oldestDays, color: C.rejected },
          ...(stats ? [
            { label: 'Off-Plan',   value: stats.byType?.offPlan,    color: typeColors.off_plan   },
            { label: 'Secondary',  value: stats.byType?.secondary,  color: typeColors.secondary  },
            { label: 'Rental',     value: stats.byType?.rental,     color: typeColors.rental     },
            { label: 'Commercial', value: stats.byType?.commercial, color: typeColors.commercial },
          ] : []),
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: 8,
            padding: '14px 16px', border: '1px solid #e5e7eb',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 650, color: '#111827' }}>{value ?? 0}</div>
          </div>
        ))}
      </div>

      {/* ── Callout banner ── */}
      {!loading && total > 0 && (
        <div style={{
          background: '#fff7ed', border: `1px solid ${C.changes}30`,
          borderLeft: `3px solid ${C.changes}`,
          borderRadius: 10, padding: '10px 16px', marginBottom: 20,
          fontSize: 13, color: C.muted, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <InfoCircleOutlined style={{ color: C.changes, fontSize: 15 }} />
          These properties were sent back to developers with your notes. They have resubmitted — review and approve or reject below.
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '14px 16px',
        border: `1px solid ${C.border}`, marginBottom: 20,
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <Input
          prefix={<SearchOutlined style={{ color: C.muted }} />}
          placeholder="Search by name, area, developer..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          allowClear
          style={{ flex: 1, minWidth: 200, borderRadius: 8 }}
          size="large"
        />

        <Select
          placeholder="Type"
          value={subType || undefined}
          onChange={v => { setSubType(v || ''); setPage(1); }}
          allowClear style={{ width: 130 }} size="large"
        >
          <Option value="off_plan">Off-Plan</Option>
          <Option value="secondary">Secondary</Option>
          <Option value="rental">Rental</Option>
          <Option value="commercial">Commercial</Option>
        </Select>

        <Select
          value={sortBy}
          onChange={v => { setSortBy(v); setPage(1); }}
          style={{ width: 185 }} size="large"
        >
          <Option value="updatedAt_desc">Recently Updated</Option>
          <Option value="updatedAt_asc">Oldest Update</Option>
          <Option value="createdAt_asc">Oldest Listing</Option>
          <Option value="price_asc">Price: Low → High</Option>
          <Option value="price_desc">Price: High → Low</Option>
        </Select>

        <Button icon={<ReloadOutlined />} size="large" onClick={fetchProperties} />

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

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : properties.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 16, padding: 60,
          textAlign: 'center', border: `1px solid ${C.border}`,
        }}>
          <EditOutlined style={{ fontSize: 48, color: C.muted, marginBottom: 16, display: 'block' }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>Nothing to review</div>
          <div style={{ color: C.muted, fontSize: 14 }}>No properties are waiting for edit review right now.</div>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
            gap: 16,
          }}>
            {properties.map(p => (
              <ChangesCard
                key={p._id}
                property={p}
                onApprove={handleApprove}
                onReject={id => setRejectModal({ open: true, id, reason: '' })}
                onView={id => navigate(`/dashboard/${roleSlug}/property/view/${id}`)}
              />
            ))}
          </div>

          {total > limit && (
            <div style={{ display: 'flex', justifyContent: 'right', marginTop: 32 }}>
              <Pagination
                current={page} pageSize={limit} total={total}
                onChange={p => setPage(p)}
                showTotal={(t, [s, e]) => `${s}–${e} of ${t}`}
              />
            </div>
          )}
        </>
      )}

      {/* ── Reject Modal ── */}
      <Modal
        title={<span style={{ fontSize: 16, fontWeight: 700, color: C.rejected }}>Reject Property</span>}
        open={rejectModal.open}
        onCancel={() => setRejectModal({ open: false, id: null, reason: '' })}
        onOk={handleRejectConfirm}
        okText="Confirm Reject"
        okButtonProps={{ danger: true, loading: submitting }}
        cancelButtonProps={{ disabled: submitting }}
      >
        <p style={{ color: C.muted, marginBottom: 10, fontSize: 13 }}>
          This will permanently reject the listing. Provide a clear reason for the developer.
        </p>
        <Input.TextArea
          rows={4}
          placeholder="e.g. Changes were insufficient — images still blurry, pricing still incorrect..."
          value={rejectModal.reason}
          onChange={e => setRejectModal(p => ({ ...p, reason: e.target.value }))}
        />
      </Modal>
    </div>
  );
};

export default EditReviewQueue;