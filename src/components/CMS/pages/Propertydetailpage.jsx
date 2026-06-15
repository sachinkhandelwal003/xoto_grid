import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { useAuth } from '../../../auth/AuthContext';
import { VAULT_ROLE_SLUG_MAP } from '../../../types/auth';
import { Button, Spin, Tag, Popconfirm, message, Modal, Input, Progress } from 'antd';
import {
  ArrowLeftOutlined, FireFilled, StarFilled, EnvironmentOutlined,
  CheckCircleFilled, ClockCircleFilled, CloseCircleFilled,
  EyeOutlined, HomeOutlined, UserOutlined, ColumnWidthOutlined,
  DeleteOutlined, PhoneOutlined, MailOutlined, CarOutlined, EditOutlined,
  CheckOutlined, CloseOutlined, WarningOutlined, BuildOutlined,
  FilePdfOutlined, VideoCameraOutlined, ExpandOutlined,
  AppstoreOutlined, PictureOutlined, CalendarOutlined,
  SafetyCertificateOutlined, QrcodeOutlined, WalletOutlined,
  DownloadOutlined // Added for document downloads
} from '@ant-design/icons';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary:   '#6d28d9',
  primaryLt: '#ede9fe',
  hot:       '#dc2626',
  hotLt:     '#fee2e2',
  featured:  '#d97706',
  featuredLt:'#fef3c7',
  success:   '#059669',
  successLt: '#d1fae5',
  warn:      '#d97706',
  warnLt:    '#fef3c7',
  danger:    '#dc2626',
  dangerLt:  '#fee2e2',
  muted:     '#64748b',
  text:      '#0f172a',
  textSoft:  '#334155',
  border:    '#e2e8f0',
  bg:        '#f8fafc',
  card:      '#ffffff',
  surface:   '#f1f5f9',
};

const fmt = (n) => n ? `AED ${Number(n).toLocaleString()}` : '—';

const typeColors = {
  off_plan:   { bg: '#ede9fe', text: '#5b21b6', dot: '#7c3aed' },
  secondary:  { bg: '#e0f2fe', text: '#0369a1', dot: '#0ea5e9' },
  rental:     { bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
  commercial: { bg: '#fef9c3', text: '#854d0e', dot: '#ca8a04' },
};
const typeLabels = { off_plan: 'Off-Plan', secondary: 'Secondary', rental: 'Rental', commercial: 'Commercial' };

// ─── Micro Components ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    approved: { bg: T.successLt, text: T.success, icon: <CheckCircleFilled />, label: 'Live'     },
    pending:  { bg: T.warnLt,    text: T.warn,    icon: <ClockCircleFilled />, label: 'Pending'  },
    rejected: { bg: T.dangerLt,  text: T.danger,  icon: <CloseCircleFilled />, label: 'Rejected' },
    inactive: { bg: '#f1f5f9',   text: T.muted,   icon: <CloseCircleFilled />, label: 'Inactive' },
  }[status] || { bg: T.warnLt, text: T.warn, icon: <ClockCircleFilled />, label: 'Pending' };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, color: cfg.text,
      fontSize: 11, fontWeight: 700, padding: '4px 10px',
      borderRadius: 20, letterSpacing: '0.03em',
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const InfoRow = ({ label, value, mono }) => value ? (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 0', borderBottom: `1px solid ${T.border}`, gap: 12,
  }}>
    <span style={{ fontSize: 12, color: T.muted, fontWeight: 500, flexShrink: 0 }}>{label}</span>
    <span style={{
      fontSize: 13, color: T.text, fontWeight: 600, textAlign: 'right',
      fontFamily: mono ? 'monospace' : undefined,
    }}>{value}</span>
  </div>
) : null;

const StatChip = ({ icon, label, value, accent }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    background: T.card, borderRadius: 12,
    border: `1px solid ${T.border}`,
    padding: '11px 14px',
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 9,
      background: (accent || T.primary) + '15',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: accent || T.primary, fontSize: 15, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginTop: 1 }}>{value}</div>
    </div>
  </div>
);

const SectionCard = ({ title, icon, children, noPad, borderColor }) => (
  <div style={{
    background: T.card, borderRadius: 16,
    border: `1px solid ${borderColor || T.border}`,
    overflow: 'hidden', marginBottom: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }}>
    {title && (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 18px', borderBottom: `1px solid ${T.border}`,
        background: T.surface,
      }}>
        {icon && <span style={{ color: T.primary, fontSize: 14 }}>{icon}</span>}
        <span style={{ fontWeight: 700, color: T.text, fontSize: 13, letterSpacing: '0.01em' }}>{title}</span>
      </div>
    )}
    <div style={noPad ? undefined : { padding: 18 }}>{children}</div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const PropertyDetailPage = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const roleCode  = typeof user?.role === 'object' ? String(user.role.code) : String(user?.role || '');
  const roleSlug  = VAULT_ROLE_SLUG_MAP[roleCode] || 'admin';

  const [property,       setProperty]      = useState(null);
  const [documents,      setDocuments]     = useState([]); // Added state for Library Documents
  const [loading,        setLoading]       = useState(true);
  const [activeImg,      setActiveImg]     = useState(0);
  const [lightbox,       setLightbox]      = useState(false);
  const [rejectOpen,     setRejectOpen]    = useState(false);
  const [rejectReason,   setRejectReason]  = useState('');
  const [actionLoading,  setActionLoading] = useState('');

  const fetchProperty = async () => {
    try {
      const res = await apiService.get(`/properties/${id}`);
      const data = res?.data?.data || res?.data || res;
      setProperty(data);
    } catch {
      message.error('Failed to load property');
    }
  };

  // Fetch API for library documents
  const fetchDocuments = async () => {
    try {
      const res = await apiService.get(`/property-documents/${id}`);
      setDocuments(res?.data?.data || res?.data || []);
    } catch {
      console.error('Failed to fetch property documents');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchProperty(), fetchDocuments()]);
    setLoading(false);
  }

  useEffect(() => { loadAllData(); }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spin size="large" />
    </div>
  );
  if (!property) return (
    <div style={{ textAlign: 'center', padding: 80, color: T.muted, fontSize: 15 }}>
      Property not found.
    </div>
  );

  // ── Field extraction (handles both legacy and new schema) ────────────────
  const p              = property;
  const subType        = p.propertySubType;
  const med            = p.media || {};
  const devDetails     = p.developerDetails || p.developer || {};
  const loc            = p.location || {};
  const payPlanFirst   = Array.isArray(p.paymentPlan) ? p.paymentPlan[0] : null;
  const stages         = payPlanFirst?.stages || [];
  const inventory      = Array.isArray(p.inventory) ? p.inventory
                       : Array.isArray(p.inventoryConfig) ? p.inventoryConfig : [];
  const floorPlans     = Array.isArray(p.floorPlans) ? p.floorPlans : [];
  const buildings      = Array.isArray(p.buildings)  ? p.buildings  : [];
  const youtubeVideos  = Array.isArray(p.youtubeVideos) ? p.youtubeVideos.filter(Boolean) : [];

  // ── Images ────────────────────────────────────────────────────────────────
  const archImgs  = Array.isArray(med.architectureImages) ? med.architectureImages.filter(Boolean) : [];
  const interImgs = Array.isArray(med.interiorImages)     ? med.interiorImages.filter(Boolean)     : [];
  const lobbyImgs = Array.isArray(med.lobbyImages)        ? med.lobbyImages.filter(Boolean)         : [];
  const mainLogo  = med.mainLogo || p.mainLogo;

  const legacyPhotos = (() => {
    const ph = p.photos;
    if (!ph) return [];
    if (Array.isArray(ph)) return ph.filter(Boolean);
    return Object.values(ph).flat().filter(Boolean);
  })();

  const allImgs = [
    ...(mainLogo ? [mainLogo] : []),
    ...archImgs, ...interImgs, ...lobbyImgs, ...legacyPhotos,
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  // ── Price ─────────────────────────────────────────────────────────────────
  const priceFrom = p.priceRange?.from || p.price_min;
  const priceTo   = p.priceRange?.to   || p.price_max;
  const displayPrice = priceFrom && priceTo && priceFrom !== priceTo
    ? `${fmt(priceFrom)} – ${fmt(priceTo)}`
    : fmt(p.price || priceFrom);

  // ── Area ──────────────────────────────────────────────────────────────────
  const areaStr = p.builtUpArea_min && p.builtUpArea_max && p.builtUpArea_min !== p.builtUpArea_max
    ? `${p.builtUpArea_min?.toLocaleString()} – ${p.builtUpArea_max?.toLocaleString()} ${p.builtUpAreaUnit || 'sqft'}`
    : p.builtUpArea ? `${Number(p.builtUpArea).toLocaleString()} ${p.builtUpAreaUnit || 'sqft'}` : null;

  // ── Status ────────────────────────────────────────────────────────────────
  const status = p.listingStatus === 'active'         ? 'approved'
               : p.approvalStatus === 'pending'        ? 'pending'
               : p.approvalStatus === 'rejected'       ? 'rejected'
               : p.approvalStatus === 'approved'       ? 'approved'
               : 'inactive';

  const tc = typeColors[subType] || typeColors.off_plan;

// ── Completion date display ───────────────────────────────────────────────
  const completionDisplay = p.completionDate?.quarter
    ? `${p.completionDate.quarter} ${p.completionDate.year}`
    : p.completionDate?.fullDate
      ? new Date(p.completionDate.fullDate).toLocaleDateString('en-AE', { month: 'short', year: 'numeric' })
      : (typeof p.completionDate === 'string' ? p.completionDate : null);

  // ── Actions ───────────────────────────────────────────────────────────────
  const act = (key, fn) => async () => {
    setActionLoading(key);
    try { await fn(); fetchProperty(); }
    catch (e) { message.error(e?.response?.data?.message || 'Action failed'); }
    finally { setActionLoading(''); }
  };

  const doApprove = act('approve', async () => {
    await apiService.patch(`/properties/${id}/approve`);
    message.success('Property approved and live!');
  });

  const doReject = async () => {
    if (!rejectReason.trim()) return message.warning('Please enter a rejection reason');
    setActionLoading('reject');
    try {
      await apiService.patch(`/properties/${id}/reject`, { rejectionReason: rejectReason });
      message.success('Property rejected');
      setRejectOpen(false); setRejectReason('');
      fetchProperty();
    } catch (e) { message.error(e?.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const doToggleHot = act('hot', async () => {
    await apiService.patch(`/properties/${id}/hot`);
    message.success('Hot status updated');
  });

  const doToggleStatus = act('toggle', async () => {
    await apiService.patch(`/properties/${id}/toggle-status`);
    message.success('Listing status updated');
  });

  const doDelete = async () => {
    setActionLoading('delete');
    try {
      await apiService.delete(`/properties/${id}`);
      message.success('Deleted');
      navigate(-1);
    } catch (e) { message.error(e?.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  return (
    <>
      <style>{`
        .pdp-root { background: ${T.bg}; min-height: 100vh; padding: 16px; min-width: 0; overflow-x: hidden; box-sizing: border-box; width: 100%; }
        .pdp-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; gap: 10px; flex-wrap: wrap; width: 100%; }
        .pdp-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .pdp-layout { display: grid; grid-template-columns: 1fr 340px; gap: 18px; align-items: start; min-width: 0; }
        .pdp-layout > div { min-width: 0; }
        .pdp-thumb-row { display: flex; gap: 7px; padding: 10px 14px; overflow-x: auto; background: ${T.surface}; border-top: 1px solid ${T.border}; }
        .pdp-thumb { width: 64px; height: 46px; border-radius: 8px; overflow: hidden; cursor: pointer; flex-shrink: 0; transition: opacity 0.15s, border 0.15s; }
        .pdp-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
        .pdp-amenity { background: ${T.primaryLt}; color: ${T.primary}; border: 1px solid #ddd6fe; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px; }
        .pdp-media-btn { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none; margin-bottom: 8px; transition: opacity 0.15s; }
        .pdp-media-btn:hover { opacity: 0.8; }
        .pdp-table-row { display: flex; padding: 9px 14px; font-size: 13px; border-bottom: 1px solid ${T.border}; }
        .pdp-table-row:last-child { border-bottom: none; }
        .pdp-table-head { display: flex; padding: 8px 14px; font-size: 11px; font-weight: 700; color: ${T.muted}; text-transform: uppercase; letter-spacing: 0.05em; background: ${T.surface}; border-bottom: 1px solid ${T.border}; }
        .lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .lightbox img { max-width: 100%; max-height: 90vh; border-radius: 12px; object-fit: contain; }
        @media (max-width: 900px) { .pdp-layout { grid-template-columns: 1fr; } .pdp-root { padding: 12px; } }
        @media (max-width: 600px) { .pdp-topbar { flex-direction: column; align-items: flex-start; } .pdp-actions { width: 100%; } .pdp-stats { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <div className="pdp-root">

        {/* ── Top bar ── */}
        <div className="pdp-topbar">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ borderRadius: 9, fontWeight: 600, borderColor: T.border, color: T.text, flexShrink: 0 }}
          >
            Back
          </Button>

          <div className="pdp-actions">
            {p.approvalStatus === 'pending' && (
              <>
                <Button
                  type="primary" icon={<CheckOutlined />}
                  loading={actionLoading === 'approve'}
                  onClick={doApprove}
                  style={{ background: T.success, borderColor: T.success, borderRadius: 9, fontWeight: 600 }}
                >
                  Approve
                </Button>
                <Button
                  danger icon={<CloseOutlined />}
                  loading={actionLoading === 'reject'}
                  onClick={() => setRejectOpen(true)}
                  style={{ borderRadius: 9, fontWeight: 600 }}
                >
                  Reject
                </Button>
              </>
            )}

            {p.listingStatus === 'inactive' && (
              <Button
                icon={<CheckCircleFilled />}
                loading={actionLoading === 'toggle'}
                onClick={doToggleStatus}
                style={{ borderRadius: 9, fontWeight: 600, borderColor: T.success, color: T.success }}
              >
                Activate
              </Button>
            )}

            {/* {(subType === 'secondary' || subType === 'rental') && (
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  if (subType === 'rental') navigate(`/dashboard/${roleSlug}/rental/properties/edit/${id}`);
                  else navigate(`/dashboard/${roleSlug}/secondary-properties/edit/${id}`);
                }}
                style={{ borderRadius: 9, fontWeight: 600, borderColor: '#7c3aed', color: '#7c3aed' }}
              >
                Edit Property
              </Button>
            )} */}

            <Button
              icon={<FireFilled />}
              loading={actionLoading === 'hot'}
              onClick={doToggleHot}
              style={{
                borderRadius: 9, fontWeight: 600,
                background: p.isHot ? T.hotLt : 'transparent',
                borderColor: p.isHot ? T.hot : T.border,
                color: p.isHot ? T.hot : T.muted,
              }}
            >
              {p.isHot ? 'Unmark Hot' : 'Mark Hot'}
            </Button>

            <Popconfirm title="Delete this property permanently?" onConfirm={doDelete} okButtonProps={{ danger: true }} okText="Delete">
              <Button
                danger icon={<DeleteOutlined />}
                loading={actionLoading === 'delete'}
                style={{ borderRadius: 9, fontWeight: 600 }}
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        </div>

        {/* ── 2-col layout ── */}
        <div className="pdp-layout">

          {/* ══ LEFT COLUMN ══ */}
          <div>

            {/* Gallery */}
            <div style={{
              background: T.card, borderRadius: 18,
              border: `1px solid ${T.border}`, marginBottom: 14,
              overflow: 'hidden',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            }}>
              <div
                style={{ position: 'relative', height: 360, background: T.surface, cursor: allImgs.length ? 'zoom-in' : 'default' }}
                onClick={() => allImgs.length && setLightbox(true)}
              >
                {allImgs.length > 0 ? (
                  <img
                    src={allImgs[activeImg]} alt={p.propertyName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd', fontSize: 48 }}>
                    <PictureOutlined />
                  </div>
                )}

                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: tc.bg, color: tc.text, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
                    {typeLabels[subType] || subType}
                  </span>
                  {p.isHot && (
                    <span style={{ background: T.hot, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <FireFilled style={{ fontSize: 9 }} /> HOT
                    </span>
                  )}
                  {p.isFeatured && (
                    <span style={{ background: T.featured, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <StarFilled style={{ fontSize: 9 }} /> FEATURED
                    </span>
                  )}
                </div>

                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <StatusBadge status={status} />
                </div>

                <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 6 }}>
                  {p.viewCount > 0 && (
                    <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '3px 9px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <EyeOutlined /> {p.viewCount}
                    </span>
                  )}
                  {allImgs.length > 0 && (
                    <span style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 11, padding: '3px 9px', borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ExpandOutlined /> {allImgs.length} photos
                    </span>
                  )}
                </div>

                {allImgs.length > 1 && (
                  <span style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 11, padding: '3px 9px', borderRadius: 16 }}>
                    {activeImg + 1} / {allImgs.length}
                  </span>
                )}
              </div>

              {allImgs.length > 1 && (
                <div className="pdp-thumb-row">
                  {allImgs.map((img, i) => (
                    <div
                      key={i} className="pdp-thumb"
                      onClick={() => setActiveImg(i)}
                      style={{
                        border: `2px solid ${i === activeImg ? T.primary : 'transparent'}`,
                        opacity: i === activeImg ? 1 : 0.55,
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title + meta row */}
            <SectionCard noPad>
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: T.text, lineHeight: 1.3 }}>
                      {p.propertyName || p.projectName}
                    </h1>
                    {(p.locality || p.area || p.city) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: T.muted, fontSize: 13 }}>
                        <EnvironmentOutlined style={{ fontSize: 12 }} />
                        {[p.locality || p.area, p.city, p.country].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: T.primary }}>{displayPrice}</div>
                    {p.rentalFrequency && (
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>per {p.rentalFrequency}</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                  {p.bedrooms > 0 && (
                    <span style={{ background: T.primaryLt, color: T.primary, fontSize: 12, fontWeight: 600, padding: '4px 11px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <HomeOutlined /> {p.bedrooms} Bed
                    </span>
                  )}
                  {p.bathrooms > 0 && (
                    <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: 12, fontWeight: 600, padding: '4px 11px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <UserOutlined /> {p.bathrooms} Bath
                    </span>
                  )}
                  {areaStr && (
                    <span style={{ background: '#dcfce7', color: '#166534', fontSize: 12, fontWeight: 600, padding: '4px 11px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <ColumnWidthOutlined /> {areaStr}
                    </span>
                  )}
                  {(p.furnishing || p.furnishingStatus) && (
                    <span style={{ background: '#faf5ff', color: '#7e22ce', fontSize: 12, fontWeight: 600, padding: '4px 11px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <AppstoreOutlined /> {(p.furnishing || p.furnishingStatus).replace('_', ' ')}
                    </span>
                  )}
                  {p.createdAt && (
                    <span style={{ background: T.surface, color: T.muted, fontSize: 12, fontWeight: 500, padding: '4px 11px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CalendarOutlined /> {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Description */}
            {(p.description || p.overview) && (
              <SectionCard title="Description">
                <div style={{
                  minHeight: 100,
                  maxHeight: 320,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  paddingRight: 8,
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#c4b5fd transparent',
                }}>
                  <p style={{ color: T.textSoft, fontSize: 14, lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {p.description || p.overview}
                  </p>
                </div>
              </SectionCard>
            )}

            {/* Property Details */}
            <SectionCard title="Property Details" icon={<BuildOutlined />}>
              <div className="pdp-stats">
                {p.bedrooms > 0     && <StatChip icon={<HomeOutlined />}        label="Bedrooms"     value={`${p.bedrooms} Bed`}                            accent={T.primary} />}
                {p.bathrooms > 0    && <StatChip icon={<UserOutlined />}        label="Bathrooms"    value={`${p.bathrooms} Bath`}                          accent="#0ea5e9"   />}
                {areaStr            && <StatChip icon={<ColumnWidthOutlined />} label="Built-Up Area" value={areaStr}                                       accent="#16a34a"   />}
                {(p.furnishing || p.furnishingStatus) && (
                  <StatChip icon={<AppstoreOutlined />} label="Furnishing" value={(p.furnishing || p.furnishingStatus).replace('_', ' ')} accent={T.primary} />
                )}
                {(p.parkingSpaces > 0 || p.parkingAllocation) && (
                  <StatChip icon={<CarOutlined />} label="Parking" value={p.parkingAllocation || `${p.parkingSpaces} spaces`} accent="#d97706" />
                )}
                {p.ownershipType    && <StatChip icon={<SafetyCertificateOutlined />} label="Ownership"  value={p.ownershipType}                            accent="#8b5cf6"   />}
                {(p.unitType || (p.unitTypes?.[0])) && (
                  <StatChip icon={<BuildOutlined />} label="Unit Type" value={Array.isArray(p.unitTypes) ? p.unitTypes.join(', ') : p.unitType}             accent="#06b6d4"   />
                )}
                {(p.numberOfFloors || p.floors) > 0 && (
                  <StatChip icon={<BuildOutlined />} label="Floors" value={p.numberOfFloors || p.floors}                                                    accent={T.primary} />
                )}
                {p.totalUnits > 0   && <StatChip icon={<HomeOutlined />}        label="Total Units"  value={p.totalUnits}                                   accent="#0ea5e9"   />}
                {p.developmentStatus && <StatChip icon={<BuildOutlined />}      label="Dev. Status"  value={p.developmentStatus}                            accent="#7c3aed"   />}
                {p.saleStatus       && <StatChip icon={<CheckCircleFilled />}   label="Sale Status"  value={p.saleStatus}                                   accent={T.success} />}
                {p.serviceCharge    && <StatChip icon={<WalletOutlined />}      label="Service Charge" value={`${p.serviceCharge} AED/sqft/yr`}             accent="#f59e0b"   />}
              </div>

              {/* Construction Progress */}
              {p.constructionProgress != null && (
                <div style={{ marginTop: 16, padding: '14px 16px', background: T.surface, borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, fontWeight: 600, color: T.muted }}>
                    <span>Construction Progress</span>
                    <span style={{ color: T.primary }}>{p.constructionProgress}%</span>
                  </div>
                  <Progress percent={p.constructionProgress} showInfo={false} strokeColor={T.primary} trailColor="#e5e7eb" size="small" />
                </div>
              )}
            </SectionCard>

            {/* Floor Plans & Unit Details */}
            {floorPlans.length > 0 && (
              <SectionCard title="Floor Plans & Unit Types">
                <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  <div className="pdp-table-head">
                    <span style={{ flex: 2 }}>Unit Type</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>Area From</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>Area To</span>
                  </div>
                  {floorPlans.map((fp, i) => (
                    <div
                      key={i} className="pdp-table-row"
                      style={{ background: i % 2 === 0 ? '#fff' : T.surface }}
                    >
                      <span style={{ flex: 2 }}>
                        <Tag color="purple" style={{ borderRadius: 8, fontWeight: 600 }}>{fp.unitType || '—'}</Tag>
                      </span>
                      <span style={{ flex: 1, textAlign: 'right', fontWeight: 600, color: T.text }}>{fp.areaFrom ? `${fp.areaFrom} sqft` : '—'}</span>
                      <span style={{ flex: 1, textAlign: 'right', fontWeight: 600, color: T.text }}>{fp.areaTo   ? `${fp.areaTo} sqft`   : '—'}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Inventory Overview */}
            {inventory.length > 0 && (
              <SectionCard title="Inventory Overview">
                <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  <div className="pdp-table-head">
                    <span style={{ flex: 2 }}>Unit Type</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>Units</span>
                    <span style={{ flex: 2, textAlign: 'right' }}>Starting Area</span>
                  </div>
                  {inventory.map((u, i) => (
                    <div
                      key={i} className="pdp-table-row"
                      style={{ background: i % 2 === 0 ? '#fff' : T.surface }}
                    >
                      <span style={{ flex: 2 }}>
                        <Tag color="geekblue" style={{ borderRadius: 8, fontWeight: 600 }}>{u.unitType || '—'}</Tag>
                      </span>
                      <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, color: T.text }}>{u.numberOfUnits ?? u.count ?? '—'}</span>
                      <span style={{ flex: 2, textAlign: 'right', fontWeight: 600, color: T.text }}>
                        {u.startingSquareFootage || u.sqft ? `${u.startingSquareFootage || u.sqft} sqft` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Buildings / Towers */}
            {buildings.length > 0 && (
              <SectionCard title={`Buildings / Towers (${buildings.length})`} icon={<BuildOutlined />}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {buildings.map((b, i) => (
                    <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                      {b.image && (
                        <img
                          src={b.image} alt={b.title || `Building ${i + 1}`}
                          style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{b.title || `Building ${i + 1}`}</div>
                        {b.description && (
                          <div style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{b.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Amenities */}
            {p.amenities?.length > 0 && (
              <SectionCard title="Amenities">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {p.amenities.map((a, i) => (
                    <span key={i} className="pdp-amenity">{a}</span>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Payment Plan */}
            {stages.length > 0 && (
              <SectionCard title="Payment Plan" icon={<WalletOutlined />}>
                {payPlanFirst?.title && (
                  <div style={{ fontWeight: 700, color: T.text, marginBottom: 12, fontSize: 14 }}>{payPlanFirst.title}</div>
                )}
                {stages.map((s, i) => {
                  const label = s.milestoneTitle || s.label || s.stage?.replace(/_/g, ' ') || `Stage ${i + 1}`;
                  const total = stages.reduce((a, x) => a + (x.percentage || 0), 0);
                  const isLast = i === stages.length - 1;
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', borderRadius: 9, marginBottom: isLast ? 0 : 6,
                        background: i % 2 === 0 ? T.surface : '#fff',
                        border: `1px solid ${T.border}`,
                      }}
                    >
                      <span style={{ fontSize: 13, color: T.text, fontWeight: 600, textTransform: 'capitalize' }}>{label}</span>
                      {s.description && (
                        <span style={{ fontSize: 11, color: T.muted, flex: 1, marginLeft: 10 }}>{s.description}</span>
                      )}
                      <Tag color="purple" style={{ fontWeight: 700, fontSize: 13, margin: 0, marginLeft: 8 }}>{s.percentage}%</Tag>
                    </div>
                  );
                })}
                {(() => {
                  const total = stages.reduce((a, s) => a + (s.percentage || 0), 0);
                  return (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', padding: '10px 14px',
                      marginTop: 8, borderRadius: 9,
                      background: total === 100 ? '#d1fae5' : '#fee2e2',
                      border: `1px solid ${total === 100 ? '#6ee7b7' : '#fca5a5'}`,
                      fontWeight: 700,
                    }}>
                      <span style={{ color: total === 100 ? '#065f46' : '#991b1b' }}>Total</span>
                      <span style={{ color: total === 100 ? '#065f46' : '#991b1b' }}>{total}%{total !== 100 ? ' — does not sum to 100' : ''}</span>
                    </div>
                  );
                })()}
              </SectionCard>
            )}

            {/* YouTube Videos */}
            {youtubeVideos.length > 0 && (
              <SectionCard title="Videos" icon={<VideoCameraOutlined />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {youtubeVideos.map((v, i) => {
                    const embedUrl = v
                      .replace('watch?v=', 'embed/')
                      .replace('youtu.be/', 'www.youtube.com/embed/');
                    return embedUrl.includes('embed/') ? (
                      <iframe
                        key={i} src={embedUrl} width="100%" height="220"
                        style={{ borderRadius: 10, border: 0 }}
                        allowFullScreen title={`Video ${i + 1}`}
                      />
                    ) : (
                      <a key={i} href={v} target="_blank" rel="noreferrer" className="pdp-media-btn"
                        style={{ background: T.hotLt, color: T.hot, border: `1px solid #fecaca` }}>
                        <VideoCameraOutlined /> Video {i + 1}
                      </a>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {/* Rejection reason */}
            {p.rejectionReason && (
              <SectionCard title="Rejection Reason" icon={<WarningOutlined style={{ color: T.danger }} />}>
                <div style={{
                  background: T.dangerLt, border: `1px solid #fecaca`,
                  borderRadius: 10, padding: '12px 16px',
                  color: T.danger, fontSize: 14, fontWeight: 500, lineHeight: 1.6,
                }}>
                  {p.rejectionReason}
                </div>
              </SectionCard>
            )}

            {/* Admin comments (changes requested) */}
            {p.adminComments && (
              <SectionCard title="Admin Comments" icon={<WarningOutlined style={{ color: T.warn }} />}>
                <div style={{
                  background: T.warnLt, border: `1px solid #fde68a`,
                  borderRadius: 10, padding: '12px 16px',
                  color: T.warn, fontSize: 14, fontWeight: 500, lineHeight: 1.6,
                }}>
                  {p.adminComments}
                </div>
              </SectionCard>
            )}
          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div>

            {/* Price hero */}
            <div style={{
              background: `linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%)`,
              borderRadius: 18, padding: 22, color: '#fff',
              marginBottom: 14,
              boxShadow: '0 8px 28px rgba(109,40,217,0.3)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.75, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                Listing Price
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 4 }}>{displayPrice}</div>
              {p.rentalFrequency && <div style={{ fontSize: 11, opacity: 0.7 }}>per {p.rentalFrequency}</div>}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.18)', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {p.commission > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85 }}>
                    <span>Commission</span>
                    <span style={{ fontWeight: 700 }}>{p.commission}%</span>
                  </div>
                )}
                {p.eoiAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85 }}>
                    <span>EOI Amount</span>
                    <span style={{ fontWeight: 700 }}>{fmt(p.eoiAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85 }}>
                  <span>Approval</span>
                  <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{p.approvalStatus}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85 }}>
                  <span>Listing</span>
                  <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{p.listingStatus || '—'}</span>
                </div>
                {p.saleStatus && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85 }}>
                    <span>Sale Status</span>
                    <span style={{ fontWeight: 700 }}>{p.saleStatus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Listing meta */}
            <SectionCard title="Listing Info">
              <InfoRow label="Property ID"   value={<span style={{ fontSize: 11, fontFamily: 'monospace' }}>{p._id}</span>} />
              <InfoRow label="Created"
                value={p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }) : null}
              />
              <InfoRow label="Last Updated"
                value={p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }) : null}
              />
              {completionDisplay && <InfoRow label="Completion" value={completionDisplay} />}
            </SectionCard>

            {/* Location */}
            <SectionCard title="Location" icon={<EnvironmentOutlined />}>
              <InfoRow label="Community / Area" value={p.locality || p.area} />
              <InfoRow label="City"    value={p.city}    />
              <InfoRow label="Country" value={p.country || 'UAE'} />
              {loc.address && <InfoRow label="Address" value={loc.address} />}
              {loc.latitude && loc.longitude && (
                <InfoRow label="Coordinates" value={`${loc.latitude}, ${loc.longitude}`} mono />
              )}
              {(loc.latitude && loc.longitude) && (
                <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', height: 160 }}>
                  <iframe
                    width="100%" height="100%" style={{ border: 0 }}
                    loading="lazy" allowFullScreen
                    src={`https://maps.google.com/maps?q=${loc.latitude},${loc.longitude}&z=15&output=embed`}
                  />
                </div>
              )}
            </SectionCard>

            {/* Developer */}
            {(devDetails.companyName || devDetails.name || p.developerName) && (
              <SectionCard title="Developer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  {(devDetails.logo || devDetails.mainLogo) ? (
                    <img
                      src={devDetails.logo || devDetails.mainLogo} alt="logo"
                      style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover', border: `1px solid ${T.border}` }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ width: 46, height: 46, borderRadius: 10, background: T.primaryLt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: T.primary }}>
                      <BuildOutlined />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>
                      {devDetails.companyName || devDetails.name || p.developerName}
                    </div>
                    {devDetails.accountStatus && (
                      <Tag style={{ marginTop: 3, fontSize: 10, borderRadius: 8, fontWeight: 600 }}
                        color={devDetails.accountStatus === 'active' ? 'green' : 'red'}>
                        {devDetails.accountStatus}
                      </Tag>
                    )}
                  </div>
                </div>
                <InfoRow label="Licence No." value={devDetails.developerLicenseNumber || devDetails.licenseNumber} mono />
                <InfoRow label="Contact"     value={devDetails.primaryContactName || devDetails.contactName} />
                <InfoRow label="Phone"       value={devDetails.phone || devDetails.phone_number} />
                <InfoRow label="Email"       value={devDetails.email} />
              </SectionCard>
            )}

            {/* Compliance */}
            <SectionCard
              title="Compliance"
              icon={<SafetyCertificateOutlined style={{ color: p.trakheesiPermitId && p.qrCode ? T.success : T.warn }} />}
              borderColor={p.trakheesiPermitId && p.qrCode ? T.border : '#f97316'}
            >
              {p.trakheesiPermitId ? (
                <InfoRow label="Trakheesi Permit ID" value={
                  <span style={{ color: T.primary, fontFamily: 'monospace', fontWeight: 700 }}>{p.trakheesiPermitId}</span>
                } />
              ) : (
                <div style={{ fontSize: 12, color: T.warn, padding: '6px 0', borderBottom: `1px solid ${T.border}` }}>
                  Trakheesi Permit ID — not set
                </div>
              )}
              {p.qrCode ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>QR Code</div>
                  <img
                    src={p.qrCode} alt="QR Code"
                    style={{ width: '100%', maxWidth: 160, height: 160, objectFit: 'contain', borderRadius: 10, border: `1px solid ${T.border}`, background: '#fff', padding: 8, display: 'block' }}
                  />
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Hover or scan to verify listing</div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: T.warn, padding: '8px 0 0' }}>
                  QR Code — not uploaded
                </div>
              )}
              {(!p.trakheesiPermitId || !p.qrCode) && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: T.warnLt, borderRadius: 8, fontSize: 12, color: '#92400e', fontWeight: 500 }}>
                  Both fields required before this listing can be approved and published.
                </div>
              )}
            </SectionCard>

            {/* Legal */}
            {(p.reraPermitNumber || p.dldRegistrationNumber) && (
              <SectionCard title="Legal & Permits" icon={<SafetyCertificateOutlined />}>
                <InfoRow label="RERA Permit" value={p.reraPermitNumber}         mono />
                <InfoRow label="DLD Reg. No." value={p.dldRegistrationNumber}   mono />
              </SectionCard>
            )}

            {/* ── UPDATED Documents SECTION ── */}
            {(p.brochure || p.projectPlan || documents.length > 0) && (
              <SectionCard title="Documents" icon={<FilePdfOutlined />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  
                  {/* Legacy Documents Fallback */}
                  {p.brochure && (
                    <a href={p.brochure} target="_blank" rel="noreferrer" className="pdp-media-btn"
                      style={{ background: T.primaryLt, color: T.primary, border: `1px solid #ddd6fe`, margin: 0 }}>
                      <FilePdfOutlined /> Download Brochure (Legacy)
                    </a>
                  )}
                  {p.projectPlan && (
                    <a href={p.projectPlan} target="_blank" rel="noreferrer" className="pdp-media-btn"
                      style={{ background: '#e0f2fe', color: '#0369a1', border: `1px solid #bae6fd`, margin: 0 }}>
                      <FilePdfOutlined /> Download Site Plan (Legacy)
                    </a>
                  )}

                  {/* API Library Documents (from Developers) */}
                  {documents.map((doc) => (
                    <div 
                      key={doc._id} 
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        padding: '10px 12px', background: T.surface, 
                        border: `1px solid ${T.border}`, borderRadius: 10 
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.title}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                          <Tag style={{ margin: 0, fontSize: 10, border: 'none', background: '#e2e8f0', color: T.textSoft, fontWeight: 600 }}>
                            {doc.documentCategory?.replace(/_/g, ' ')}
                          </Tag>
                          {doc.isAgentVisible && (
                            <Tag color="green" style={{ margin: 0, fontSize: 10, border: 'none', fontWeight: 600 }}>Agent Vis.</Tag>
                          )}
                          {doc.isPublic && (
                            <Tag color="blue" style={{ margin: 0, fontSize: 10, border: 'none', fontWeight: 600 }}>Public</Tag>
                          )}
                        </div>
                      </div>
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          width: 32, height: 32, background: '#fff', border: `1px solid ${T.border}`, 
                          borderRadius: 8, color: T.primary, flexShrink: 0, textDecoration: 'none' 
                        }}
                      >
                        <DownloadOutlined />
                      </a>
                    </div>
                  ))}

                </div>
              </SectionCard>
            )}

          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <div style={{ position: 'relative', maxWidth: 900, width: '100%' }} onClick={e => e.stopPropagation()}>
            <img src={allImgs[activeImg]} alt="" />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              {allImgs.map((_, i) => (
                <button
                  key={i} onClick={() => setActiveImg(i)}
                  style={{
                    width: i === activeImg ? 24 : 8, height: 8, border: 'none', cursor: 'pointer',
                    borderRadius: 4, background: i === activeImg ? '#fff' : 'rgba(255,255,255,0.4)',
                    padding: 0, transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setLightbox(false)}
              style={{
                position: 'absolute', top: -14, right: -14,
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff', cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >x</button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        title="Reject Property"
        open={rejectOpen}
        onCancel={() => { setRejectOpen(false); setRejectReason(''); }}
        onOk={doReject}
        okText="Confirm Reject"
        okButtonProps={{ danger: true, loading: actionLoading === 'reject' }}
        cancelText="Cancel"
        styles={{ body: { paddingTop: 12 } }}
      >
        <p style={{ color: T.muted, marginBottom: 12, fontSize: 13, lineHeight: 1.6 }}>
          Provide a reason for rejection. This will be visible to the property owner.
        </p>
        <Input.TextArea
          rows={4}
          placeholder="e.g. Incomplete information, unclear images..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          style={{ borderRadius: 10 }}
        />
      </Modal>
    </>
  );
};

export default PropertyDetailPage;