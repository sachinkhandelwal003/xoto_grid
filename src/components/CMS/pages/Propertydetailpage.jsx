import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { Button, Spin, Tag, Popconfirm, message, Modal, Input } from 'antd';
import {
  ArrowLeftOutlined, FireFilled, StarFilled, EnvironmentOutlined,
  CheckCircleFilled, ClockCircleFilled, CloseCircleFilled,
  EyeOutlined, HomeOutlined, UserOutlined, ColumnWidthOutlined,
  DeleteOutlined, PhoneOutlined, MailOutlined, CarOutlined,
  CheckOutlined, CloseOutlined, WarningOutlined, BuildOutlined,
  FilePdfOutlined, VideoCameraOutlined, ExpandOutlined, BankOutlined,     
  AppstoreOutlined,    
  StarOutlined,        
  PictureOutlined, CalendarOutlined
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
    approved: { bg: T.successLt, text: T.success, icon: <CheckCircleFilled />, label: 'Live' },
    pending:  { bg: T.warnLt,    text: T.warn,    icon: <ClockCircleFilled />, label: 'Pending' },
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
    padding: '9px 0', borderBottom: `1px solid ${T.border}`,
    gap: 12,
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

const Card = ({ title, icon, children, noPad }) => (
  <div style={{
    background: T.card, borderRadius: 16,
    border: `1px solid ${T.border}`,
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
  const { id } = useParams();
  const navigate = useNavigate();

  const [property,      setProperty]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [activeImg,     setActiveImg]     = useState(0);
  const [lightbox,      setLightbox]      = useState(false);
  const [rejectOpen,    setRejectOpen]    = useState(false);
  const [rejectReason,  setRejectReason]  = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/properties/${id}`);
      setProperty(res?.data || res);
    } catch { message.error('Failed to load property'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProperty(); }, [id]);

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

  const {
    propertyName, area, city, country, propertySubType,
    approvalStatus, listingStatus, isFeatured, isHot,
    price, price_min, price_max,
    bedrooms, bathrooms, builtUpArea, builtUpArea_min, builtUpArea_max, builtUpAreaUnit,
    mainLogo, photos, videoUrl, brochure,
    description, amenities,
    developer,
    viewCount, unitType, furnishing, parkingSpaces,
    hasView, viewType, ownershipType,
    totalUnits, completionDate, projectStatus, floors, readinessProgress,
    paymentPlan, eoiAmount, commission, rentalFrequency,
    reraPermitNumber, dldRegistrationNumber,
    createdAt, rejectionReason,
  } = property;

  const status = listingStatus === 'active' ? 'approved'
               : approvalStatus === 'pending' ? 'pending'
               : approvalStatus === 'rejected' ? 'rejected'
               : 'inactive';

  const tc = typeColors[propertySubType] || typeColors.off_plan;

  const allImgs = [
    ...(mainLogo ? [mainLogo] : []),
    ...(photos?.architecture || []),
    ...(photos?.interior || []),
    ...(photos?.lobby || []),
    ...(photos?.other || []),
  ].filter(Boolean);

  const displayPrice = price_min && price_max && price_min !== price_max
    ? `${fmt(price_min)} – ${fmt(price_max)}`
    : fmt(price || price_min);

  const areaStr = builtUpArea_min && builtUpArea_max && builtUpArea_min !== builtUpArea_max
    ? `${builtUpArea_min?.toLocaleString()} – ${builtUpArea_max?.toLocaleString()} ${builtUpAreaUnit || 'sqft'}`
    : builtUpArea ? `${builtUpArea?.toLocaleString()} ${builtUpAreaUnit || 'sqft'}` : null;

  // Actions
  const act = (key, fn) => async () => {
    setActionLoading(key);
    try { await fn(); fetchProperty(); }
    catch (e) { message.error(e?.response?.data?.message || 'Action failed'); }
    finally { setActionLoading(''); }
  };

  const doApprove = act('approve', async () => {
    await apiService.put(`/properties/${id}/approve`);
    message.success('Property approved and live!');
  });

  const doReject = async () => {
    if (!rejectReason.trim()) return message.warning('Please enter rejection reason');
    setActionLoading('reject');
    try {
      await apiService.put(`/properties/${id}/reject`, { rejectionReason: rejectReason });
      message.success('Property rejected');
      setRejectOpen(false); setRejectReason('');
      fetchProperty();
    } catch (e) { message.error(e?.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const doToggleHot = act('hot', async () => {
    const res = await apiService.put(`/properties/${id}/hot`);
    message.success(res?.message || 'Hot status updated');
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
  .pdp-root { 
    background: ${T.bg}; 
    min-height: 100vh; 
    padding: 16px;
    min-width: 0;
    overflow-x: hidden;
    box-sizing: border-box;
    width: 100%;
  }
  .pdp-topbar { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    margin-bottom: 18px; 
    gap: 10px; 
    flex-wrap: wrap;
    width: 100%;
  }
  .pdp-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .pdp-layout { 
    display: grid; 
    grid-template-columns: 1fr 340px; 
    gap: 18px; 
    align-items: start;
    min-width: 0;
  }
  .pdp-layout > div { min-width: 0; }
  .pdp-thumb-row { display: flex; gap: 7px; padding: 10px 14px; overflow-x: auto; background: ${T.surface}; border-top: 1px solid ${T.border}; }
  .pdp-thumb { width: 64px; height: 46px; border-radius: 8px; overflow: hidden; cursor: pointer; flex-shrink: 0; transition: opacity 0.15s, border 0.15s; }
  .pdp-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
  .pdp-amenity { background: ${T.primaryLt}; color: ${T.primary}; border: 1px solid #ddd6fe; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px; }
  .pdp-pp-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; background: ${T.surface}; border-radius: 9px; border: 1px solid ${T.border}; margin-bottom: 6px; }
  .pdp-media-btn { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none; margin-bottom: 8px; transition: opacity 0.15s; }
  .pdp-media-btn:hover { opacity: 0.8; }
  .lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .lightbox img { max-width: 100%; max-height: 90vh; border-radius: 12px; object-fit: contain; }
  @media (max-width: 900px) {
    .pdp-layout { grid-template-columns: 1fr; }
    .pdp-root { padding: 12px; }
  }
  @media (max-width: 600px) {
    .pdp-topbar { flex-direction: column; align-items: flex-start; }
    .pdp-actions { width: 100%; }
    .pdp-stats { grid-template-columns: repeat(2, 1fr); }
  }
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
            {approvalStatus === 'pending' && (
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

            {/* {listingStatus === 'active' && (
              <Button
                icon={<CloseCircleFilled />}
                loading={actionLoading === 'toggle'}
                onClick={doToggleStatus}
                style={{ borderRadius: 9, fontWeight: 600, borderColor: T.muted, color: T.muted }}
              >
                Deactivate
              </Button>
            )} */}

            {listingStatus === 'inactive' && (
              <Button
                icon={<CheckCircleFilled />}
                loading={actionLoading === 'toggle'}
                onClick={doToggleStatus}
                style={{ borderRadius: 9, fontWeight: 600, borderColor: T.success, color: T.success }}
              >
                Activate
              </Button>
            )}

            <Button
              icon={<FireFilled />}
              loading={actionLoading === 'hot'}
              onClick={doToggleHot}
              style={{
                borderRadius: 9, fontWeight: 600,
                background: isHot ? T.hotLt : 'transparent',
                borderColor: isHot ? T.hot : T.border,
                color: isHot ? T.hot : T.muted,
              }}
            >
              {isHot ? '🔥 Hot' : 'Mark Hot'}
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

          {/* ── LEFT ── */}
          <div>

            {/* Gallery */}
            <div style={{
              background: T.card, borderRadius: 18,
              border: `1px solid ${T.border}`, marginBottom: 14,
              overflow: 'hidden',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            }}>
              {/* Main image */}
              <div style={{ position: 'relative', height: 360, background: T.surface, cursor: allImgs.length ? 'zoom-in' : 'default' }}
                onClick={() => allImgs.length && setLightbox(true)}>
                {allImgs.length > 0 ? (
                  <img
                    src={allImgs[activeImg]} alt={propertyName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd', fontSize: 48 }}>
                    🏢
                  </div>
                )}

                {/* Overlay: top-left badges */}
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: tc.bg, color: tc.text, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
                    {typeLabels[propertySubType] || propertySubType}
                  </span>
                  {isHot && (
                    <span style={{ background: T.hot, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <FireFilled style={{ fontSize: 9 }} /> HOT
                    </span>
                  )}
                  {isFeatured && (
                    <span style={{ background: T.featured, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <StarFilled style={{ fontSize: 9 }} /> FEATURED
                    </span>
                  )}
                </div>

                {/* Top-right: status */}
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <StatusBadge status={status} />
                </div>

                {/* Bottom-right: views + expand */}
                <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 6 }}>
                  {viewCount > 0 && (
                    <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '3px 9px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <EyeOutlined /> {viewCount}
                    </span>
                  )}
                  {allImgs.length > 0 && (
                    <span style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 11, padding: '3px 9px', borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ExpandOutlined /> {allImgs.length} photos
                    </span>
                  )}
                </div>

                {/* Bottom-left: image counter */}
                {allImgs.length > 1 && (
                  <span style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 11, padding: '3px 9px', borderRadius: 16 }}>
                    {activeImg + 1} / {allImgs.length}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {allImgs.length > 1 && (
                <div className="pdp-thumb-row">
                  {allImgs.map((img, i) => (
                    <div
                      key={i}
                      className="pdp-thumb"
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
            <Card noPad>
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: T.text, lineHeight: 1.3 }}>
                      {propertyName}
                    </h1>
                    {(area || city) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: T.muted, fontSize: 13 }}>
                        <EnvironmentOutlined style={{ fontSize: 12 }} />
                        {[area, city, country].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: T.primary }}>{displayPrice}</div>
                    {rentalFrequency && (
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>per {rentalFrequency}</div>
                    )}
                  </div>
                </div>

                {/* Quick stat pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                  {bedrooms > 0 && (
                  <span style={{ background: T.primaryLt, color: T.primary, fontSize: 12, fontWeight: 600, padding: '4px 11px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
  <HomeOutlined /> {bedrooms} Bed
</span>
                  )}
                  {bathrooms > 0 && (
             <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: 12, fontWeight: 600, padding: '4px 11px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
  <UserOutlined /> {bathrooms} Bath
</span>
                  )}
                  {areaStr && (
                 <span style={{ background: '#dcfce7', color: '#166534', fontSize: 12, fontWeight: 600, padding: '4px 11px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
  <ColumnWidthOutlined /> {areaStr}
</span>
                  )}
                  {furnishing && (
                <span style={{ background: '#faf5ff', color: '#7e22ce', fontSize: 12, fontWeight: 600, padding: '4px 11px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
  <AppstoreOutlined /> {furnishing.replace('_', ' ')}
</span>
                  )}
                  {createdAt && (
                  <span style={{ background: T.surface, color: T.muted, fontSize: 12, fontWeight: 500, padding: '4px 11px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
  <CalendarOutlined /> {new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
</span>
                  )}
                </div>
              </div>
            </Card>

            {/* Description */}
            {description && (
              <Card title="Description">
                <p style={{ color: T.textSoft, fontSize: 14, lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {description}
                </p>
              </Card>
            )}

            {/* Property Details grid */}
            <Card title="Property Details" icon={<BuildOutlined />}>
              <div className="pdp-stats">
                {bedrooms > 0   && <StatChip icon="🛏"         label="Bedrooms"     value={`${bedrooms} Bed`}          accent={T.primary}  />}
                {bathrooms > 0  && <StatChip icon="🚿"         label="Bathrooms"    value={`${bathrooms} Bath`}        accent="#0ea5e9"    />}
                {areaStr        && <StatChip icon={<ColumnWidthOutlined />} label="Built-Up Area" value={areaStr}      accent="#16a34a"    />}
                {furnishing     && <StatChip icon="🛋"         label="Furnishing"   value={furnishing.replace('_',' ')} accent={T.primary} />}
                {parkingSpaces > 0 && <StatChip icon={<CarOutlined />} label="Parking" value={`${parkingSpaces} spaces`} accent="#d97706" />}
                {ownershipType  && <StatChip icon="📋"         label="Ownership"    value={ownershipType}              accent="#8b5cf6"    />}
                {unitType       && <StatChip icon={<BuildOutlined />}  label="Unit Type"    value={unitType}           accent="#06b6d4"    />}
                {floors > 0     && <StatChip icon="🏢"         label="Floors"       value={floors}                    accent={T.primary}  />}
                {hasView        && <StatChip icon="🌅"         label="View"         value={viewType?.join(', ') || 'Yes'} accent="#f59e0b" />}
                {totalUnits > 0 && <StatChip icon="🏘"         label="Total Units"  value={totalUnits}                accent="#0ea5e9"    />}
              </div>
            </Card>

            {/* Amenities */}
            {amenities?.length > 0 && (
              <Card title="Amenities">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {amenities.map((a, i) => (
                    <span key={i} className="pdp-amenity">{a}</span>
                  ))}
                </div>
              </Card>
            )}

            {/* Payment Plan */}
            {paymentPlan?.length > 0 && (
              <Card title="Payment Plan" icon="💳">
                {paymentPlan.map((p, i) => (
                  <div key={i} className="pdp-pp-row">
                    <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>
                      {p.milestone || p.label || `Installment ${i + 1}`}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.primary }}>
                      {p.percentage || p.percent || p.amount}%
                    </span>
                  </div>
                ))}
              </Card>
            )}

            {/* Rejection reason */}
            {rejectionReason && (
              <Card title="Rejection Reason" icon={<WarningOutlined style={{ color: T.danger }} />}>
                <div style={{
                  background: T.dangerLt, border: `1px solid #fecaca`,
                  borderRadius: 10, padding: '12px 16px',
                  color: T.danger, fontSize: 14, fontWeight: 500, lineHeight: 1.6,
                }}>
                  {rejectionReason}
                </div>
              </Card>
            )}
          </div>

          {/* ── RIGHT ── */}
          <div>

            {/* Price card */}
            <div style={{
              background: `linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%)`,
              borderRadius: 18, padding: 22, color: '#fff',
              marginBottom: 14,
              boxShadow: '0 8px 28px rgba(109,40,217,0.3)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.75, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                Listing Price
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.2, marginBottom: 4 }}>
                {displayPrice}
              </div>
              {rentalFrequency && (
                <div style={{ fontSize: 11, opacity: 0.7 }}>per {rentalFrequency}</div>
              )}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.18)', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {commission > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85 }}>
                    <span>Commission</span>
                    <span style={{ fontWeight: 700 }}>{commission}%</span>
                  </div>
                )}
                {eoiAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85 }}>
                    <span>EOI Amount</span>
                    <span style={{ fontWeight: 700 }}>{fmt(eoiAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85 }}>
                  <span>Status</span>
                  <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{listingStatus}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <Card title="Location" icon={<EnvironmentOutlined />}>
              <InfoRow label="Area"    value={area}    />
              <InfoRow label="City"    value={city}    />
              <InfoRow label="Country" value={country} />
            </Card>

            {/* Developer */}
            {developer && (
              <Card title="Developer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  {developer.logo ? (
                    <img
                      src={developer.logo} alt={developer.name}
                      style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover', border: `1px solid ${T.border}` }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{
                      width: 46, height: 46, borderRadius: 10,
                      background: T.primaryLt, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    }}>🏗️</div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>{developer.name}</div>
                    <Tag
                      style={{ marginTop: 3, fontSize: 10, borderRadius: 8, fontWeight: 600 }}
                      color={developer.accountStatus === 'active' ? 'green' : 'red'}
                    >
                      {developer.accountStatus}
                    </Tag>
                  </div>
                </div>
                {developer.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: T.muted, marginBottom: 6 }}>
                    <MailOutlined /> {developer.email}
                  </div>
                )}
                {developer.phone_number && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: T.muted }}>
                    <PhoneOutlined /> {developer.phone_number}
                  </div>
                )}
              </Card>
            )}

            {/* Off-plan info */}
            {propertySubType === 'off_plan' && (
              <Card title="Project Info" icon="🏗️">
                <InfoRow label="Project Status"    value={projectStatus?.replace('_', ' ')} />
                <InfoRow label="Readiness"         value={readinessProgress} />
                <InfoRow label="Total Units"       value={totalUnits} />
                <InfoRow label="Completion Year"   value={completionDate?.year} />
                <InfoRow label="Completion Quarter" value={completionDate?.quarter} />
                <InfoRow label="EOI Amount"        value={eoiAmount ? fmt(eoiAmount) : null} />
              </Card>
            )}

            {/* Legal */}
            {(reraPermitNumber || dldRegistrationNumber) && (
              <Card title="Legal & Permits" icon="📋">
                <InfoRow label="RERA Permit" value={reraPermitNumber} mono />
                <InfoRow label="DLD Number"  value={dldRegistrationNumber} mono />
              </Card>
            )}

            {/* Media */}
            {(brochure || videoUrl) && (
              <Card title="Media" icon="📎">
                {brochure && (
                  <a href={brochure} target="_blank" rel="noreferrer" className="pdp-media-btn"
                    style={{ background: T.primaryLt, color: T.primary, border: `1px solid #ddd6fe` }}>
                    <FilePdfOutlined /> Download Brochure
                  </a>
                )}
                {videoUrl && (
                  <a href={videoUrl} target="_blank" rel="noreferrer" className="pdp-media-btn"
                    style={{ background: T.hotLt, color: T.hot, border: `1px solid #fecaca` }}>
                    <VideoCameraOutlined /> Watch Video
                  </a>
                )}
              </Card>
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
                  key={i}
                  onClick={() => setActiveImg(i)}
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
            >✕</button>
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