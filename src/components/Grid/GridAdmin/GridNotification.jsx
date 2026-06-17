import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  Card, List, Avatar, Typography, Tag, Button, Space, Spin, Empty,
  Divider, Badge, Pagination, Modal, Descriptions, Tooltip
} from 'antd';
import {
  BellOutlined, ClockCircleOutlined, MailOutlined, HistoryOutlined,
  CheckCircleOutlined, ReloadOutlined, EyeOutlined, UserOutlined,
  TagOutlined, FileTextOutlined
} from '@ant-design/icons';
import { showErrorAlert, showSuccessAlert } from '../../../manageApi/utils/sweetAlert';

const { Title, Text, Paragraph } = Typography;

const PURPLE_THEME = {
  primary: '#722ed1',
  bg: '#f9f0ff',
  lightBg: '#faf5ff',
};

const GridNotifications = () => {
  const { user } = useSelector((s) => s.auth);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all'); 
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Helper to get user role slug for display
  const getUserRoleSlug = () => {
    if (!user?.role) return 'user';
    if (typeof user.role === 'object') return user.role.slug || user.role.code || 'user';
    return String(user.role).toLowerCase();
  };

  const roleCode = user?.role?.code || user?.role;
const isAdmin = [0, 1, '0', '1'].includes(roleCode);
const isDeveloper = [17, '17'].includes(roleCode);
const isAgent = [16, '16'].includes(roleCode);
const isReferralPartner = [25, '25'].includes(roleCode);
const isPartner = [21,'21'].includes(roleCode); 


const getRoleLabel = () => {
  if (isAdmin) return { label: 'Admin View', color: 'red' };
  if (isDeveloper) return { label: 'Developer View', color: 'green' };
  if (isAgent) return { label: 'Agent View', color: 'blue' };
  if (isReferralPartner) return { label: 'Referral Partner View', color: 'purple' };
  if (isPartner) return { label: 'Partner View', color: 'orange' };
  return { label: 'User View', color: 'default' };
};

  // Fetch notifications – always scoped to logged-in user
 const fetchNotifications = async (pageNum = page, activeFilter = filter) => {
  if (!user?.id) return;
  setLoading(true);
  try {
    // ✅ Remove userId from URL – backend will use token
    let url = `/grid/notifications?page=${pageNum}&limit=${LIMIT}`;
    if (activeFilter === 'read') url += '&isRead=true';
    if (activeFilter === 'unread') url += '&isRead=false';

    const res = await apiService.get(url);
    if (res.success) {
      setNotifications(res.data || []);
      setTotal(res.total || 0);
    } else {
      showErrorAlert('Error', res.message || 'Failed to fetch notifications');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    if (error.response?.status === 403 || error.response?.status === 401) {
      showErrorAlert('Access Denied', 'You do not have permission to view notifications. Please contact admin.');
    } else {
      showErrorAlert('Error', 'Failed to fetch notifications');
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchNotifications();
    // Optional: refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(page, filter);
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.id]); // re-run if user changes

  const handleFilterChange = (val) => {
    setFilter(val);
    setPage(1);
    fetchNotifications(1, val);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchNotifications(newPage, filter);
  };

  const markSingleAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    setActionLoading(id);
    try {
      const res = await apiService.put(`/grid/notifications/${id}/read`);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        // Update selected notification if open
        if (selectedNotification && selectedNotification._id === id) {
          setSelectedNotification({ ...selectedNotification, isRead: true });
        }
        showSuccessAlert('Updated', 'Notification marked as read');
      }
    } catch (error) {
      showErrorAlert('Error', 'Failed to update notification');
    } finally {
      setActionLoading(null);
    }
  };

  const markAllAsRead = async () => {
    if (notifications.every((n) => n.isRead)) {
      return showSuccessAlert('Info', 'All notifications are already read');
    }
    setLoading(true);
    try {
      const res = await apiService.put('/grid/notifications/read-all');
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        showSuccessAlert('Success', 'All notifications marked as read');
      }
    } catch (error) {
      showErrorAlert('Error', 'Failed to update all notifications');
    } finally {
      setLoading(false);
    }
  };

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Card
        className="shadow-xl rounded-2xl border-0 overflow-hidden"
        bodyStyle={{ padding: 0 }}
        title={
          <div className="flex items-center gap-3 px-6 pt-6">
            <div className="p-2 rounded-full" style={{ backgroundColor: PURPLE_THEME.bg }}>
              <HistoryOutlined style={{ fontSize: '20px', color: PURPLE_THEME.primary }} />
            </div>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              Notification History
            </Title>
            {unreadCount > 0 && (
              <Tag color="purple" style={{ borderRadius: 99, fontWeight: 500 }}>
                {unreadCount} unread
              </Tag>
            )}
            {/* Role badge to confirm whose view */}
           <Tag color={getRoleLabel().color} className="ml-2">
  {getRoleLabel().label}
</Tag>
          </div>
        }
        extra={
          <Space className="pr-6 pt-6" wrap>
            <Button.Group size="middle">
              <Button
                type={filter === 'all' ? 'primary' : 'default'}
                onClick={() => handleFilterChange('all')}
                style={filter === 'all' ? { background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary } : {}}
              >
                All
              </Button>
              <Button
                type={filter === 'unread' ? 'primary' : 'default'}
                onClick={() => handleFilterChange('unread')}
                style={filter === 'unread' ? { background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary } : {}}
              >
                Unread
              </Button>
              <Button
                type={filter === 'read' ? 'primary' : 'default'}
                onClick={() => handleFilterChange('read')}
                style={filter === 'read' ? { background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary } : {}}
              >
                Read
              </Button>
            </Button.Group>

            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={() => fetchNotifications(page, filter)} loading={loading} />
            </Tooltip>

            <Tooltip title="Mark all as read">
              <Button
                icon={<MailOutlined />}
                onClick={markAllAsRead}
                disabled={notifications.every((n) => n.isRead)}
              >
                Mark all read
              </Button>
            </Tooltip>
          </Space>
        }
      >
        {loading ? (
          <div className="py-20 text-center">
            <Spin size="large" tip="Loading notifications..." />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16">
            <Empty description="No notifications found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md px-6 py-4 border-b border-gray-100 ${
                    !item.isRead ? 'hover:bg-purple-50' : 'hover:bg-gray-50'
                  }`}
                  style={{ backgroundColor: !item.isRead ? PURPLE_THEME.lightBg : 'white' }}
                  onClick={() => openNotificationModal(item)}
                  actions={[
                    !item.isRead ? (
                      <Button
                        key="mark-read"
                        type="link"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        loading={actionLoading === item._id}
                        onClick={(e) => markSingleAsRead(item._id, e)}
                        style={{ color: PURPLE_THEME.primary }}
                      >
                        Mark Read
                      </Button>
                    ) : (
                      <Tooltip title="Already read">
                        <CheckCircleOutlined key="done" style={{ color: '#52c41a', fontSize: 16 }} />
                      </Tooltip>
                    ),
                    <Tooltip title="View details">
                      <EyeOutlined key="view" style={{ color: PURPLE_THEME.primary, fontSize: 16 }} />
                    </Tooltip>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        dot={!item.isRead}
                        color={PURPLE_THEME.primary}
                        offset={[-4, 32]}
                      >
                        <Avatar
                          size={48}
                          icon={<BellOutlined />}
                          style={{
                            backgroundColor: PURPLE_THEME.bg,
                            color: PURPLE_THEME.primary,
                            boxShadow: '0 2px 6px rgba(114,46,209,0.15)'
                          }}
                        />
                      </Badge>
                    }
                    title={
                      <div className="flex items-center gap-2 flex-wrap">
                        <Text strong={!item.isRead} className="text-base">
                          {item.title}
                        </Text>
                        {item.eventType && (
                          <Tag color="purple" bordered={false} className="rounded-full px-3">
                            {item.eventType}
                          </Tag>
                        )}
                        {item.recipientRole && (
                          <Tag color="cyan" bordered={false} className="rounded-full px-3">
                            {item.recipientRole}
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      <div className="flex flex-col gap-1">
                        <Text
                          className={`${item.isRead ? 'text-gray-500' : 'text-gray-700'}`}
                          ellipsis={{ rows: 2, expandable: false }}
                        >
                          {item.message}
                        </Text>
                        <Space className="text-xs text-gray-400 mt-2" split={<Divider type="vertical" />}>
                          <span><ClockCircleOutlined className="mr-1" /> {formatDate(item.createdAt)}</span>
                          <span><UserOutlined className="mr-1" /> By: {item.createdByName || 'System'}</span>
                          {item.recipientRole && (
                            <span>Role: {item.recipientRole.toUpperCase()}</span>
                          )}
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />

            {total > LIMIT && (
              <div className="flex justify-end pt-4 px-6 pb-6 bg-white">
                <Pagination
                  current={page}
                  total={total}
                  pageSize={LIMIT}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(t) => <span className="text-gray-500">Total {t} notifications</span>}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Detailed Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BellOutlined style={{ color: PURPLE_THEME.primary, fontSize: 20 }} />
            <span>Notification Details</span>
            {selectedNotification && !selectedNotification.isRead && (
              <Tag color="purple" className="ml-2">Unread</Tag>
            )}
          </div>
        }
        open={modalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
          selectedNotification && !selectedNotification.isRead && (
            <Button
              key="mark-read-modal"
              type="primary"
              style={{ background: PURPLE_THEME.primary }}
              onClick={async (e) => {
                await markSingleAsRead(selectedNotification._id, e);
              }}
            >
              Mark as Read
            </Button>
          )
        ]}
        width={700}
        className="notification-modal"
      >
        {selectedNotification && (
          <Descriptions bordered column={1} size="middle" labelStyle={{ fontWeight: 600, width: '30%' }}>
            <Descriptions.Item label="Title">{selectedNotification.title}</Descriptions.Item>
            <Descriptions.Item label="Message">
              <Paragraph copyable>{selectedNotification.message}</Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="Event Type">
              <Tag color="purple">{selectedNotification.eventType || '—'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedNotification.isRead ? (
                <Tag color="green">Read</Tag>
              ) : (
                <Tag color="orange">Unread</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Entity">
              {selectedNotification.entityModel && (
                <Tag icon={<FileTextOutlined />} color="geekblue">
                  {selectedNotification.entityModel}
                </Tag>
              )}
              {selectedNotification.entityId && (
                <Text code className="ml-2">{selectedNotification.entityId}</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Recipient">
              <div>
                <div>Role: <Tag color="cyan">{selectedNotification.recipientRole || '—'}</Tag></div>
                {selectedNotification.recipientId && (
                  <div>ID: <Text code>{selectedNotification.recipientId}</Text></div>
                )}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Created By">
              <div>
                <div>Name: {selectedNotification.createdByName || 'System'}</div>
                <div>Role: <Tag color="default">{selectedNotification.createdByRole || '—'}</Tag></div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Timestamps">
              <div>Created: {formatDate(selectedNotification.createdAt)}</div>
              {selectedNotification.updatedAt && selectedNotification.updatedAt !== selectedNotification.createdAt && (
                <div>Updated: {formatDate(selectedNotification.updatedAt)}</div>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Notification ID">
              <Text copyable>{selectedNotification._id}</Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default GridNotifications;