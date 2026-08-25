/**
 * Notification management utilities in localStorage
 */

export const getNotifications = (userId) => {
  if (!userId) return [];
  const stored = localStorage.getItem(`notifications_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

export const addNotification = (userId, title, message) => {
  if (!userId) return;
  const notifications = getNotifications(userId);
  const newNotification = {
    id: Date.now().toString(),
    title,
    message,
    read: false,
    timestamp: new Date().toISOString(),
  };
  
  localStorage.setItem(`notifications_${userId}`, JSON.stringify([newNotification, ...notifications]));
  // Dispatch event so the Bell component can re-fetch notifications immediately
  window.dispatchEvent(new CustomEvent('notifications_updated', { detail: userId }));
};

export const markAllAsRead = (userId) => {
  if (!userId) return;
  const notifications = getNotifications(userId);
  const updated = notifications.map(notif => ({ ...notif, read: true }));
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('notifications_updated', { detail: userId }));
};

export const clearNotifications = (userId) => {
  if (!userId) return;
  localStorage.removeItem(`notifications_${userId}`);
  window.dispatchEvent(new CustomEvent('notifications_updated', { detail: userId }));
};
