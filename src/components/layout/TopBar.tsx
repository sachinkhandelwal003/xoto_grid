import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiChevronDown, FiUser, FiLogOut, FiSettings, FiBell } from 'react-icons/fi';
import { Dropdown, Badge, Card, List, Avatar, Typography, Button, Empty } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { RootState, AppDispatch } from '../../store/store';
import { GRID_ROLE_SLUG_MAP } from '../../types/auth';
import { logoutUser } from '../../store/authSlice';
import { apiService } from '../../manageApi/utils/custom.apiservice';

const { Text } = Typography;

interface TopBarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleMobile: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ collapsed, onToggleCollapse, onToggleMobile }) => {
  const { user } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const roleCode = user?.role
    ? typeof user.role === 'object' ? String(user.role.code) : String(user.role)
    : '1';

  const slug = GRID_ROLE_SLUG_MAP[roleCode] ?? 'admin';
  const displayName = typeof user?.role === 'object' ? user.role.name : slug.replace(/-/g, ' ');
  const initials = (user?.name || displayName).charAt(0).toUpperCase();

  // ── Notification state ──────────────────────────────────────────
  const [notifOpen, setNotifOpen]         = useState(false);
const [notifications, setNotifications] = useState<any[]>([]);
const [selectedNotif, setSelectedNotif] = useState<any>(null);
const [modalOpen, setModalOpen]         = useState(false);
const lastCountRef = useRef(0);

  // ── Fetch notifications from correct endpoint ───────────────────
  const fetchNotifications = async () => {
    try {
      const res = await apiService.get(`/grid/notifications?page=1&limit=20`);
      if (res?.success && Array.isArray(res.data)) {
        setNotifications(res.data);
        lastCountRef.current = res.data.length;
      }
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  };

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // ── Mark single notification as read ───────────────────────────
const openNotifModal = (item: any) => {
  setSelectedNotif(item);
  setModalOpen(true);
  setNotifOpen(false);
  if (!item.isRead) markOneRead(item._id);
};

const markOneRead = async (id: string) => {
  try {
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
    try {
      await apiService.put(`/grid/notifications/${id}/read`);
    } catch {
      // silent
    }
  } catch (err) {
    console.error('Mark read error:', err);
  }
};
  // ── Mark all notifications as read ─────────────────────────────
  const markAllRead = async () => {
    try {
      await apiService.put(`/grid/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ── Notification dropdown panel ─────────────────────────────────
  const notificationDropdown = (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#000', fontWeight: 600 }}>
            Notifications
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge count={unreadCount} size="small" />
            {/* ✅ Mark all read button */}
            {unreadCount > 0 && (
              <Button
                type="link"
                size="small"
                onClick={markAllRead}
                style={{ color: '#5c039b', padding: 0, fontSize: 11, height: 'auto' }}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
      }
      style={{ width: 340 }}
      bodyStyle={{ padding: 0, backgroundColor: '#fff' }}
      className="shadow-lg"
    >
      <div style={{ maxHeight: 380, overflowY: 'auto', backgroundColor: '#fff' }}>
        {notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: '#666' }}>No notifications</span>}
            style={{ padding: '24px 0' }}
          />
        ) : (
          <List
            dataSource={notifications.slice(0, 10)}
            renderItem={(item: any) => (
              <List.Item
                // ✅ Click to mark as read
              onClick={() => openNotifModal(item)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  backgroundColor: item.isRead ? '#fff' : '#f5f3ff',
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => {
                  if (!item.isRead) (e.currentTarget as HTMLElement).style.backgroundColor = '#ede9fe';
                }}
                onMouseLeave={e => {
                  if (!item.isRead) (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f3ff';
                  else (e.currentTarget as HTMLElement).style.backgroundColor = '#fff';
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<FiBell />}
                      style={{
                        backgroundColor: item.isRead ? '#f3f4f6' : '#ede9fe',
                        color: item.isRead ? '#6b7280' : '#5c039b',
                      }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ fontSize: 13, color: '#111827' }}>
                        {item.title}
                      </Text>
                      {/* ✅ Unread dot */}
                      {!item.isRead && (
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: '#5c039b', flexShrink: 0,
                        }} />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Text style={{ fontSize: 12, color: '#6b7280', display: 'block' }}>
                        {item.message}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 2, display: 'block' }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* ✅ View all button */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
        <Button
          type="link"
          size="small"
          onClick={() => {
  setNotifOpen(false);
  navigate(`/dashboard/${slug}/gridnotification`);
}}
          style={{ color: '#5c039b', fontWeight: 500 }}
        >
          View all notifications
        </Button>
      </div>
    </Card>
  );

  // ── User menu ───────────────────────────────────────────────────
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div className="flex items-center gap-2 py-0.5">
          <FiUser size={14} />
          <span>My Profile</span>
        </div>
      ),
      onClick: () => navigate(`/dashboard/${slug}/profile`),
    },
    {
      key: 'settings',
      label: (
        <div className="flex items-center gap-2 py-0.5">
          <FiSettings size={14} />
          <span>Settings</span>
        </div>
      ),
      onClick: () => navigate(`/dashboard/${slug}/profile`),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: (
        <div className="flex items-center gap-2 py-0.5 text-red-500">
          <FiLogOut size={14} />
          <span>Logout</span>
        </div>
      ),
      danger: true,
      onClick: async () => {
        await dispatch(logoutUser(undefined));
        navigate('/login', { replace: true });
      },
    },
  ];

  return (
    <header
      className={`
        fixed top-0 right-0 z-40 h-16
        bg-white border-b border-gray-100
        transition-all duration-300
        ${collapsed ? 'lg:left-[72px]' : 'lg:left-72'}
        left-0
      `}
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="h-full flex items-center justify-between px-4 lg:px-6">

        {/* ── Left: Hamburger + Branding ── */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleMobile}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <FiMenu size={20} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <FiMenu size={20} />
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-gray-200" />

          {/* Brand badge */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 30, height: 30,
                background: 'linear-gradient(135deg, #5C039B, #03A4F4)',
                boxShadow: '0 2px 8px rgba(92,3,155,0.3)',
              }}
            >
              <i className="fas fa-shield-alt text-white" style={{ fontSize: 12 }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1 }}>Xoto Grid</div>
              <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'capitalize', marginTop: 1 }}>
                {displayName} Portal
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Notifications + User ── */}
        <div className="flex items-center gap-4">

          {/* ── Notification Detail Modal ── */}
          {modalOpen && selectedNotif && (
            <div
              onClick={() => setModalOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
              }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  background: '#fff', borderRadius: 20,
                  width: '100%', maxWidth: 480,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #5c039b, #7c3aed)',
                  padding: '20px 24px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FiBell size={18} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Notification
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>
                        {selectedNotif.title}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{
                      background: 'rgba(255,255,255,0.15)', border: 'none',
                      borderRadius: '50%', width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff', fontSize: 18,
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Body */}
                <div style={{ padding: 24 }}>
                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {selectedNotif.type && (
                      <span style={{
                        background: '#f3e8ff', color: '#5c039b',
                        fontSize: 11, fontWeight: 700, padding: '3px 10px',
                        borderRadius: 20, border: '1px solid #e9d5ff',
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {selectedNotif.type.replace(/_/g, ' ')}
                      </span>
                    )}
                    {selectedNotif.role && (
                      <span style={{
                        background: '#ecfdf5', color: '#059669',
                        fontSize: 11, fontWeight: 700, padding: '3px 10px',
                        borderRadius: 20, border: '1px solid #a7f3d0',
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {selectedNotif.role}
                      </span>
                    )}
                    <span style={{
                      background: selectedNotif.isRead ? '#f3f4f6' : '#fef3c7',
                      color: selectedNotif.isRead ? '#6b7280' : '#d97706',
                      fontSize: 11, fontWeight: 700, padding: '3px 10px',
                      borderRadius: 20,
                      border: `1px solid ${selectedNotif.isRead ? '#e5e7eb' : '#fde68a'}`,
                    }}>
                      {selectedNotif.isRead ? '✓ Read' : '● Unread'}
                    </span>
                  </div>

                  {/* Message box */}
                  <div style={{
                    background: '#fafafa', borderRadius: 12,
                    padding: 16, marginBottom: 16,
                    border: '1px solid #f0f0f0',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                      Message
                    </div>
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>
                      {selectedNotif.message}
                    </p>
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ClockCircleOutlined />
                      {new Date(selectedNotif.createdAt).toLocaleString()}
                    </div>
                    {selectedNotif.createdBy && (
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        👤 By: {selectedNotif.createdBy}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  padding: '16px 24px', borderTop: '1px solid #f0f0f0',
                  display: 'flex', justifyContent: 'flex-end', gap: 10,
                }}>
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{
                      padding: '8px 20px', borderRadius: 10,
                      border: '1px solid #e5e7eb', background: '#fff',
                      fontSize: 13, fontWeight: 600, color: '#6b7280', cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => { setModalOpen(false); navigate(`/dashboard/${slug}/gridnotification`); }}
                    style={{
                      padding: '8px 20px', borderRadius: 10, border: 'none',
                      background: 'linear-gradient(135deg, #5c039b, #7c3aed)',
                      fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer',
                    }}
                  >
                    View All Notifications →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Notification Bell with unread count badge */}
          <Dropdown
            open={notifOpen}
            onOpenChange={setNotifOpen}
            dropdownRender={() => notificationDropdown}
            trigger={['click']}
            placement="bottomRight"
          >
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <button
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: unreadCount > 0 ? '#5c039b' : '#6b7280',
                  background: unreadCount > 0 ? '#f5f3ff' : 'transparent',
                }}
              >
                <FiBell size={20} />
              </button>
            </Badge>
          </Dropdown>

          {/* User menu */}
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <button
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-all"
              style={{ border: '1px solid transparent' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full text-white font-bold"
                style={{
                  width: 34, height: 34, fontSize: 13,
                  background: 'linear-gradient(135deg, #5C039B, #7c3aed)',
                  boxShadow: '0 2px 8px rgba(92,3,155,0.35)',
                }}
              >
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.2, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || displayName}
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'capitalize', marginTop: 1 }}>
                  {displayName}
                </div>
              </div>
              <FiChevronDown size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
            </button>
          </Dropdown>

        </div>
      </div>
    </header>
  );
};

export default TopBar;