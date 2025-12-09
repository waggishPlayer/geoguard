import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, ROLES } from '../config/api';

export default function LoginScreen({ navigation }) {
  const [role, setRole] = useState('field_worker');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Error', 'Phone and password are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
        return;
      }

      // Save token
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      // Navigate to home
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register', { role });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 30, textAlign: 'center' }}>
          GeoGuard
        </Text>

        {/* Role Selection */}
        <Text style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>Select Role</Text>
        <View style={{ borderWidth: 1, borderColor: '#334155', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
          <Picker
            selectedValue={role}
            onValueChange={setRole}
            style={{ color: '#e2e8f0', backgroundColor: '#1e293b' }}
          >
            {ROLES.map((r) => (
              <Picker.Item key={r} label={r.replace('_', ' ').toUpperCase()} value={r} />
            ))}
          </Picker>
        </View>

        {/* Phone Input */}
        <Text style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>Phone Number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 98765 43210"
          placeholderTextColor="#64748b"
          keyboardType="phone-pad"
          style={{
            backgroundColor: '#1e293b',
            borderWidth: 1,
            borderColor: '#334155',
            borderRadius: 8,
            padding: 12,
            color: '#e2e8f0',
            marginBottom: 20,
            fontSize: 16
          }}
        />

        {/* Password Input */}
        <Text style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#64748b"
          secureTextEntry
          style={{
            backgroundColor: '#1e293b',
            borderWidth: 1,
            borderColor: '#334155',
            borderRadius: 8,
            padding: 12,
            color: '#e2e8f0',
            marginBottom: 30,
            fontSize: 16
          }}
        />

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: '#01C88D',
            padding: 14,
            borderRadius: 8,
            marginBottom: 16,
            alignItems: 'center'
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 16 }}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          style={{
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#01C88D',
            padding: 14,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#01C88D', fontWeight: 'bold', fontSize: 16 }}>Create Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Validation', 'Email/Phone and password are required')
      return
    }

    setLoading(true)
    try {
      // Determine if input is email or phone
      const isEmail = identifier.includes('@')
      const result = await authService.login(
        isEmail ? identifier : null,
        password,
        isEmail ? null : identifier
      )

      if (result.success) {
        onLogin?.(result.token, result.data)
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed'
      const approvalStatus = error.response?.data?.approval_status

      if (approvalStatus === 'pending') {
        Alert.alert('Account Pending', 'Your account is awaiting approval from an administrator.')
      } else if (approvalStatus === 'rejected') {
        Alert.alert('Account Rejected', 'Your account registration was rejected.')
      } else {
        Alert.alert('Error', msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {roleName ? `${roleName} Login` : 'GeoGuard'}
          </Text>
          <Text style={styles.subtitle}>
            {roleName ? 'Access your dashboard' : 'AI-Powered Mine Safety'}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email or Phone Number"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              if (registerRoute) {
                navigation.navigate(registerRoute)
              } else {
                navigation.navigate('RoleSelection')
              }
            }}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              {registerRoute ? "Don't have an account? " : "Don't have an account? "}
              <Text style={styles.linkTextBold}>
                {registerRoute ? 'Register Here' : 'Sign Up'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  linkTextBold: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
})
