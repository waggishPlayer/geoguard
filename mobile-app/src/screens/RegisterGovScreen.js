import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { COLORS } from '../utils/constants'
import api from '../services/api'
import authService from '../services/auth'

import * as DocumentPicker from 'expo-document-picker'

export default function RegisterGovScreen({ navigation, route }) {
    const { onLogin } = route.params || {}
    const [mode, setMode] = useState('login') // 'login' or 'register'
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        department: '',
    })
    const [selectedFile, setSelectedFile] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        if (!form.phone || !form.password) {
            Alert.alert('Validation Error', 'Please enter phone number and password')
            return
        }

        setLoading(true)
        try {
            console.log('[RegisterGov] Attempting login with phone:', form.phone)
            const result = await authService.login(null, form.password, form.phone)
            const user = result.data || result
            
            console.log('[RegisterGov] Login successful, user role:', user.role_name)
            if (user.role_name !== 'gov_authority') {
                await authService.logout()
                Alert.alert('Error', `This account is registered as ${user.role_name}, not as a Government Authority`)
                return
            }

            if (onLogin) {
                onLogin(user)
            }
            navigation.replace('AppNav')
        } catch (error) {
            console.error('[RegisterGov] Login error:', error.message)
            
            // Handle approval status
            if (error.response?.data?.approval_status === 'pending') {
                Alert.alert(
                    'Account Pending',
                    'Your Government Authority registration is awaiting approval from the Super Admin. You will be notified once approved.'
                )
            } else if (error.response?.data?.approval_status === 'rejected') {
                Alert.alert('Account Rejected', 'Your Government Authority registration was rejected.')
            } else {
                const msg = error.response?.data?.message || 'Login failed. Please check your credentials.'
                Alert.alert('Error', msg)
            }
        } finally {
            setLoading(false)
        }
    }

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true
            })

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedFile(result.assets[0])
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to pick document')
        }
    }

    const handleRegister = async () => {
        if (!form.name || !form.email || !form.phone || !form.password || !form.department || !selectedFile) {
            Alert.alert('Validation Error', 'Please fill all required fields and upload your Govt ID.')
            return
        }

        setLoading(true)
        try {
            await api.post('/auth/register/gov', {
                ...form,
                govt_id_url: 'https://example.com/mock-id-uploaded.jpg'
            })
            Alert.alert(
                'Success',
                'Registration submitted! Attempting auto-login...',
                [{ 
                    text: 'OK', 
                    onPress: async () => {
                        try {
                            const user = await authService.login(null, form.password, form.phone)
                            if (onLogin) {
                                onLogin(user)
                            }
                            navigation.replace('AppNav')
                        } catch (err) {
                            console.log('Auto-login failed, redirecting to role selection')
                            navigation.navigate('RoleSelection')
                        }
                    }
                }]
            )
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const isFormValid = mode === 'login'
        ? (form.phone && form.password)
        : (form.name && form.email && form.phone && form.password && form.department && selectedFile)

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Government Authority</Text>
            <Text style={styles.subtitle}>Join as a regulatory authority</Text>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, mode === 'login' && styles.tabActive]}
                    onPress={() => setMode('login')}
                >
                    <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, mode === 'register' && styles.tabActive]}
                    onPress={() => setMode('register')}
                >
                    <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Register</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                {mode === 'login' ? (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="phone-pad"
                            value={form.phone}
                            onChangeText={t => setForm({ ...form, phone: t })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={COLORS.textSecondary}
                            secureTextEntry
                            value={form.password}
                            onChangeText={t => setForm({ ...form, password: t })}
                        />
                        <TouchableOpacity
                            style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={!isFormValid || loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor={COLORS.textSecondary}
                            value={form.name}
                            onChangeText={t => setForm({ ...form, name: t })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor={COLORS.textSecondary}
                            autoCapitalize="none"
                            value={form.email}
                            onChangeText={t => setForm({ ...form, email: t })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="phone-pad"
                            value={form.phone}
                            onChangeText={t => setForm({ ...form, phone: t })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Department / Agency"
                            placeholderTextColor={COLORS.textSecondary}
                            value={form.department}
                            onChangeText={t => setForm({ ...form, department: t })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={COLORS.textSecondary}
                            secureTextEntry
                            value={form.password}
                            onChangeText={t => setForm({ ...form, password: t })}
                        />

                        <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
                            <Text style={styles.uploadText}>
                                {selectedFile ? `Selected: ${selectedFile.name}` : 'Upload Govt ID (PDF/JPG)'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={!isFormValid || loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit for Approval</Text>}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 24
    },
    backButton: {
        marginTop: 40,
        marginBottom: 8
    },
    backText: {
        color: COLORS.accent,
        fontSize: 16,
        fontWeight: '600'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 24
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 4,
        marginBottom: 24
    },
    tab: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        borderRadius: 8
    },
    tabActive: {
        backgroundColor: COLORS.primary
    },
    tabText: {
        color: COLORS.textSecondary,
        fontWeight: '600'
    },
    tabTextActive: {
        color: '#fff'
    },
    form: {
        gap: 16,
        paddingBottom: 40
    },
    input: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    uploadBtn: {
        padding: 20,
        borderWidth: 2,
        borderColor: COLORS.accent,
        borderStyle: 'dashed',
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: 'rgba(56, 189, 248, 0.1)'
    },
    uploadText: {
        color: COLORS.accent,
        fontWeight: 'bold',
        fontSize: 16
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8
    },
    buttonDisabled: {
        opacity: 0.7
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    }
})
