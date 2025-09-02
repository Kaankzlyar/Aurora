import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationAlertProps {
  type: NotificationType;
  title: string;
  message: string;
  visible: boolean;
  onClose: () => void;
  autoHide?: boolean;
  duration?: number;
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({
  type,
  title,
  message,
  visible,
  onClose,
  autoHide = true,
  duration = 4000,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(100)).current; // Changed from -100 to 100 for bottom slide

  React.useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration
      if (autoHide) {
        const timer = setTimeout(() => {
          hideNotification();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideNotification();
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100, // Changed from -100 to 100 for bottom slide
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#1A1A1A',
          borderColor: '#4CAF50',
          icon: 'checkmark-circle',
          iconColor: '#4CAF50',
        };
      case 'error':
        return {
          backgroundColor: '#1A1A1A',
          borderColor: '#F44336',
          icon: 'close-circle',
          iconColor: '#F44336',
        };
      case 'warning':
        return {
          backgroundColor: '#1A1A1A',
          borderColor: '#FF9800',
          icon: 'warning',
          iconColor: '#FF9800',
        };
      case 'info':
        return {
          backgroundColor: '#1A1A1A',
          borderColor: '#2196F3',
          icon: 'information-circle',
          iconColor: '#2196F3',
        };
      default:
        return {
          backgroundColor: '#1A1A1A',
          borderColor: '#C0C0C0',
          icon: 'notifications',
          iconColor: '#C0C0C0',
        };
    }
  };

  const notificationStyle = getNotificationStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          borderColor: notificationStyle.borderColor,
        },
      ]}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons
          name={notificationStyle.icon as any}
          size={24}
          color={notificationStyle.iconColor}
        />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message} numberOfLines={3}>
          {message}
        </Text>
      </View>

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={hideNotification}>
        <Ionicons name="close" size={20} color="#666666" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12, // Changed from 100 to 80 for less spacing
    left: 16,
    right: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#C0C0C0',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationAlert;