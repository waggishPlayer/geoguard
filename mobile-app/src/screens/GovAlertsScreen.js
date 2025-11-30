import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import AlertCard from '../components/AlertCard'
import { alertsService } from '../services/api'

export default function GovAlertsScreen() {
  const [alerts, setAlerts] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const fetchAlerts = async () => {
    try {
      const { data } = await alertsService.getLatest()
      setAlerts(data || [])
    } catch (error) {
      console.warn('Gov alerts failed', error)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchAlerts()
    setRefreshing(false)
  }

  return (
    <FlatList
      style={styles.list}
      data={alerts}
      keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Government Advisories</Text>
          <Text style={styles.subtitle}>Mirrors `/web-app/app/gov` and `/backend/routes/govt.routes.js`.</Text>
        </View>
      }
      renderItem={({ item }) => <AlertCard alert={item} />}
      ListEmptyComponent={<Text style={styles.empty}>Nothing to show. Connect to backend to load data.</Text>}
      contentContainerStyle={alerts.length === 0 && styles.emptyContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#0b1120',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
    marginTop: 4,
  },
  empty: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 32,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
})

