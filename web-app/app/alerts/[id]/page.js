'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRequireRole } from '../../../hooks/useRoles'
import { alertsService } from '../../../services/alerts'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'
import RiskIndicator from '../../../components/RiskIndicator'

export default function AlertDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin', 'gov_authority'])
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acknowledging, setAcknowledging] = useState(false)

  useEffect(() => {
    if (hasAccess && id) {
      loadAlert()
    }
  }, [hasAccess, id])

  const loadAlert = async () => {
    try {
      const alerts = await alertsService.getAll()
      const found = alerts.find(a => a.id === parseInt(id))
      setAlert(found)
    } catch (error) {
      console.error('Failed to load alert:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async () => {
    setAcknowledging(true)
    try {
      await alertsService.acknowledge(id)
      await loadAlert()
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
      alert('Failed to acknowledge alert')
    } finally {
      setAcknowledging(false)
    }
  }

  if (!hasAccess || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!alert) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            <Card title="Alert Not Found">
              <p className="text-gray-600">The alert you're looking for doesn't exist.</p>
              <button
                onClick={() => router.push('/alerts')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Back to Alerts
              </button>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card
              title={`Alert #${alert.id}`}
              subtitle={`Created: ${new Date(alert.created_at).toLocaleString()}`}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="text-lg font-semibold">{alert.alert_type?.replace(/_/g, ' ').toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Severity</p>
                    <RiskIndicator riskLevel={alert.severity} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      alert.acknowledged
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {alert.acknowledged ? 'Acknowledged' : 'Active'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Message</h4>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{alert.message}</p>
                </div>

                {!alert.acknowledged && (
                  <div className="border-t pt-4">
                    <button
                      onClick={handleAcknowledge}
                      disabled={acknowledging}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                    >
                      {acknowledging ? 'Acknowledging...' : 'Acknowledge Alert'}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

