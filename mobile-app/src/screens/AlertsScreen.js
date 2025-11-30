import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { alertsService } from '../services/alerts'
import AlertCard from '../components/AlertCard'
import { COLORS } from '../utils/constants'

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const data = await alertsService.getAll()
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
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAlerts} />}
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

