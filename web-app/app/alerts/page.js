'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireRole } from '../../hooks/useRoles'
import { alertsService } from '../../services/alerts'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import Card from '../../components/Card'
import Table from '../../components/Table'
import RiskIndicator from '../../components/RiskIndicator'

export default function AlertsPage() {
  const { user, hasAccess } = useRequireRole(['site_admin', 'super_admin', 'gov_authority'])
  const router = useRouter()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasAccess) {
      loadAlerts()
    }
  }, [hasAccess])

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

  const handleAcknowledge = async (alertId) => {
    try {
      await alertsService.acknowledge(alertId)
      await loadAlerts()
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const columns = [
    {
      header: 'ID',
      key: 'id',
    },
    {
      header: 'Type',
      key: 'alert_type',
      render: (val) => <span className="font-semibold">{val?.replace(/_/g, ' ').toUpperCase()}</span>,
    },
    {
      header: 'Message',
      key: 'message',
      render: (val) => <span className="truncate max-w-md">{val}</span>,
    },
    {
      header: 'Severity',
      key: 'severity',
      render: (val) => <RiskIndicator riskLevel={val} />,
    },
    {
      header: 'Status',
      key: 'acknowledged',
      render: (val) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {val ? 'Acknowledged' : 'Active'}
        </span>
      ),
    },
    {
      header: 'Created',
      key: 'created_at',
      render: (val) => new Date(val).toLocaleString(),
    },
  ]

  if (!hasAccess || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Card
              title="Alerts Management"
              subtitle="View and manage all system alerts"
            >
              <Table
                columns={columns}
                data={alerts}
                onRowClick={(row) => router.push(`/alerts/${row.id}`)}
                emptyMessage="No alerts found"
              />
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

