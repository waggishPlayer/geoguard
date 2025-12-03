'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireRole } from '../../hooks/useRoles'
import { sensorsService } from '../../services/sensors'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import Card from '../../components/Card'
import Table from '../../components/Table'

export default function SensorsPage() {
  const { user, hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const router = useRouter()
  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasAccess) {
      loadSensors()
    }
  }, [hasAccess])

  const loadSensors = async () => {
    try {
      const data = await sensorsService.getAll()
      setSensors(data)
    } catch (error) {
      console.error('Failed to load sensors:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      header: 'ID',
      key: 'id',
    },
    {
      header: 'Name',
      key: 'name',
    },
    {
      header: 'Type',
      key: 'sensor_type',
    },
    {
      header: 'Unit',
      key: 'unit',
      render: (val) => val || 'N/A',
    },
    {
      header: 'Status',
      key: 'is_active',
      render: (val) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
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
              title="Sensor Management"
              subtitle="Monitor and manage all slope monitoring sensors"
              actions={[
                <button
                  key="add"
                  onClick={() => router.push('/sensors/add')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  + Add Sensor
                </button>
              ]}
            >
              <Table
                columns={columns}
                data={sensors}
                onRowClick={(row) => router.push(`/sensors/${row.id}`)}
                emptyMessage="No sensors found. Add your first sensor to start monitoring."
              />
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

