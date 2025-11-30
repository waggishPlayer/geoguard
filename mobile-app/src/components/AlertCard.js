import { StyleSheet, Text, View } from 'react-native'
import { COLORS } from '../utils/constants'

export default function AlertCard({ alert }) {
  return (
    <View style={[styles.card, alert?.severity === 'high' && styles.danger]}>
      <Text style={styles.title}>{alert.title || 'Pending ML Alert'}</Text>
      <Text style={styles.meta}>{alert.category || 'Unknown Category'}</Text>
      <Text style={styles.body}>{alert.message || 'ML integration placeholder — identical to web dashboard messaging.'}</Text>
      <Text style={styles.footer}>
        {alert.location || 'Unknown Location'} · {alert.time || 'N/A'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  danger: {
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  meta: {
    color: COLORS.accent,
    marginTop: 4,
    fontSize: 12,
  },
  body: {
    color: '#cbd5f5',
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    marginTop: 10,
    fontSize: 11,
    color: '#94a3b8',
  },
})

