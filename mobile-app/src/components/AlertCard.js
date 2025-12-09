import { StyleSheet, Text, View } from 'react-native'
import { COLORS } from '../utils/constants'

export default function AlertCard({ alert }) {
  const dateStr = alert.date ? new Date(alert.date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Just now'

  const getSeverityStyle = () => {
    const severity = alert.severity?.toLowerCase() || 'info'
    switch (severity) {
      case 'critical':
      case 'danger':
        return styles.critical
      case 'high':
      case 'warning':
        return styles.high
      case 'medium':
        return styles.medium
      default:
        return {}
    }
  }

  const getTypeColor = () => {
    const type = alert.type?.toUpperCase() || 'ALERT'
    switch (type) {
      case 'SOS':
        return styles.sosBadge
      case 'ADVISORY':
        return styles.advisoryBadge
      case 'REPORT':
        return styles.reportBadge
      case 'SYSTEM':
        return styles.systemBadge
      default:
        return {}
    }
  }

  return (
    <View style={[styles.card, getSeverityStyle()]}>
      <View style={styles.headerRow}>
        <Text style={[styles.typeBadge, getTypeColor()]}>{alert.type || 'ALERT'}</Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>
      <Text style={styles.title}>{alert.title}</Text>
      <Text style={styles.body}>{alert.message}</Text>
      <View style={styles.footerRow}>
        <Text style={styles.footer}>📍 {alert.source || 'System'}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.info,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  critical: {
    borderLeftColor: '#ff4444',
    backgroundColor: '#2a1515',
  },
  high: {
    borderLeftColor: '#ffaa00',
    backgroundColor: '#2a2015',
  },
  medium: {
    borderLeftColor: '#ffee00',
    backgroundColor: '#2a2515',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sosBadge: {
    backgroundColor: '#ff4444',
  },
  advisoryBadge: {
    backgroundColor: '#4488ff',
  },
  reportBadge: {
    backgroundColor: '#44ff88',
  },
  systemBadge: {
    backgroundColor: '#ffaa00',
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: 9,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  body: {
    color: '#e0e0e8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  footerRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footer: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
})

