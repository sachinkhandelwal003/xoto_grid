import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal } from 'antd';
import { FiBell, FiCheck, FiCheckCircle, FiClock, FiFilter, FiRefreshCw, FiX } from 'react-icons/fi';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const PAGE_SIZE = 20;
const EVENT_META = {
  LEAD_ASSIGNED: { label: 'Lead Assigned', color: '#b45309', bg: '#fffbeb' },
  LEAD_CREATED: { label: 'New Lead', color: '#6d28d9', bg: '#f5f3ff' },
  LEAD_STATUS_UPDATED: { label: 'Lead Updated', color: '#047857', bg: '#ecfdf5' },
  PROPOSAL_CREATED: { label: 'Proposal', color: '#2563eb', bg: '#eff6ff' },
};

const getMeta = eventType => EVENT_META[eventType] || {
  label: eventType ? eventType.replace(/_/g, ' ') : 'Notification', color: '#6b7280', bg: '#f3f4f6',
};
const timeAgo = date => {
  if (!date) return 'Just now';
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
};
const formatDate = date => date ? new Date(date).toLocaleString('en-AE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

const NotificationRow = ({ notification, onOpen, onRead }) => {
  const meta = getMeta(notification.eventType);
  return (
    <div className={`flex gap-4 border-b border-gray-100 px-5 py-4 transition-colors hover:bg-violet-50 cursor-pointer ${notification.isRead ? 'bg-white' : 'bg-violet-50/40'}`} onClick={() => onOpen(notification)}>
      <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: meta.bg }}>
        <FiBell size={18} style={{ color: meta.color }} />
        {!notification.isRead && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white" style={{ background: meta.color }} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase tracking-wide" style={{ color: meta.color }}>{meta.label}</span>{!notification.isRead && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: meta.bg, color: meta.color }}>NEW</span>}</div>
            <p className="mt-1 truncate text-sm font-semibold text-gray-900">{notification.title || 'Notification'}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">{notification.message || 'You have a new update.'}</p>
            {notification.createdByName && <p className="mt-2 text-xs text-gray-400">By {notification.createdByName}</p>}
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-2"><span className="text-xs text-gray-400">{timeAgo(notification.createdAt)}</span>{!notification.isRead ? <button type="button" className="flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900" onClick={event => { event.stopPropagation(); onRead(notification._id); }}><FiCheck size={13} /> Mark read</button> : <FiCheckCircle size={15} className="text-emerald-500" />}</div>
        </div>
      </div>
    </div>
  );
};

const GridNotifications = () => {
  const { user } = useSelector(state => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [connected, setConnected] = useState(false);

  const fetchNotifications = useCallback(async (nextPage = 1, activeFilter = filter) => {
    if (!user?.id && !user?._id) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(nextPage), limit: String(PAGE_SIZE) });
      if (activeFilter === 'read') query.set('isRead', 'true');
      if (activeFilter === 'unread') query.set('isRead', 'false');
      let response = await apiService.get(`/grid/notifications?${query.toString()}`).catch(() => null);
      let data = Array.isArray(response?.data) ? response.data : [];
      if (!data.length && nextPage === 1) {
        const fallback = await apiService.get(`/vault/notifications?limit=${PAGE_SIZE}`).catch(() => null);
        if (Array.isArray(fallback?.data)) { response = fallback; data = fallback.data; }
      }
      setNotifications(data); setTotal(response?.total || data.length); setConnected(Boolean(response)); setPage(nextPage);
    } finally { setLoading(false); }
  }, [filter, user?.id, user?._id]);

  useEffect(() => {
    fetchNotifications(1, filter);
    const interval = window.setInterval(() => fetchNotifications(page, filter), 30000);
    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async id => {
    setNotifications(previous => previous.map(item => item._id === id ? { ...item, isRead: true } : item));
    await apiService.put(`/grid/notifications/${id}/read`).catch(() => {});
  };
  const markAllRead = async () => {
    setNotifications(previous => previous.map(item => ({ ...item, isRead: true })));
    await apiService.put('/grid/notifications/read-all').catch(() => {});
  };
  const unreadCount = notifications.filter(item => !item.isRead).length;
  const readCount = Math.max(total - unreadCount, 0);

  return (
    <div className="min-h-screen bg-[#f8f7fb] px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #5C039B, #03A4F4)', boxShadow: '0 6px 18px rgba(92,3,155,.2)' }}><FiBell size={20} className="text-white" /></div><div><h1 className="text-xl font-bold text-gray-900">Notifications</h1><p className="mt-0.5 text-xs text-gray-400">Your latest lead and platform updates · <span className={connected ? 'text-emerald-500' : 'text-gray-400'}>● {connected ? 'live' : 'offline'}</span></p></div></div><div className="flex items-center gap-2">{unreadCount > 0 && <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-lg border border-violet-300 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50"><FiCheckCircle size={14} /> Mark all read</button>}<button onClick={() => fetchNotifications(1, filter)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50" disabled={loading}><FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh</button></div></header>
      <div className="mb-5 grid grid-cols-3 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">{[['Total', total, '#5C039B'], ['Unread', unreadCount, '#ef4444'], ['Read', readCount, '#16a34a']].map(([label, value, color]) => <div key={label} className="text-center"><div className="text-2xl font-extrabold" style={{ color }}>{value}</div><div className="mt-1 text-xs font-medium text-gray-400">{label}</div></div>)}</div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"><div className="flex items-center gap-2 text-xs font-semibold text-gray-400"><FiFilter size={14} /> Filter notifications</div><div className="flex overflow-hidden rounded-lg border border-gray-200">{['all', 'unread', 'read'].map(option => <button key={option} onClick={() => { setFilter(option); fetchNotifications(1, option); }} className="px-4 py-2 text-xs font-semibold capitalize" style={{ background: filter === option ? '#5C039B' : '#fff', color: filter === option ? '#fff' : '#6b7280' }}>{option}</button>)}</div></div>
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">{loading ? <div className="py-20 text-center text-sm text-gray-400"><FiRefreshCw size={22} className="mx-auto mb-3 animate-spin text-violet-600" />Loading notifications...</div> : notifications.length === 0 ? <div className="py-20 text-center"><FiBell size={30} className="mx-auto mb-3 text-gray-300" /><p className="text-sm font-semibold text-gray-500">No notifications yet</p><p className="mt-1 text-xs text-gray-400">New lead assignments will appear here.</p></div> : notifications.map(notification => <NotificationRow key={notification._id} notification={notification} onOpen={setSelected} onRead={markRead} />)}{total > PAGE_SIZE && <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4"><span className="text-xs text-gray-400">Page {page}</span><button onClick={() => fetchNotifications(page + 1, filter)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Load more</button></div>}</section>
    </div><Modal open={Boolean(selected)} onCancel={() => setSelected(null)} footer={null} centered width={560} closeIcon={<FiX />}>{selected && <div className="p-1"><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><FiBell /></div><div><p className="text-xs font-bold uppercase tracking-wider text-violet-700">{getMeta(selected.eventType).label}</p><h2 className="text-lg font-bold text-gray-900">{selected.title}</h2></div></div><div className="rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">{selected.message}</div><div className="mt-4 flex items-center gap-2 text-xs text-gray-400"><FiClock /> {formatDate(selected.createdAt)}</div></div>}</Modal></div>
  );
};

export default GridNotifications;