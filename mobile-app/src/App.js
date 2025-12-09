import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AuthNavigator from './navigation/AuthNavigator'
import AppNavigator from './navigation/AppNavigator'
import authService from './services/auth'
import SplashScreen from './screens/SplashScreen'
import { COLORS } from './utils/constants'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        return
      }

      // Dev bypass: auto-inject a site admin session when no stored user exists.
      const devUser = {
        id: -1,
        name: 'Dev Site Admin',
        email: 'dev@local',
        role_id: 2,
        role_name: 'site_admin',
        slope_id: 1,
        is_approved: true
      }
      const devToken = 'DEV_BYPASS'
      await AsyncStorage.setItem('sih_token', devToken)
      await AsyncStorage.setItem('sih_user', JSON.stringify(devUser))
      setUser(devUser)
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (userData) => {
    console.log('[App] handleLogin called - user:', userData?.id, userData?.role_name)
    setUser(userData)
  }

  const handleLogout = async () => {
    await authService.logout()
    setUser(null)
  }

  const handleSplashFinish = () => {
    setShowSplash(false)
  }

  // Show animated splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />
  }

  // Show loading after splash
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    )
  }

  // Main app navigation
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {user ? (
        <AppNavigator user={user} onLogout={handleLogout} />
      ) : (
        <AuthNavigator onLogin={handleLogin} />
      )}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  }
})
