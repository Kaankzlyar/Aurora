import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Animated,
  Dimensions,
  Pressable,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyOrder: (orderBy: 'price' | 'alphabetical' | 'newest', direction: 'asc' | 'desc') => void;
  currentOrderBy: 'price' | 'alphabetical' | 'newest';
  currentDirection: 'asc' | 'desc';
}

const { height: screenHeight } = Dimensions.get('window');

const OrderModal: React.FC<OrderModalProps> = ({
  visible,
  onClose,
  onApplyOrder,
  currentOrderBy,
  currentDirection,
}) => {
  const [selectedOrderBy, setSelectedOrderBy] = useState(currentOrderBy);
  const [selectedDirection, setSelectedDirection] = useState(currentDirection);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

/*   const backdropAnim = useRef(new Animated.Value(0)).current; // arkaplan opaklığı ayarlanıyor
 */
  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, screenHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const easeOut = Easing.bezier(0.22, 0.1, 0.36, 1.0); //Akıcı easing

  const animateIn = useCallback(() => {
    Animated.parallel([
    
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 280,
            easing: easeOut,
            useNativeDriver: true,
            isInteraction: false,
        })
    ]).start();
  }, [slideAnim]);

  const animateOutThen = useCallback((after?: () => void) => {
    Animated.parallel([
        
        Animated.timing(slideAnim, {
            toValue: screenHeight,
            duration: 260,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
            isInteraction: false,
        })
    ]).start(({finished}) => {
        if (finished && after) {
            after();
        }
    });
  }, [slideAnim]);

  useEffect(() => {
      // Slide up from bottom
      if (visible) {
        // Dışarıdan açıldıysa mevcut seçimleri senkronla (opsiyonel)
        setSelectedOrderBy(currentOrderBy);
        setSelectedDirection(currentDirection);
        animateIn();
      }
      // visible=false olduğunda parent Modal’ı zaten kapatacağı için
      // burada çıkış animasyonu koşturmak genelde işe yaramaz (Modal hemen kapanır).
      // Kendi kapatma aksiyonlarımızda animateOutThen→onClose yapacağız.
  }, [visible, currentOrderBy, currentDirection, animateIn]);

  const handleApply = () => {
    onApplyOrder(selectedOrderBy, selectedDirection);
    animateOutThen(onClose);
  };

  const handleReset = () => {
    setSelectedOrderBy('newest');
    setSelectedDirection('desc');
  };
  const handleBackdropPress = () => {
    animateOutThen(onClose);
  };
  const handleCloseButton = () => {
    animateOutThen(onClose);
  };


  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={handleCloseButton}
      animationType="none"
    >
      <View style={styles.overlay}>
        <Animated.View 
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: 'rgba(0,0,0,0.5)',
              opacity: backdropOpacity, // 0 -> 1
            },
          ]}
        />
        <Pressable style={{ flex: 1 }} onPress={handleBackdropPress} />
        <Animated.View style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#C0C0C0" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Sıralama</Text>
              <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Sıfırla</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              {/* Order By Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sırala:</Text>
                <View style={styles.orderButtons}>
                  <TouchableOpacity
                    style={[
                      styles.orderButton,
                      selectedOrderBy === 'price' && styles.orderButtonActive
                    ]}
                    onPress={() => setSelectedOrderBy('price')}
                  >
                    <Text style={[
                      styles.orderButtonText,
                      selectedOrderBy === 'price' && styles.orderButtonTextActive
                    ]}>
                      Fiyat
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.orderButton,
                      selectedOrderBy === 'alphabetical' && styles.orderButtonActive
                    ]}
                    onPress={() => setSelectedOrderBy('alphabetical')}
                  >
                    <Text style={[
                      styles.orderButtonText,
                      selectedOrderBy === 'alphabetical' && styles.orderButtonTextActive
                    ]}>
                      Alfabetik
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.orderButton,
                      selectedOrderBy === 'newest' && styles.orderButtonActive
                    ]}
                    onPress={() => setSelectedOrderBy('newest')}
                  >
                    <Text style={[
                      styles.orderButtonText,
                      selectedOrderBy === 'newest' && styles.orderButtonTextActive
                    ]}>
                      En Yeni
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Direction Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Yön:</Text>
                <View style={styles.directionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.directionButton,
                      selectedDirection === 'asc' && styles.directionButtonActive
                    ]}
                    onPress={() => setSelectedDirection('asc')}
                  >
                    <Ionicons 
                      name="arrow-up" 
                      size={20} 
                      color={selectedDirection === 'asc' ? '#000000' : '#C0C0C0'} 
                    />
                    <Text style={[
                      styles.directionButtonText,
                      selectedDirection === 'asc' && styles.directionButtonTextActive
                    ]}>
                      Artan
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.directionButton,
                      selectedDirection === 'desc' && styles.directionButtonActive
                    ]}
                    onPress={() => setSelectedDirection('desc')}
                  >
                    <Ionicons 
                      name="arrow-down" 
                      size={20} 
                      color={selectedDirection === 'desc' ? '#000000' : '#C0C0C0'} 
                    />
                    <Text style={[
                      styles.directionButtonText,
                      selectedDirection === 'desc' && styles.directionButtonTextActive
                    ]}>
                      Azalan
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Apply Button */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Sıralamayı Uygula</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent : 'flex-end',
  },
  container: {
    width: '100%',
    height: '60%',
    backgroundColor: '#0B0B0B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resetButton: {
    padding: 8,
  },
  resetButtonText: {
    color: '#C48913',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  orderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  orderButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  orderButtonActive: {
    backgroundColor: '#C0C0C0',
    borderColor: '#C0C0C0',
  },
  orderButtonText: {
    color: '#C0C0C0',
    fontSize: 14,
    fontWeight: '500',
  },
  orderButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  directionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  directionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    gap: 8,
  },
  directionButtonActive: {
    backgroundColor: '#C0C0C0',
    borderColor: '#C0C0C0',
  },
  directionButtonText: {
    color: '#C0C0C0',
    fontSize: 14,
    fontWeight: '500',
  },
  directionButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  applyButton: {
    backgroundColor: '#C48913',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderModal;
