'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireRole } from '../../hooks/useRoles'
import { slopesService } from '../../services/slopes'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import Card from '../../components/Card'
import Table from '../../components/Table'
import RiskIndicator from '../../components/RiskIndicator'

export default function SlopesPage() {
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const router = useRouter()
  const [slopes, setSlopes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasAccess) {
      loadSlopes()
    }
  }, [hasAccess])

  const loadSlopes = async () => {
    try {
      const data = await slopesService.getAll()
      setSlopes(data)
    } catch (error) {
      console.error('Failed to load slopes:', error)
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
      header: 'Description',
      key: 'description',
      render: (val) => <span className="truncate max-w-md">{val || 'N/A'}</span>,
    },
    {
      header: 'Risk Level',
      key: 'risk_level',
      render: (val) => <RiskIndicator riskLevel={val} />,
    },
    {
      header: 'Created',
      key: 'created_at',
      render: (val) => new Date(val).toLocaleDateString(),
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
              title="Slope Management"
              subtitle="Manage all monitored slopes and their risk levels"
              actions={[
                <button
                  key="add"
                  onClick={() => router.push('/slopes/add')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  + Add Slope
                </button>
              ]}
            >
              <Table
                columns={columns}
                data={slopes}
                onRowClick={(row) => router.push(`/slopes/${row.id}`)}
                emptyMessage="No slopes found. Add your first slope to start monitoring."
              />
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

