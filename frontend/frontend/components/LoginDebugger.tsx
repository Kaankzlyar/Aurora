// components/LoginDebugger.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { loginUser } from '../api/auth';

export default function LoginDebugger() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleTest = async () => {
    console.log("=== STARTING LOGIN DEBUG TEST ===");
    console.log("Current form values:");
    console.log("Email:", JSON.stringify(email));
    console.log("Password:", password ? "***" : "empty");
    
    const result = await loginUser(email, password);
    
    console.log("=== LOGIN RESULT ===");
    console.log(result);
    
    if (result.token) {
      Alert.alert("Success", "Login successful!");
    } else {
      Alert.alert("Error", result.message || "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Debugger</Text>
      
      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <Text style={styles.info}>
        Email length: {email.length} | Trimmed: "{email.trim()}" | Lowercase: "{email.trim().toLowerCase()}"
      </Text>
      
      <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        secureTextEntry={false} // Temporarily false for debugging
      />
      
      <Text style={styles.info}>
        Password length: {password.length}
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={handleTest}>
        <Text style={styles.buttonText}>Test Login</Text>
      </TouchableOpacity>
      
      <Text style={styles.note}>
        Check the console logs for detailed request/response information
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  info: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
