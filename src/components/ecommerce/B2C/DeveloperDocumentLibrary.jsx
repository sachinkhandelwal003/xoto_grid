// ════════════════════════════════════════════════════════════════════════════
// DeveloperDocumentLibrary.jsx — Developer: Manage documents for own property
// PRD §9.5 — Developer sees & manages only their own property documents
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message, Modal, Switch } from 'antd';
import {
  FiArrowLeft, FiUpload, FiTrash2, FiEdit3, FiFileText,
  FiUsers, FiGlobe, FiSearch, FiPlus, FiFile, FiImage,
  FiRefreshCw, FiX, FiCheck, FiDownload, FiLock,
} from 'react-icons/fi';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

// ─── Theme ────────────────────────────────────────────────────────────────────
const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

const UPLOAD_API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`;

const CATEGORY_LABELS = {
  brochure:           'Brochure',
  floor_plan:         'Floor Plan',
  payment_plan:       'Payment Plan',
  noc:                'NOC',
  title_deed_template:'Title Deed Template',
  developer_profile:  'Developer Profile',
  other:              'Other',
};

const CAT_COLORS = {
  brochure:           { bg: '#ede9fe', text: '#6d28d9' },
  floor_plan:         { bg: '#e0f2fe', text: '#0369a1' },
  payment_plan:       { bg: '#dcfce7', text: '#166534' },
  noc:                { bg: '#fef3c7', text: '#b45309' },
  title_deed_template:{ bg: '#fee2e2', text: '#991b1b' },
  developer_profile:  { bg: '#f3e8ff', text: '#7e22ce' },
  other:              { bg: '#f1f5f9', text: '#475569' },
};

const uploadFile = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(UPLOAD_API, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('File upload failed');
  const data = await res.json();
  return data?.file?.url || data?.url || data?.data?.url || data?.fileUrl || '';
};

const CatPill = ({ cat }) => {
  const c = CAT_COLORS[cat] || CAT_COLORS.other;
  return (
    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.text, fontWeight: 600, display: 'inline-block', whiteSpace: 'nowrap' }}>
      {CATEGORY_LABELS[cat] || cat}
    </span>
  );
};

const VisBadge = ({ active, label, icon: Icon }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
    background: active ? '#dcfce7' : '#f1f5f9',
    color: active ? '#166534' : '#94a3b8',
    border: `1px solid ${active ? '#bbf7d0' : '#e2e8f0'}`,
  }}>
    <Icon size={11} /> {label}
  </span>
);

// ─── Upload Modal ─────────────────────────────────────────────────────────────
const UploadModal = ({ propertyId, onClose, onSuccess }) => {
  const [form, setForm]   = useState({ title: '', documentCategory: '', fileType: 'pdf', isAgentVisible: false, isPublic: false });
  const [file, setFile]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    const ft = ['jpg','jpeg','png','webp','gif'].includes(ext) ? 'image' : ext === 'pdf' ? 'pdf' : 'other';
    setFile(f);
    setForm(p => ({ ...p, fileType: ft }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim())     return message.error('Title required');
    if (!form.documentCategory) return message.error('Category required');
    if (!file)                  return message.error('Please select a file');
    try {
      setUploading(true);
      const fileUrl = await uploadFile(file);
      if (!fileUrl) throw new Error('Could not get file URL');
      await apiService.post('/property-documents', { propertyId, ...form, fileUrl });
      message.success('Document uploaded successfully');
      onSuccess();
    } catch (err) {
      message.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, margin: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
        <div style={{ background: GR, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700 }}>Upload Document</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Add to your property's document library</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <FiX size={18} />
          </button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById('dev-doc-input').click()}
            style={{ border: `2px dashed ${dragOver ? P2 : '#e2e8f0'}`, borderRadius: 12, padding: 24, textAlign: 'center', background: dragOver ? '#f3e8ff' : '#fafafa', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <input id="dev-doc-input" type="file" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: P }}>
                <FiFile size={22} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{file.name}</span>
                <button onClick={e => { e.stopPropagation(); setFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><FiX size={16} /></button>
              </div>
            ) : (
              <div>
                <FiUpload size={28} color={P2} style={{ marginBottom: 8 }} />
                <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Drag & drop or <span style={{ color: P2, fontWeight: 600 }}>browse</span></p>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 12 }}>PDF, images supported</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Document Title *</label>
            <input placeholder="e.g. Payment Plan 2024" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Category *</label>
              <select value={form.documentCategory} onChange={e => setForm(p => ({ ...p, documentCategory: e.target.value }))} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', background: '#fff' }}>
                <option value="">Select…</option>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>File Type</label>
              <select value={form.fileType} onChange={e => setForm(p => ({ ...p, fileType: e.target.value }))} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', background: '#fff' }}>
                <option value="pdf">PDF</option>
                <option value="image">Image</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Visibility */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>Who can see this document?</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiUsers size={16} color={P} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Grid Agents</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Visible in agent property catalogue</p>
                </div>
              </div>
              <Switch checked={form.isAgentVisible} onChange={v => setForm(p => ({ ...p, isAgentVisible: v }))} style={{ background: form.isAgentVisible ? P2 : undefined }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiGlobe size={16} color={P} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Registered Customers</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Visible on public listing page</p>
                </div>
              </div>
              <Switch checked={form.isPublic} onChange={v => setForm(p => ({ ...p, isPublic: v }))} style={{ background: form.isPublic ? P2 : undefined }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={onClose} disabled={uploading} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#374151' }}>Cancel</button>
            <button onClick={handleSubmit} disabled={uploading} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: GR, color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, opacity: uploading ? 0.7 : 1 }}>
              {uploading ? <><FiRefreshCw size={14} /> Uploading…</> : <><FiCheck size={14} /> Upload</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ doc, onClose, onSuccess }) => {
  const [form, setForm]   = useState({ title: doc.title, documentCategory: doc.documentCategory, isAgentVisible: doc.isAgentVisible, isPublic: doc.isPublic });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) return message.error('Title required');
    try {
      setSaving(true);
      await apiService.patch(`/property-documents/${doc._id}`, form);
      message.success('Document updated');
      onSuccess();
    } catch (err) {
      message.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, margin: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
        <div style={{ background: GR, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700 }}>Edit Document</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <FiX size={18} />
          </button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Title</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Category</label>
            <select value={form.documentCategory} onChange={e => setForm(p => ({ ...p, documentCategory: e.target.value }))} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', background: '#fff' }}>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiUsers size={15} color={P} /><span style={{ fontSize: 13, fontWeight: 600 }}>Agent Visible</span></div>
              <Switch checked={form.isAgentVisible} onChange={v => setForm(p => ({ ...p, isAgentVisible: v }))} style={{ background: form.isAgentVisible ? P2 : undefined }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiGlobe size={15} color={P} /><span style={{ fontSize: 13, fontWeight: 600 }}>Public</span></div>
              <Switch checked={form.isPublic} onChange={v => setForm(p => ({ ...p, isPublic: v }))} style={{ background: form.isPublic ? P2 : undefined }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={onClose} disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#374151' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: GR, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
              {saving ? <><FiRefreshCw size={14} /> Saving…</> : <><FiCheck size={14} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DeveloperDocumentLibrary() {
  const { id: propertyId } = useParams();
  const navigate           = useNavigate();

  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [editDoc, setEditDoc]   = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    if (!propertyId) return;
    try {
      setLoading(true);
      const res = await apiService.get(`/property-documents/${propertyId}`);
      setDocs(res?.data || []);
    } catch (err) {
      message.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (docId) => {
    Modal.confirm({
      title: 'Delete Document',
      content: 'Are you sure you want to remove this document?',
      okText: 'Delete', okType: 'danger',
      onOk: async () => {
        try {
          setDeletingId(docId);
          await apiService.delete(`/property-documents/${docId}`);
          message.success('Document removed');
          load();
        } catch (err) {
          message.error('Delete failed');
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const filtered = docs.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === 'all' || d.documentCategory === catFilter;
    return matchSearch && matchCat;
  });

  // Category breakdown for sidebar
  const catCounts = docs.reduce((acc, d) => {
    acc[d.documentCategory] = (acc[d.documentCategory] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
          <FiArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1e293b' }}>Document Library</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Manage and control visibility of your property documents</p>
        </div>
        <button onClick={() => setShowUpload(true)} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: GR, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiPlus size={16} /> Add Document
        </button>
      </div>

      {/* Info Banner */}
      <div style={{ background: '#f3e8ff', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 24, border: '1px solid #ede9fe' }}>
        <FiLock size={18} color={P} style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: P }}>Visibility Control</p>
          <p style={{ margin: 0, fontSize: 12, color: '#7e22ce', lineHeight: 1.5 }}>
            <strong>Agent Visible</strong> → Grid agents see this in the property catalogue. &nbsp;
            <strong>Public</strong> → Registered customers see this on the listing page. Documents with neither flag are private (admin & developer only).
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Sidebar — category breakdown */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categories</p>
            </div>
            <div style={{ padding: '8px 0' }}>
              <button onClick={() => setCatFilter('all')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', border: 'none', background: catFilter === 'all' ? '#f3e8ff' : 'transparent', cursor: 'pointer', borderLeft: catFilter === 'all' ? `3px solid ${P}` : '3px solid transparent' }}>
                <span style={{ fontSize: 13, fontWeight: catFilter === 'all' ? 700 : 500, color: catFilter === 'all' ? P : '#374151' }}>All</span>
                <span style={{ fontSize: 12, background: '#f1f5f9', color: '#64748b', borderRadius: 10, padding: '1px 7px', fontWeight: 600 }}>{docs.length}</span>
              </button>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => {
                const count = catCounts[v] || 0;
                if (count === 0) return null;
                return (
                  <button key={v} onClick={() => setCatFilter(v)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', border: 'none', background: catFilter === v ? '#f3e8ff' : 'transparent', cursor: 'pointer', borderLeft: catFilter === v ? `3px solid ${P}` : '3px solid transparent' }}>
                    <span style={{ fontSize: 13, fontWeight: catFilter === v ? 700 : 500, color: catFilter === v ? P : '#374151', textAlign: 'left' }}>{l}</span>
                    <span style={{ fontSize: 12, background: '#f1f5f9', color: '#64748b', borderRadius: 10, padding: '1px 7px', fontWeight: 600 }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1 }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <FiSearch size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              placeholder="Search documents…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 40, padding: '11px 14px 11px 40px', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          {/* List */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ textAlign: 'center' }}>
                <FiRefreshCw size={32} color={P2} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                <p style={{ color: '#64748b', fontSize: 14 }}>Loading documents…</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9' }}>
              <FiFileText size={48} color="#e2e8f0" style={{ marginBottom: 16 }} />
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#94a3b8' }}>
                {docs.length === 0 ? 'No documents yet' : 'No documents match your filter'}
              </p>
              {docs.length === 0 && (
                <button onClick={() => setShowUpload(true)} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 10, border: 'none', background: GR, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <FiPlus size={16} /> Upload First Document
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(doc => (
                <div key={doc._id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {doc.fileType === 'image' ? <FiImage size={20} color={P} /> : <FiFileText size={20} color={P} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, alignItems: 'center' }}>
                      <CatPill cat={doc.documentCategory} />
                      <VisBadge active={doc.isAgentVisible} label="Agents" icon={FiUsers} />
                      <VisBadge active={doc.isPublic} label="Public" icon={FiGlobe} />
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{new Date(doc.createdAt).toLocaleDateString()}</p>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', textDecoration: 'none' }} title="Download">
                      <FiDownload size={15} />
                    </a>
                    <button onClick={() => setEditDoc(doc)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: P }} title="Edit">
                      <FiEdit3 size={15} />
                    </button>
                    <button onClick={() => handleDelete(doc._id)} disabled={deletingId === doc._id} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }} title="Delete">
                      {deletingId === doc._id ? <FiRefreshCw size={15} /> : <FiTrash2 size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showUpload && <UploadModal propertyId={propertyId} onClose={() => setShowUpload(false)} onSuccess={() => { setShowUpload(false); load(); }} />}
      {editDoc && <EditModal doc={editDoc} onClose={() => setEditDoc(null)} onSuccess={() => { setEditDoc(null); load(); }} />}
    </div>
  );
}
