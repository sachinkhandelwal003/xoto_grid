import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiDollarSign,
  FiEye,
  FiFileText,
  FiGlobe,
  FiMonitor,
  FiSearch,
  FiShare2,
  FiSmartphone,
  FiTarget,
  FiTrash2,
  FiTrendingUp,
  FiUser,
} from 'react-icons/fi';
import { message, Modal, Spin } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const PAGE_SIZE = 10;

const buildTrackingUrl = (token) =>
  `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/presentation/track/${token}`;

const formatDate = (value) => {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('en-AE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatViewTime = (value) => {
  if (!value) return '-';

  return new Date(value).toLocaleString('en-AE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StatCard = ({ label, value, icon, accentClass }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentClass}`}>
        {React.createElement(icon, { size: 18 })}
      </div>
    </div>
  </div>
);

const Chip = ({ icon, label, className }) => (
  <span className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${className}`}>
    {React.createElement(icon, { size: 12, className: 'shrink-0' })}
    <span className="truncate">{label}</span>
  </span>
);

const Metric = ({ label, value, icon, className }) => (
  <div className="min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
      {React.createElement(icon, { size: 13, className })}
      <span>{label}</span>
    </div>
    <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
  </div>
);

const PresentationCard = ({ presentation, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const views = presentation.views || [];
  const totalViews = views.length;
  const mobileViews = views.filter((v) => v.device === 'Mobile').length;
  const desktopViews = views.filter((v) => v.device === 'Desktop').length;
  const trackingUrl = buildTrackingUrl(presentation.trackingToken);
  const previewUrl = `${trackingUrl}?preview=true`;

  const handleCopyTracking = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      message.success('Tracking link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error('Could not copy tracking link');
    }
  };

  const waText = encodeURIComponent(
    `Hi ${presentation.clientNotes?.clientName || 'there'},\n\nPlease find your property presentation here:\n${trackingUrl}\n\nPowered by Xoto GRID`
  );

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <FiFileText size={19} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-950">
                {presentation.title || 'Untitled Presentation'}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                <FiActivity size={12} />
                <span>Created {formatDate(presentation.createdAt)}</span>
              </div>
            </div>
          </div>

          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold ${
            totalViews > 0
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}>
            <FiCheckCircle size={12} />
            {totalViews > 0 ? 'Opened' : 'Not opened'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Views" value={totalViews} icon={FiEye} className="text-violet-600" />
          <Metric label="Mobile" value={mobileViews} icon={FiSmartphone} className="text-sky-600" />
          <Metric label="Desktop" value={desktopViews} icon={FiMonitor} className="text-indigo-600" />
          <Metric label="Score" value={`+${presentation.engagementScore || 0}`} icon={FiTrendingUp} className="text-amber-600" />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {presentation.settings?.language && (
            <Chip icon={FiGlobe} label={presentation.settings.language} className="border-violet-200 bg-violet-50 text-violet-700" />
          )}
          {presentation.settings?.currency && (
            <Chip icon={FiDollarSign} label={presentation.settings.currency} className="border-sky-200 bg-sky-50 text-sky-700" />
          )}
          {presentation.settings?.tone && (
            <Chip icon={FiTarget} label={presentation.settings.tone} className="border-amber-200 bg-amber-50 text-amber-700 capitalize" />
          )}
          {presentation.clientNotes?.clientName && (
            <Chip icon={FiUser} label={presentation.clientNotes.clientName} className="border-emerald-200 bg-emerald-50 text-emerald-700" />
          )}
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            <FiShare2 size={12} />
            Tracked client link
          </label>
          <div className="flex min-w-0 gap-2">
            <input
              readOnly
              value={trackingUrl}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={handleCopyTracking}
              title="Copy link"
              aria-label="Copy tracking link"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                copied
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:text-violet-700'
              }`}
            >
              {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
            </button>
          </div>
        </div>

        {totalViews > 0 && (
          <div className="rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FiActivity size={15} className="shrink-0 text-violet-600" />
                <span className="truncate">View engagement history</span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-slate-500">
                {totalViews}
                <FiChevronDown className={`transition-transform ${expanded ? 'rotate-180' : ''}`} size={15} />
              </span>
            </button>

            {expanded && (
              <div className="max-h-48 space-y-2 overflow-y-auto border-t border-slate-200 p-3">
                {[...views].reverse().map((view, index) => (
                  <div key={`${view.timestamp || 'view'}-${index}`} className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-slate-700">
                      {view.device === 'Mobile' ? <FiSmartphone size={14} /> : <FiMonitor size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">{view.device || 'Unknown device'}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{formatViewTime(view.timestamp)}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                      +15 pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto grid grid-cols-[1fr_1fr_auto] gap-2 border-t border-slate-200 bg-slate-50 p-4">
        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
        >
          <FiShare2 size={14} />
          <span className="truncate">Share</span>
        </a>
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
        >
          <FiEye size={14} />
          <span className="truncate">Preview</span>
        </a>
        <button
          type="button"
          onClick={() => onDelete(presentation)}
          title="Delete presentation"
          aria-label="Delete presentation"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 transition-colors hover:bg-rose-600 hover:text-white"
        >
          <FiTrash2 size={15} />
        </button>
      </div>
    </article>
  );
};

const PresentationsList = () => {
  const navigate = useNavigate();
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPresentations = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/presentation/my?page=${page}&limit=${PAGE_SIZE}`);
      const data = res?.data?.success !== undefined ? res.data : res;
      setPresentations(data?.data || []);
      setPagination({ page, total: data?.pagination?.total || 0 });
    } catch {
      message.error('Failed to load presentations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresentations();
  }, [fetchPresentations]);

  const requestDelete = (presentation) => {
    setDeleteTarget(presentation);
  };

  const closeDeleteModal = () => {
    if (!deleting) setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;

    setDeleting(true);
    try {
      await apiService.delete(`/presentation/${deleteTarget._id}`);
      message.success('Presentation deleted');
      setDeleteTarget(null);
      fetchPresentations(pagination.page);
    } catch {
      message.error('Failed to delete presentation');
    } finally {
      setDeleting(false);
    }
  };

  const totalViews = presentations.reduce((sum, p) => sum + (p.views?.length || 0), 0);
  const totalScore = presentations.reduce((sum, p) => sum + (p.engagementScore || 0), 0);
  const openedCount = presentations.filter((p) => p.views?.length > 0).length;
  const query = search.trim().toLowerCase();

  const filtered = presentations.filter((p) =>
    !query ||
    p.title?.toLowerCase().includes(query) ||
    p.clientNotes?.clientName?.toLowerCase().includes(query)
  );

  return (
    <main className="min-h-screen bg-slate-100 pb-10 font-sans">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100"
            >
              <FiArrowLeft size={17} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-950">AI Presentations</h1>
              <p className="text-xs font-medium text-slate-500">{pagination.total} total presentations</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Generated" value={pagination.total} icon={FiFileText} accentClass="bg-violet-50 text-violet-700" />
          <StatCard label="Opened" value={openedCount} icon={FiCheckCircle} accentClass="bg-emerald-50 text-emerald-700" />
          <StatCard label="Total Views" value={totalViews} icon={FiEye} accentClass="bg-sky-50 text-sky-700" />
          <StatCard label="Engagement" value={`+${totalScore}`} icon={FiBarChart2} accentClass="bg-amber-50 text-amber-700" />
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-md bg-violet-50 px-3 py-2 font-semibold text-violet-800">
              <FiShare2 size={13} />
              Tracked links log client views
            </span>
            <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 font-semibold text-slate-700">
              <FiEye size={13} />
              Preview links do not affect analytics
            </span>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or client"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"
            />
          </div>
        </section>

        {loading ? (
          <section className="flex flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white py-20 shadow-sm">
            <Spin size="large" />
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Loading presentations</p>
          </section>
        ) : filtered.length === 0 ? (
          <section className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <FiFileText size={26} />
            </div>
            <h2 className="mt-4 text-base font-bold text-slate-950">No presentations found</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create a branded property presentation from a lead, then return here to share and track it.
            </p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-800"
            >
              Go to leads
              <FiArrowRight size={15} />
            </button>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filtered.map((presentation) => (
              <PresentationCard key={presentation._id} presentation={presentation} onDelete={requestDelete} />
            ))}
          </section>
        )}

        {pagination.total > PAGE_SIZE && (
          <nav className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              disabled={pagination.page === 1}
              onClick={() => fetchPresentations(pagination.page - 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <FiChevronLeft size={15} />
              Previous
            </button>
            <span className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600">
              Page {pagination.page}
            </span>
            <button
              type="button"
              disabled={pagination.page * PAGE_SIZE >= pagination.total}
              onClick={() => fetchPresentations(pagination.page + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Next
              <FiChevronRight size={15} />
            </button>
          </nav>
        )}
      </div>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete presentation?"
        onCancel={closeDeleteModal}
        footer={null}
        centered
        width={420}
      >
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-600">
            Are you sure you want to delete
            {' '}
            <span className="font-bold text-slate-950">
              {deleteTarget?.title || 'this presentation'}
            </span>
            ? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={deleting}
              onClick={closeDeleteModal}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={confirmDelete}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiTrash2 size={15} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default PresentationsList;
