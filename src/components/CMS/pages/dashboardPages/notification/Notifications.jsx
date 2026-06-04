import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { 
  Card, List, Avatar, Typography, Tag, 
  Button, Space, Spin, Empty, Divider, Badge 
} from 'antd';
import {
  BellOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  MailOutlined,
  HistoryOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { showErrorAlert, showSuccessAlert } from '../../../../../manageApi/utils/sweetAlert';

const { Title, Text } = Typography;

const PURPLE_THEME = {
  primary: '#722ed1',
  bg: '#f9f0ff'
};

const Notifications = () => {
  const { user } = useSelector((s) => s.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // Track specific item loading

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await apiService.get(`/notifications/receiver-notification/${user.id}`);
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (error) {
      showErrorAlert("Error", "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // --- 1. Mark Single Notification as Read ---
  const markSingleAsRead = async (id) => {
    
    setActionLoading(id);
    try {
      // Using your router.patch("/read-notification/:id") structure
      // Note: Ensure your apiService.patch is configured
      const res = await apiService.put(`/notifications/read-notification/${id}`);
      
      
      if (res.success) {
        // Update local state without full refresh for better UX
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
        showSuccessAlert("Updated", "Notification marked as read");
      }
    } catch (error) {
      showErrorAlert("Error", "Failed to update notification");
    } finally {
      setActionLoading(null);
    }
  };

const markAllAsRead = async () => {
  if (notifications.every(n => n.isRead)) {
    return showSuccessAlert("Info", "All notifications are already read");
  }

  setLoading(true);
  try {
    const res = await apiService.put("/notifications/read-all-notifications", {
      userId: user.id
    });

    if (res.success) {
      // Optimistic UI update (no refetch needed)
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );

      showSuccessAlert("Success", "All notifications marked as read");
    }
  } catch (error) {
    showErrorAlert("Error", "Failed to update all notifications");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card 
        className="shadow-sm rounded-xl border-none"
        title={
          <Space>
            <HistoryOutlined style={{ color: PURPLE_THEME.primary }} />
            <Title level={4} style={{ margin: 0 }}>Notification History</Title>
          </Space>
        }
        extra={
         <Button
  icon={<MailOutlined />}
  onClick={markAllAsRead}
  disabled={notifications.every(n => n.isRead)}
>
  Mark all as read
</Button>

        }
      >
        {loading ? (
          <div className="py-20 text-center"><Spin size="large" tip="Syncing notifications..." /></div>
        ) : notifications.length === 0 ? (
          <Empty description="No notifications found in your history" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`px-6 py-4 transition-all hover:bg-white border-b border-gray-100 ${!item.isRead ? 'bg-purple-50/20' : ''}`}
                actions={[
                  !item.isRead ? (
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => markSingleAsRead(item._id)}
                    >
                      Mark Read
                    </Button>
                  ) : (
                    <CheckCircleOutlined style={{ color: PURPLE_THEME.primary, opacity: 0.5 }} />
                  )
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!item.isRead} color={PURPLE_THEME.primary} offset={[-2, 32]}>
                      <Avatar 
                        size={48} 
                        icon={<BellOutlined />} 
                        style={{ backgroundColor: PURPLE_THEME.bg, color: PURPLE_THEME.primary }} 
                      />
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong={!item.isRead} className="text-base">{item.title}</Text>
                      <Tag color="purple" bordered={false}>{item.notificationType}</Tag>
                    </Space>
                  }
                  description={
                    <div className="flex flex-col gap-1">
                      <Text className={item.isRead ? "text-gray-400" : "text-gray-600"}>
                        {item.message}
                      </Text>
                      <Space className="text-xs text-gray-400 mt-2">
                        <ClockCircleOutlined />
                        {new Date(item.createdAt).toLocaleString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                        <Divider type="vertical" />
                        <Text type="secondary">Receiver: {item.receiverType?.toUpperCase()}</Text>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default Notifications;