import React, { useState, useRef, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  Keyboard
} from 'react-native';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  isLogin: boolean;
  formData: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onToggle: () => void;
};

export function AuthPage({ isLogin, formData, onChange, onSubmit, onToggle }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Refs for input navigation
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Arka plan gradient */}
      <LinearGradient
        colors={[
          '#000000',
           '#1a1a1a', 
           'rgba(212,175,55,0.15)', 
           '#0b0b0b']} // siyah tonlar
        locations={[0, 0.4, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContainer,
          keyboardVisible && { 
            paddingBottom: Math.max(keyboardHeight - 150, 20),
          }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={false}
        automaticallyAdjustContentInsets={false}
      >
        <View style={styles.contentWrapper}>
          
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {/* <View style={styles.logoIcon} /> */}
              <Text style={styles.logoText}>AURORA</Text>
            </View>
            <Text style={styles.subtitle}>Maison de Couture</Text>
          </View>

          {/* Glassmorphism Card Wrapper */}
          <View style={styles.glassWrapper}>
            {/* Blur arka plan */}
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            {/* Hafif karartma overlay (cam derinliği için) */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.15)' }]} />

            <Card style={styles.card}>
              <CardHeader style={styles.cardHeader}>
                <CardTitle style={styles.cardTitle}>
                  {isLogin ? 'The House' : 'Join Aurora'}
                </CardTitle>
                <CardDescription style={styles.cardDescription}>
                  {isLogin ? 'Access your exclusive account' : 'Enter the world of luxury'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <View style={styles.form}>
                  {!isLogin && (
                    <View style={styles.nameRow}>
                      <View style={styles.nameField}>
                        <Label>First Name</Label>
                        <Input
                          ref={firstNameRef}
                          value={formData.firstName}
                          onChangeText={(text) => onChange('firstName', text)}
                          placeholder="First Name"
                          autoCapitalize="words"
                          returnKeyType="next"
                          onSubmitEditing={() => lastNameRef.current?.focus()}
                          blurOnSubmit={false}
                        />
                      </View>
                      <View style={styles.nameField}>
                        <Label>Last Name</Label>
                        <Input
                          ref={lastNameRef}
                          value={formData.lastName}
                          onChangeText={(text) => onChange('lastName', text)}
                          placeholder="Last Name"
                          autoCapitalize="words"
                          returnKeyType="next"
                          onSubmitEditing={() => emailRef.current?.focus()}
                          blurOnSubmit={false}
                        />
                      </View>
                    </View>
                  )}

                  <View style={styles.field}>
                    <Label>Email</Label>
                    <Input
                      ref={emailRef}
                      value={formData.email}
                      onChangeText={(text) => onChange('email', text)}
                      placeholder="Email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>

                  <View style={styles.field}>
                    <Label>Password</Label>
                    <View style={styles.passwordContainer}>
                      <Input
                        ref={passwordRef}
                        value={formData.password}
                        onChangeText={(text) => onChange('password', text)}
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        style={styles.passwordInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType={isLogin ? 'done' : 'next'}
                        onSubmitEditing={() => {
                          if (!isLogin) {
                            confirmPasswordRef.current?.focus();
                          } else {
                            onSubmit();
                          }
                        }}
                        blurOnSubmit={isLogin}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                      >
                        {showPassword ? <EyeOff color="#9ca3af" size={20} /> : <Eye color="#9ca3af" size={20} />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {!isLogin && (
                    <View style={styles.field}>
                      <Label>Confirm Password</Label>
                      <Input
                        ref={confirmPasswordRef}
                        value={formData.confirmPassword}
                        onChangeText={(text) => onChange('confirmPassword', text)}
                        placeholder="Confirm Password"
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={onSubmit}
                        blurOnSubmit
                      />
                    </View>
                  )}

                  <Button
                    title={isLogin ? 'Sign In' : 'Sign Up'}
                    onPress={() => {
                      console.log('Button clicked in AuthPage');
                      onSubmit();
                    }}
                  />

                  <View style={styles.toggleContainer}>
                    <TouchableOpacity onPress={onToggle}>
                      <Text style={styles.toggleText}>
                        {isLogin
                          ? 'New to Aurora? Begin Your Journey'
                          : 'Back to Your Collection? Sign In'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Arka plan koyu
  container: { flex: 1, backgroundColor: '#000' },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 16,
    minHeight: Dimensions.get('window').height - 100,
  },
  contentWrapper: { width: '100%', maxWidth: 400, alignSelf: 'center' },

  // Üst bölüm
  header: { alignItems: 'center', marginBottom: 32 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logoIcon: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    marginRight: 12,
  },
  logoText: {
    fontSize: 44,
    fontWeight: '400',
    color: '#C48913',
    fontFamily: 'PlayfairDisplay_700Bold', // font adını projendeki useFonts’a göre ayarla
    letterSpacing: 1,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 20,
    fontFamily: 'CormorantGaramond_500Medium_Italic',
  },

  // Cam efektli sarmalayıcı
  glassWrapper: {
    borderRadius: 16,
    overflow: 'hidden', // BlurView düzgün kesilsin
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)', // altın tonlu ince çerçeve
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6, // Android gölge
  },

  // Card arka planı transparan olmalı
  card: {
    backgroundColor: 'transparent',
  },

  cardHeader: { alignItems: 'center' },
  cardTitle: {
    color: '#e5e5e5',
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'PlayfairDisplay_400Regular',
  },
  cardDescription: {
    color: '#92979f',
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'CormorantGaramond_500Medium_Italic',
  },

  // Form
  form: { gap: 20 },
  nameRow: { flexDirection: 'row', gap: 16 },
  nameField: { flex: 1 },
  field: { gap: 4 },

  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeButton: { position: 'absolute', right: 12, top: 14 },

  toggleContainer: { alignItems: 'center', marginTop: 16 },
  toggleText: { color: '#9ca3af', fontSize: 14, fontFamily: 'Montserrat_400Regular' },
});

export default AuthPage;