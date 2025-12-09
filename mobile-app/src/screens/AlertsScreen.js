import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { alertsService } from '../services/alerts'
import AlertCard from '../components/AlertCard'
import { COLORS } from '../utils/constants'

import authService from '../services/auth'

import { TouchableOpacity, Alert } from 'react-native'
import api from '../services/api'
import { ROLES } from '../utils/constants'

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    loadUserAndAlerts()
  }, [])

  const loadUserAndAlerts = async () => {
    try {
      console.log('[AlertsScreen] Loading user and alerts...')
      let u = await authService.getCurrentUser()
      
      // FALLBACK FOR TESTING: If no user logged in, show empty state
      if (!u) {
        console.log('[AlertsScreen] No user found in storage')
        setUser(null)
        setAlerts([])
        setLoading(false)
        return
      }
      
      console.log('[AlertsScreen] Current user:', u?.id, u?.role_name, u?.slope_id)
      setUser(u)
      await Promise.all([
        loadAlerts(u?.slope_id),
        loadPendingUsers(u)
      ])
    } catch (error) {
      console.error('[AlertsScreen] Failed to load user/alerts:', error?.message || error)
      setLoading(false)
    }
  }

  const loadAlerts = async (slopeId) => {
    try {
      console.log('[AlertsScreen] Loading alerts for slopeId:', slopeId)
      const data = await alertsService.getAll(slopeId)
      console.log('[AlertsScreen] Alerts loaded successfully:', data?.length || 0, 'alerts')
      setAlerts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('[AlertsScreen] Failed to load alerts:', error?.message || error)
      console.error('[AlertsScreen] Error details:', error?.response?.data || error)
      // Use demo alerts on error for testing
      setAlerts(getDemoAlerts())
    } finally {
      setLoading(false)
    }
  }

  const getDemoAlerts = () => [
    {
      id: 'demo-1',
      type: 'SOS',
      title: 'SOS Alert',
      message: '🚨 Landslide detected in Zone A with accelerating movement patterns',
      severity: 'critical',
      date: new Date(),
      source: 'System'
    },
    {
      id: 'demo-2',
      type: 'ADVISORY',
      title: 'Government Advisory',
      message: '📢 Official Advisory: Heavy rainfall expected in the region. Increase monitoring frequency.',
      severity: 'high',
      date: new Date(Date.now() - 3600000),
      source: 'Government'
    },
    {
      id: 'demo-3',
      type: 'SYSTEM',
      title: 'System Alert',
      message: '📊 System Alert: Sensor calibration recommended for better accuracy',
      severity: 'medium',
      date: new Date(Date.now() - 7200000),
      source: 'System'
    }
  ]

  const loadPendingUsers = async (currentUser) => {
    if (currentUser?.role_name === ROLES.SITE_ADMIN || currentUser?.role_name === ROLES.GOV_AUTHORITY) {
      try {
        console.log('[AlertsScreen] Loading pending users for role:', currentUser?.role_name)
        const res = await api.get('/auth/admin/pending-users')
        console.log('[AlertsScreen] Pending users response:', res?.data?.success)
        if (res.data.success) {
          setPendingUsers(res.data.data || [])
        }
      } catch (error) {
        console.log('[AlertsScreen] Failed to load pending users:', error?.message || error)
        setPendingUsers([])
      }
    }
  }

  const handleApprove = async (userId) => {
    try {
      await api.post('/auth/admin/approve-user', { userId })
      Alert.alert('Success', 'User approved')
      loadPendingUsers(user)
    } catch (error) {
      Alert.alert('Error', 'Failed to approve user')
    }
  }

  const renderPendingUser = ({ item }) => (
    <View style={styles.pendingCard}>
      <View>
        <Text style={styles.pendingName}>{item.name}</Text>
        <Text style={styles.pendingRole}>{item.role_name} • {item.email || item.phone}</Text>
      </View>
      <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
        <Text style={styles.approveText}>Approve</Text>
      </TouchableOpacity>
    </View>
  )

  const renderListHeader = () => {
    const displayAlerts = user ? alerts : getDemoAlerts()
    
    return (
      <>
        {!user && (
          <View style={[styles.section, styles.demoAlert]}>
            <Text style={styles.demoBadge}>📋 DEMO MODE</Text>
            <Text style={styles.demoText}>Sample alerts for demonstration. Log in to see actual alerts for your site.</Text>
          </View>
        )}
        {pendingUsers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Pending Approvals ({pendingUsers.length})</Text>
            {pendingUsers.map(u => (
              <View key={u.id}>{renderPendingUser({ item: u })}</View>
            ))}
          </View>
        )}
        {displayAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Recent Alerts ({displayAlerts.length})</Text>
          </View>
        )}
      </>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>✨ All Clear</Text>
      <Text style={styles.emptySubText}>
        {user ? 'No alerts for your site right now' : 'Log in to view alerts for your site'}
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={user ? alerts : getDemoAlerts()}
        keyExtractor={(item) => item.id?.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadUserAndAlerts()} />}
        ListHeaderComponent={renderListHeader()}
        renderItem={({ item }) => <AlertCard alert={item} />}
        ListEmptyComponent={!loading ? renderEmptyState() : null}
        contentContainerStyle={alerts.length === 0 && !loading && { flexGrow: 1 }}
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
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptySubText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  demoAlert: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  demoBadge: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  demoText: {
    color: '#FFD700',
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  pendingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  pendingName: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  pendingRole: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  approveBtn: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  approveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
})

