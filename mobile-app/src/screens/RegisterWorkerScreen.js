import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { COLORS } from '../utils/constants'
import api from '../services/api'
import authService from '../services/auth'

export default function RegisterWorkerScreen({ navigation, onLogin }) {
    const [mode, setMode] = useState('login') // 'login' or 'register'
    const [step, setStep] = useState(1) // 1: Phone, 2: OTP & Details (for register)
    const [form, setForm] = useState({
        phone: '',
        otp: '',
        name: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        if (!form.phone || !form.password) {
            Alert.alert('Error', 'Phone number and password are required')
            return
        }

        setLoading(true)
        try {
            console.log('[RegisterWorker] Attempting login with phone:', form.phone)
            const result = await authService.login(null, form.password, form.phone)
            const user = result.data || result
            
            console.log('[RegisterWorker] Login successful, user role:', user.role_name, 'slope:', user.slope_id)
            if (user.role_name !== 'field_worker') {
                await authService.logout()
                Alert.alert('Error', `This account is registered as ${user.role_name}, not as a Field Worker`)
                return
            }

            if (onLogin) {
                onLogin(user)
            }
            navigation.replace('AppNav')
        } catch (error) {
            console.error('[RegisterWorker] Login error:', error.message)
            const msg = error.message || 'Login failed'
            Alert.alert('Error', msg)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyPhone = async () => {
        if (!form.phone) {
            Alert.alert('Error', 'Phone number is required')
            return
        }
        setStep(2)
        Alert.alert('OTP Sent', 'Use 123456 as OTP for demo')
    }

    const handleRegister = async () => {
        if (!form.name || !form.password || !form.otp) {
            Alert.alert('Error', 'Please fill all fields')
            return
        }

        setLoading(true)
        try {
            const res = await api.post('/auth/register/worker', form)
            Alert.alert(
                'Success',
                'Registration successful! Logging you in...',
                [{ text: 'OK', onPress: async () => {
                    try {
                        const result = await authService.login(null, form.password, form.phone)
                        if (result.success) {
                            if (onLogin) {
                                onLogin(result.data)
                            }
                            navigation.replace('AppNav')
                        }
                    } catch (err) {
                        console.log('Auto-login failed, redirecting to role selection')
                        navigation.navigate('RoleSelection')
                    }
                }}]
            )
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>👷 Field Worker</Text>
                <Text style={styles.subtitle}>Access your mine site</Text>
            </View>

            {/* Tab Selector */}
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
                            editable={!loading}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={COLORS.textSecondary}
                            secureTextEntry
                            value={form.password}
                            onChangeText={t => setForm({ ...form, password: t })}
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
                                <Text style={styles.buttonText}>Login</Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        {step === 1 ? (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone Number"
                                    placeholderTextColor={COLORS.textSecondary}
                                    keyboardType="phone-pad"
                                    value={form.phone}
                                    onChangeText={t => setForm({ ...form, phone: t })}
                                />
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleVerifyPhone}
                                >
                                    <Text style={styles.buttonText}>Send OTP</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter OTP (123456)"
                                    placeholderTextColor={COLORS.textSecondary}
                                    keyboardType="numeric"
                                    value={form.otp}
                                    onChangeText={t => setForm({ ...form, otp: t })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={form.name}
                                    onChangeText={t => setForm({ ...form, name: t })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Set Password"
                                    placeholderTextColor={COLORS.textSecondary}
                                    secureTextEntry
                                    value={form.password}
                                    onChangeText={t => setForm({ ...form, password: t })}
                                />
                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleRegister}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Complete Registration</Text>}
                                </TouchableOpacity>
                            </>
                        )}
                    </>
                )}
            </View>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backText}>← Back to Role Selection</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 24
    },
    header: {
        marginTop: 40,
        marginBottom: 24,
        alignItems: 'center'
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary
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
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8
    },
    tabActive: {
        backgroundColor: COLORS.primary
    },
    tabText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: 16
    },
    tabTextActive: {
        color: '#fff'
    },
    form: {
        marginBottom: 24
    },
    input: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 12,
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
    },
    backButton: {
        alignItems: 'center',
        paddingVertical: 12
    },
    backText: {
        color: COLORS.primary,
        fontSize: 14
    }
})
