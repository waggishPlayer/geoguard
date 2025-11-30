import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import LeafletMap from '../components/LeafletMap'
import { COLORS } from '../utils/constants'

const demoMarkers = [
  { id: '1', latitude: 11.1022, longitude: 79.1564, title: 'Demo Mine', subtitle: 'Active Monitoring', riskColor: '#f97316' },
]

export default function MapScreen() {
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setSelected(demoMarkers[0])
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <LeafletMap markers={demoMarkers} onMarkerPress={setSelected} />
      </View>
      <View style={styles.details}>
        <Text style={styles.title}>{selected?.title || 'Select a slope'}</Text>
        <Text style={styles.meta}>{selected?.subtitle || 'Tap markers to view live metadata.'}</Text>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  mapContainer: {
    flex: 1,
  },
  details: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  meta: {
    color: '#94a3b8',
    marginTop: 4,
  },
  placeholder: {
    color: '#cbd5f5',
    marginTop: 10,
    lineHeight: 20,
  },
})

