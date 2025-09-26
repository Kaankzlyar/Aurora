import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationAlert from './NotificationAlert';
import { useNotification } from '../hooks/useNotification';

const NotificationDemo: React.FC = () => {
  const {
    notification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
  } = useNotification();

  return (
    <View style={styles.container}>
      {/* Notification Alert */}
      <NotificationAlert
        type={notification.type}
        title={notification.title}
        message={notification.message}
        visible={notification.visible}
        onClose={hideNotification}
        autoHide={true}
        duration={4000}
      />

      {/* Demo Buttons */}
      <View style={styles.buttonContainer}>
        <Text style={styles.title}>🔔 Notification Demo</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={() => showSuccess('Başarılı!', 'İşlem başarıyla tamamlandı.')}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Success</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.errorButton]}
          onPress={() => showError('Hata!', 'Bir hata oluştu. Lütfen tekrar deneyin.')}
        >
          <Ionicons name="close-circle" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Error</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={() => showWarning('Uyarı!', 'Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?')}
        >
          <Ionicons name="warning" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Warning</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={() => showInfo('Bilgi', 'Bu bir bilgilendirme mesajıdır.')}
        >
          <Ionicons name="information-circle" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Info</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.customButton]}
          onPress={() => showSuccess('Özel', 'Bu mesaj 10 saniye görünür.', false, 10000)}
        >
          <Ionicons name="time" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Custom Duration</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  errorButton: {
    backgroundColor: '#F44336',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  infoButton: {
    backgroundColor: '#2196F3',
  },
  customButton: {
    backgroundColor: '#9C27B0',
  },
});

export default NotificationDemo;
