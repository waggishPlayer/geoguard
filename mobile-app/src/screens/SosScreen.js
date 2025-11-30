import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import * as Location from 'expo-location'
import api from '../services/api'
import { useNetwork } from '../hooks/useNetwork'

export default function SosScreen() {
  const [sending, setSending] = useState(false)
  const { isOnline } = useNetwork(2000)

  const sendSos = async () => {
    setSending(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location access is needed for SOS dispatch.')
        return
      }
      const coords = await Location.getCurrentPositionAsync({})
      await api.post('/alerts/sos', {
        coords,
        note: 'Triggered from mobile app',
        online: isOnline,
      })
      Alert.alert('SOS Sent', 'Control room notified.')
    } catch (error) {
      console.error('SOS failed', error)
      Alert.alert('Error', 'Unable to send SOS right now.')
    } finally {
      setSending(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency SOS</Text>
      <Text style={styles.subtitle}>Shares live GPS + status with the backend (same channel as web dashboard).</Text>
      <Pressable style={[styles.button, sending && styles.disabled]} disabled={sending} onPress={sendSos}>
        <Text style={styles.buttonLabel}>{sending ? 'Sending...' : 'Send SOS'}</Text>
      </Pressable>
      <Text style={styles.meta}>Status: {isOnline ? 'Online' : 'Offline - will retry when connected'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94a3b8',
    marginTop: 12,
    lineHeight: 20,
  },
  button: {
    marginTop: 32,
    backgroundColor: '#ef4444',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.7,
  },
  meta: {
    color: '#94a3b8',
    marginTop: 16,
  },
})

