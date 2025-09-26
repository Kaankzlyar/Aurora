# 🔔 NotificationAlert Component

A beautiful, animated notification system that matches your app's dark theme styling.

## ✨ Features

- **4 Notification Types**: Success, Error, Warning, Info
- **Smooth Animations**: Fade in/out with slide effects
- **Auto-hide**: Configurable duration with manual close option
- **Dark Theme**: Matches your app's `#1A1A1A` background
- **Responsive**: Works on all screen sizes
- **Customizable**: Easy to modify colors, duration, and behavior

## 🚀 Quick Start

### 1. Import the Component

```tsx
import NotificationAlert from '../../components/NotificationAlert';
import { useNotification } from '../../hooks/useNotification';
```

### 2. Use the Hook

```tsx
const { notification, showSuccess, showError, showWarning, showInfo, hideNotification } = useNotification();
```

### 3. Add to Your Component

```tsx
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
    
    {/* Your other components */}
  </View>
);
```

## 📱 Usage Examples

### Success Notification
```tsx
showSuccess('Başarılı!', 'İşlem başarıyla tamamlandı.');
```

### Error Notification
```tsx
showError('Hata!', 'Bir hata oluştu. Lütfen tekrar deneyin.');
```

### Warning Notification
```tsx
showWarning('Uyarı!', 'Bu işlem geri alınamaz.');
```

### Info Notification
```tsx
showInfo('Bilgi', 'Bu bir bilgilendirme mesajıdır.');
```

### Custom Duration
```tsx
showSuccess('Özel', 'Bu mesaj 10 saniye görünür.', true, 10000);
```

## 🎨 Styling

The component automatically uses different colors for each notification type:

- **Success**: Green border (`#4CAF50`)
- **Error**: Red border (`#F44336`)
- **Warning**: Orange border (`#FF9800`)
- **Info**: Blue border (`#2196F3`)

## ⚙️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `NotificationType` | `'info'` | Type of notification |
| `title` | `string` | `''` | Notification title |
| `message` | `string` | `''` | Notification message |
| `visible` | `boolean` | `false` | Show/hide notification |
| `onClose` | `() => void` | - | Callback when notification closes |
| `autoHide` | `boolean` | `true` | Auto-hide after duration |
| `duration` | `number` | `4000` | Duration in milliseconds |

## 🔧 Customization

### Change Colors
Edit the `getNotificationStyle()` function in `NotificationAlert.tsx`:

```tsx
case 'success':
  return {
    backgroundColor: '#1A1A1A',
    borderColor: '#YOUR_COLOR', // Change this
    icon: 'checkmark-circle',
    iconColor: '#YOUR_COLOR',   // Change this
  };
```

### Change Position
Modify the `styles.container` in `NotificationAlert.tsx`:

```tsx
container: {
  position: 'absolute',
  top: 60,        // Change this
  left: 16,       // Change this
  right: 16,      // Change this
  // ... other styles
}
```

### Change Animation Duration
Modify the animation durations in the `useEffect`:

```tsx
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,  // Change this (show animation)
  useNativeDriver: true,
}),
```

## 📱 Integration Examples

### In Explore Page
```tsx
// Replace Alert.alert with notifications
showSuccess('Başarılı!', `${product.name} sepete eklendi!`);
showError('Hata', 'Ürün sepete eklenirken bir hata oluştu.');
```

### In Login/Register
```tsx
showError('Giriş Hatası', 'E-posta veya şifre hatalı.');
showSuccess('Hoş Geldiniz!', 'Başarıyla giriş yapıldı.');
```

### In Cart
```tsx
showWarning('Uyarı', 'Sepetinizde 10 ürün bulunuyor.');
showInfo('Bilgi', 'Ücretsiz kargo için 50₺ daha alışveriş yapın.');
```

## 🎯 Best Practices

1. **Keep titles short** - Use 1-3 words
2. **Keep messages concise** - Maximum 2-3 lines
3. **Use appropriate types** - Don't use error for warnings
4. **Set reasonable durations** - 3-5 seconds for most notifications
5. **Provide clear actions** - Tell users what to do next

## 🐛 Troubleshooting

### Notification not showing?
- Check if `visible` prop is `true`
- Ensure `onClose` callback is provided
- Verify component is mounted in the component tree

### Animation issues?
- Check if `useNativeDriver: true` is set
- Ensure animations are properly cleaned up
- Verify no conflicting animations

### Styling issues?
- Check if styles are properly imported
- Verify color values are valid hex codes
- Ensure component has proper positioning

## 🔄 Updates

The notification system automatically:
- Fades in when showing
- Slides down from top
- Auto-hides after specified duration
- Fades out when hiding
- Cleans up timers and animations

---

**Happy Notifying! 🎉**
