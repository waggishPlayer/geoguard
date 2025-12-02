import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { alertsService } from '../services/alerts'
import AlertCard from '../components/AlertCard'
import { COLORS } from '../utils/constants'

import { authService } from '../services/auth'

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    loadUserAndAlerts()
  }, [])

  const loadUserAndAlerts = async () => {
    try {
      const u = await authService.getCurrentUser()
      setUser(u)
      await loadAlerts(u?.slope_id)
    } catch (error) {
      console.error('Failed to load user/alerts:', error)
      setLoading(false)
    }
  }

  const loadAlerts = async (slopeId) => {
    try {
      const data = await alertsService.getAll(slopeId)
      setAlerts(data)
    } catch (error) {
      console.error('Failed to load alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id?.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadAlerts(user?.slope_id)} />}
        renderItem={({ item }) => <AlertCard alert={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No alerts</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
  },
})

