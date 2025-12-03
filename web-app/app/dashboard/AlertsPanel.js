'use client'

import { useEffect, useState } from 'react'
import { alertsService } from '../../services/alerts'
import { useWebSocket } from '../../hooks/useWebSocket'
import RiskIndicator from '../../components/RiskIndicator'

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const { alerts: wsAlerts } = useWebSocket()

  useEffect(() => {
    loadAlerts()
  }, [])

  useEffect(() => {
    if (Array.isArray(wsAlerts) && wsAlerts.length > 0) {
      setAlerts(prev => {
        // prepend socket alerts and keep up to 10
        const merged = [...wsAlerts, ...prev]
        // dedupe by id if needed
        const map = new Map()
        for (const a of merged) {
          map.set(a.id, a)
        }
        return Array.from(map.values()).slice(0, 10)
      })
    }
  }, [wsAlerts])

  const loadAlerts = async () => {
    try {
      const data = await alertsService.getAll()
      setAlerts(data.slice(0, 10)) // Show latest 10
    } catch (error) {
      console.error('Failed to load alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-600 bg-red-50 text-red-900'
      case 'high':
        return 'border-orange-500 bg-orange-50 text-orange-900'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 text-yellow-900'
      case 'low':
        return 'border-blue-500 bg-blue-50 text-blue-900'
      default:
        return 'border-gray-300 bg-gray-50 text-gray-900'
    }
  }

  const getAlertIcon = (alertType) => {
    if (alertType?.includes('rockfall') || alertType?.includes('crack')) {
      return '⚠️'
    }
    if (alertType?.includes('sensor')) {
      return '📡'
    }
    if (alertType?.includes('risk')) {
      return '🔴'
    }
    return '📢'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">🚨 Active Alerts</h2>
        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
          {alerts.filter(a => !a.acknowledged).length} Active
        </span>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-500 text-sm">All clear! No active alerts</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 transition hover:shadow-md ${getSeverityColor(alert.severity)} ${
                alert.acknowledged ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getAlertIcon(alert.alert_type)}</span>
                    <p className="font-semibold text-sm">{alert.alert_type?.replace(/_/g, ' ').toUpperCase()}</p>
                    {!alert.acknowledged && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium mb-2">{alert.message}</p>
                  <div className="flex items-center space-x-2">
                    <RiskIndicator riskLevel={alert.severity} />
                    <span className="text-xs text-gray-500">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

