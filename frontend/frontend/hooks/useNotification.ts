import { useState, useCallback } from 'react';
import { NotificationType } from '../components/NotificationAlert';

interface NotificationState {
  visible: boolean;
  type: NotificationType;
  title: string;
  message: string;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    autoHide: boolean = true,
    duration: number = 4000
  ) => {
    setNotification({
      visible: true,
      type,
      title,
      message,
    });

    // Auto-hide if enabled
    if (autoHide) {
      setTimeout(() => {
        hideNotification();
      }, duration);
    }
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showSuccess = useCallback((title: string, message: string, autoHide = true, duration = 4000) => {
    showNotification('success', title, message, autoHide, duration);
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, autoHide = true, duration = 5000) => {
    showNotification('error', title, message, autoHide, duration);
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, autoHide = true, duration = 4000) => {
    showNotification('warning', title, message, autoHide, duration);
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, autoHide = true, duration = 4000) => {
    showNotification('info', title, message, autoHide, duration);
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
