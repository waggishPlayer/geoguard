import { useEffect, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { alertsService } from '../services/alerts'
import api from '../services/api'
import { useOfflineQueue } from '../hooks/useOfflineQueue'
import { useNetwork } from '../hooks/useNetwork'
import { COLORS } from '../utils/constants'

export default function HomeScreen() {
  const navigation = useNavigation()
  const [refreshing, setRefreshing] = useState(false)
  const [riskLevel, setRiskLevel] = useState('Low')
  const [weather, setWeather] = useState({ temp: '--', rain: '--' })
  const { isOnline } = useNetwork()

  const loadData = async () => {
    try {
      // Fetch sensors to get latest data
      const sensorsRes = await api.get('/sensors')
      const sensors = sensorsRes.data.data

      if (sensors && sensors.length > 0) {
        // 1. Risk Level (from displacement/vibration)
        const dispSensor = sensors.find(s => s.sensor_type === 'displacement')
        if (dispSensor) {
          const readingsRes = await api.get(`/sensors/${dispSensor.id}/readings`)
          const readings = readingsRes.data.data
          if (readings && readings.length > 0) {
            // Simple logic for demo: > 5mm is High, > 2mm is Medium
            const val = readings[0].value
            if (val > 5) setRiskLevel('High')
            else if (val > 2) setRiskLevel('Medium')
            else setRiskLevel('Low')
          }
        }

        // 2. Weather (from rain gauge)
        const rainSensor = sensors.find(s => s.sensor_type === 'rain_gauge')
        if (rainSensor) {
          const readingsRes = await api.get(`/sensors/${rainSensor.id}/readings`)
          const readings = readingsRes.data.data
          if (readings && readings.length > 0) {
            setWeather(prev => ({ ...prev, rain: `${readings[0].value} mm` }))
          }
        }
        // Mock temp for now as we don't have a temp sensor in demo data yet
        setWeather(prev => ({ ...prev, temp: '28°C' }))
      }
    } catch (error) {
      console.warn('Failed to load dashboard data', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleGenerateDemoData = async () => {
    try {
      setRefreshing(true)
      await api.post('/admin/demo-data')
      await loadData()
      Alert.alert('Success', 'New demo data generated!')
    } catch (error) {
      Alert.alert('Error', 'Failed to generate demo data')
    } finally {
      setRefreshing(false)
    }
  }

  const getRiskColor = () => {
    if (riskLevel === 'High') return COLORS.danger
    if (riskLevel === 'Medium') return COLORS.warning
    return COLORS.success
  }

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>GeoGuard Dashboard</Text>
          <Text style={styles.headerSubtitle}>Demo Mine (11.10°N, 79.15°E)</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isOnline ? COLORS.success : COLORS.textSecondary }]}>
          <Text style={styles.statusText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {/* 1. Rockfall Prediction */}
        <TouchableOpacity style={[styles.card, styles.cardLarge]} onPress={() => navigation.navigate('ML', { screen: 'MLMain' })}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Rockfall Prediction</Text>
          </View>
          <View style={styles.riskContainer}>
            <Text style={[styles.riskValue, { color: getRiskColor() }]}>{riskLevel}</Text>
            <Text style={styles.riskLabel}>Current Risk Level</Text>
          </View>
          <Text style={styles.cardFooter}>Tap for sensor details</Text>
        </TouchableOpacity>

        {/* 2. Evacuation System */}
        <TouchableOpacity style={[styles.card, styles.cardMedium]} onPress={() => navigation.navigate('SOS')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Evacuation System</Text>
          </View>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🚨</Text>
          </View>
          <Text style={styles.actionText}>Emergency SOS</Text>
        </TouchableOpacity>

        {/* 3. Risk Map */}
        <TouchableOpacity style={[styles.card, styles.cardMedium]} onPress={() => navigation.navigate('Map')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Risk Map</Text>
          </View>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🗺️</Text>
          </View>
          <Text style={styles.actionText}>View Live Map</Text>
        </TouchableOpacity>

        {/* 4. Climate */}
        <TouchableOpacity style={[styles.card, styles.cardLarge]} onPress={() => Alert.alert('Climate', `Temperature: ${weather.temp}\nPrecipitation: ${weather.rain}`)}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Climate</Text>
          </View>
          <View style={styles.weatherContainer}>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherValue}>{weather.temp}</Text>
              <Text style={styles.weatherLabel}>Temp</Text>
            </View>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherValue}>{weather.rain}</Text>
              <Text style={styles.weatherLabel}>Rain (1h)</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.demoButton} onPress={handleGenerateDemoData}>
        <Text style={styles.demoButtonText}>Simulate Demo Data</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#0b1120',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#0b1120',
    fontSize: 10,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  cardLarge: {
    width: '100%',
    height: 160,
  },
  cardMedium: {
    width: '48%',
    height: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  riskContainer: {
    alignItems: 'center',
  },
  riskValue: {
    fontSize: 48,
    fontWeight: '900',
  },
  riskLabel: {
    color: '#fff',
    fontSize: 14,
  },
  cardFooter: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 40,
  },
  actionText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  weatherItem: {
    alignItems: 'center',
  },
  weatherValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  weatherLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  demoButton: {
    marginTop: 20,
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
})

