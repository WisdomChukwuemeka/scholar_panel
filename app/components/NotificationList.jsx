// frontend/components/NotificationList.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationAPI } from '@/app/services/api';
import { toast } from 'react-toastify';

export default function NotificationList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const listResponse = await NotificationAPI.list();
        setNotifications(listResponse.data.results || []);
        const unreadResponse = await NotificationAPI.unread();
        setUnreadCount(unreadResponse.data.unread_count || 0);
      } catch (err) {
        setError('Failed to load notifications.');
        // console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await NotificationAPI.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      toast.success('Notification marked as read.');
    } catch (err) {
      setError('Failed to mark notification as read.');
      // console.error('Error marking notification:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch (err) {
      setError('Failed to mark all notifications as read.');
      // console.error('Error marking all notifications:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.related_publication) {
      router.push(`/publications/${notification.related_publication}`);
      if (!notification.is_read) {
        handleMarkRead(notification.id);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Notifications ({unreadCount} unread)</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-600">No notifications found.</p>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleMarkAllRead}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Mark All as Read
          </button>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border p-4 rounded-md ${notification.is_read ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <p>{notification.message}</p>
              <p className="text-sm text-gray-500">
                {new Date(notification.created_at).toLocaleString('en-US', {
                  timeZone: 'Africa/Lagos',
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              {!notification.is_read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(notification.id);
                  }}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Mark as Read
                </button>
              )}
              {notification.related_publication && (
                <a
                  href={`/publications/${notification.related_publication}`}
                  className="text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Publication
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}