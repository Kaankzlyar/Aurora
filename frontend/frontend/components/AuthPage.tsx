// components/AuthPage.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, Mail, Lock, User, Crown } from 'lucide-react-native';

type Props = {
  isLogin: boolean;
  formData: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onToggle: () => void;
};

export function AuthPage({ isLogin, formData, onChange, onSubmit, onToggle }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <MotiView style={styles.contentWrapper}>
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Crown color="#D4AF37" size={32} />
              </View>
              <Text style={styles.logoText}>AURORA</Text>
            </View>
            <Text style={styles.subtitle}>Maison de Couture</Text>
          </View>

          {/* Glass Form Card */}
          <Card style={styles.card}>
            <CardHeader style={styles.cardHeader}>
              <CardTitle style={styles.cardTitle}>
                {isLogin ? 'Welcome Back' : 'Join Aurora'}
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
                        value={formData.firstName}
                        onChangeText={(text) => onChange('firstName', text)}
                        placeholder="First Name"
                      />
                    </View>
                    <View style={styles.nameField}>
                      <Label>Last Name</Label>
                      <Input
                        value={formData.lastName}
                        onChangeText={(text) => onChange('lastName', text)}
                        placeholder="Last Name"
                      />
                    </View>
                  </View>
                )}

                <View style={styles.field}>
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
                    onChangeText={(text) => onChange('email', text)}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.field}>
                  <Label>Password</Label>
                  <View style={styles.passwordContainer}>
                    <Input
                      value={formData.password}
                      onChangeText={(text) => onChange('password', text)}
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      style={styles.passwordInput}
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
                      value={formData.confirmPassword}
                      onChangeText={(text) => onChange('confirmPassword', text)}
                      placeholder="Confirm Password"
                      secureTextEntry={true}
                    />
                  </View>
                )}

                <Button 
                  title={isLogin ? 'Login' : 'Register'}
                  onPress={() => {
                    console.log('Button clicked in AuthPage');
                    onSubmit();
                  }}
                />
              </View>

              <View style={styles.toggleContainer}>
                <TouchableOpacity onPress={onToggle}>
                  <Text style={styles.toggleText}>
                    {isLogin ? 'Dont have an account? Register' : 'Already have an account? Login'}
                  </Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>
        </MotiView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#D4AF37',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
  },
  card: {
    backgroundColor: 'rgba(75, 75, 75, 0.4)',
  },
  cardHeader: {
    alignItems: 'center',
  },
  cardTitle: {
    color: '#e5e5e5',
    fontSize: 24,
    textAlign: 'center',
  },
  cardDescription: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 16,
  },
  nameField: {
    flex: 1,
  },
  field: {
    gap: 4,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  toggleText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});
