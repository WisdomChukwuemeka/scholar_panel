"use client";

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationAPI } from '../api';
import NotificationItem from '../components/NotificationList';

// Component to display the user's notifications with real-time toast updates
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications on mount and periodically check for new ones
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await NotificationAPI.list();
        const newNotifications = response.data;

        // Show toast for unread notifications
        newNotifications
          .filter((notif) => !notif.is_read)
          .forEach((notif) => {
            toast.info(notif.message, {
              position: "top-right",
              autoClose: 5000,
            });
          });

        setNotifications(newNotifications);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        toast.error('Failed to load notifications', {
          position: "top-right",
        });
      }
    };

    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications available.</p>
        ) : (
          notifications.map((notif) => (
            <NotificationItem key={notif.id} notification={notif} />
          ))
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Notifications;