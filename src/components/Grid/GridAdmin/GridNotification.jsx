import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  Card, List, Avatar, Typography, Tag, Button, Space, Spin, Empty,
  Pagination, Modal, Tooltip
} from 'antd';
import {
  BellOutlined, ClockCircleOutlined, MailOutlined,
  CheckCircleOutlined, ReloadOutlined, EyeOutlined, UserOutlined,
  FileTextOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { showErrorAlert, showSuccessAlert } from '../../../manageApi/utils/sweetAlert';

const { Title, Text, Paragraph } = Typography;

// Modernized color palette
const THEME = {
  primary: '#6366f1', // Premium Indigo
  primaryHover: '#4f46e5',
  bg: '#e0e7ff',
  lightBg: '#eef2ff',
  success: '#10b981',
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

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = async (pageNum = page, activeFilter = filter) => {
    setLoading(true);
    try {
      let url = `/grid/notifications?page=${pageNum}&limit=${LIMIT}`;
      if (activeFilter === 'read') url += '&isRead=true';
      if (activeFilter === 'unread') url += '&isRead=false';

      const res = await apiService.get(url);
      if (res.success) {
        setNotifications(res.data || []);
        setTotal(res.total || 0);
      }
    } catch (error) {
      showErrorAlert('Error', 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleFilterChange = (val) => {
    setFilter(val);
    setPage(1);
    fetchNotifications(1, val);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchNotifications(newPage, filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-4 md:p-8 bg-[#fafafa] min-h-screen font-sans">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
              <ThunderboltOutlined style={{ fontSize: '20px', color: THEME.primary }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
                Notifications
              </Title>
              <Text className="text-gray-500">
                You have {unreadCount} unread messages today.
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
            {['all', 'unread', 'read'].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 capitalize ${
                  filter === f 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex justify-end gap-3 mb-6">
          <Tooltip title="Refresh Feed">
            <Button 
              shape="circle" 
              icon={<ReloadOutlined />} 
              onClick={() => fetchNotifications()} 
              loading={loading}
              className="border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-600 flex items-center justify-center"
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={markAllAsRead}
            disabled={notifications.every((n) => n.isRead)}
            style={{ background: THEME.primary, borderRadius: '8px', fontWeight: 600 }}
            className="shadow-md hover:shadow-lg transition-all"
          >
            Mark all as read
          </Button>
        </div>

        {/* Notification Feed */}
        <div className="bg-transparent">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Spin size="large" />
              <Text className="mt-4 text-gray-400">Syncing your feed...</Text>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Empty description={<span className="text-gray-400 font-medium">All caught up! No notifications found.</span>} />
            </div>
          ) : (
            // FIX IS HERE: Added React Fragment <> ... </> around List and Pagination
            <>
              <List
                itemLayout="horizontal"
                dataSource={notifications}
                split={false}
                renderItem={(item) => (
                  <div 
                    className={`group relative mb-4 p-5 md:p-6 rounded-2xl transition-all duration-300 cursor-pointer border ${
                      !item.isRead 
                        ? 'bg-white border-indigo-100 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.1)]' 
                        : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                    }`}
                    onClick={() => openNotificationModal(item)}
                  >
                    {/* Unread Indicator Bar */}
                    {!item.isRead && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-indigo-500 rounded-r-full" />
                    )}

                    <div className="flex items-start gap-5">
                      <Avatar
                        size={52}
                        icon={<BellOutlined />}
                        className={`${!item.isRead ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Text className={`text-base tracking-tight ${!item.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                              {item.title}
                            </Text>
                            {item.eventType && (
                              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold ${!item.isRead ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                                {item.eventType}
                              </span>
                            )}
                          </div>
                          <Text className="text-xs text-gray-400 font-medium flex items-center whitespace-nowrap">
                            <ClockCircleOutlined className="mr-1.5" /> 
                            {formatDate(item.createdAt)}
                          </Text>
                        </div>

                        <Paragraph 
                          className={`mb-3 mt-1 ${!item.isRead ? 'text-gray-600' : 'text-gray-500'}`}
                          ellipsis={{ rows: 2 }}
                        >
                          {item.message}
                        </Paragraph>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <UserOutlined /> {item.createdByName || 'System'}
                            </span>
                            {item.recipientRole && (
                              <>
                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                                  For: {item.recipientRole}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Space>
                              {!item.isRead && (
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<CheckCircleOutlined />}
                                  loading={actionLoading === item._id}
                                  onClick={(e) => markSingleAsRead(item._id, e)}
                                  className="text-indigo-600 hover:bg-indigo-50 font-semibold"
                                >
                                  Mark Read
                                </Button>
                              )}
                              <Button type="text" size="small" icon={<EyeOutlined />} className="text-gray-500">
                                View
                              </Button>
                            </Space>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              />

              {/* Pagination */}
              {total > LIMIT && (
                <div className="flex justify-center mt-8 pb-8">
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={LIMIT}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    className="custom-pagination"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modern Detailed Modal */}
      <Modal
        open={modalVisible}
        onCancel={closeModal}
        centered
        width={600}
        closeIcon={<span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors">✕</span>}
        footer={null}
        className="rounded-3xl overflow-hidden"
      >
        {selectedNotification && (
          <div className="pt-2">
            <div className="flex items-start gap-4 mb-6">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${!selectedNotification.isRead ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                  <BellOutlined style={{ fontSize: '24px' }} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                   {selectedNotification.title}
                 </h3>
                 <Text className="text-sm text-gray-500 flex items-center gap-2">
                   <ClockCircleOutlined /> {formatDate(selectedNotification.createdAt)}
                 </Text>
               </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-gray-700 text-[15px] leading-relaxed border border-gray-100">
              {selectedNotification.message}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl border border-gray-100 bg-white">
                <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Sender</Text>
                <Text className="font-semibold text-gray-900">{selectedNotification.createdByName || 'System'}</Text>
                {selectedNotification.createdByRole && <Text className="block text-xs text-gray-500 mt-0.5">{selectedNotification.createdByRole}</Text>}
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-white">
                <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Recipient Info</Text>
                <Text className="font-semibold text-indigo-600 capitalize">{selectedNotification.recipientRole || 'All'}</Text>
                {selectedNotification.recipientId && <Text className="block text-xs text-gray-500 mt-0.5 font-mono">{selectedNotification.recipientId}</Text>}
              </div>
              
              {selectedNotification.entityModel && (
                <div className="col-span-2 p-4 rounded-xl border border-gray-100 bg-white flex items-center justify-between">
                  <div>
                    <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Related Record</Text>
                    <div className="flex items-center gap-2">
                      <FileTextOutlined className="text-gray-400" />
                      <Text className="font-semibold text-gray-900">{selectedNotification.entityModel}</Text>
                    </div>
                  </div>
                  {selectedNotification.entityId && (
                    <Text copyable className="text-xs font-mono bg-gray-50 px-2 py-1 rounded text-gray-500 border border-gray-200">
                      {selectedNotification.entityId}
                    </Text>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button size="large" onClick={closeModal} className="rounded-xl font-semibold text-gray-600 border-gray-200 hover:bg-gray-50">
                Close
              </Button>
              {selectedNotification && !selectedNotification.isRead && (
                <Button
                  size="large"
                  type="primary"
                  style={{ background: THEME.primary }}
                  className="rounded-xl font-semibold shadow-md hover:shadow-lg"
                  loading={actionLoading === selectedNotification._id}
                  onClick={async (e) => {
                    await markSingleAsRead(selectedNotification._id, e);
                    setSelectedNotification({ ...selectedNotification, isRead: true });
                  }}
                >
                  Mark as Read
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Global styles override for pagination if needed */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-pagination .ant-pagination-item-active {
          border-color: ${THEME.primary} !important;
          background-color: ${THEME.primary} !important;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: white !important;
        }
      `}} />
    </div>
  );
};

export default GridNotifications;