'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireRole } from '../../../hooks/useRoles'
import { govtService } from '../../../services/govt'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'
import Table from '../../../components/Table'
import RiskIndicator from '../../../components/RiskIndicator'

export default function AdvisoriesPage() {
  const { hasAccess } = useRequireRole(['gov_authority', 'super_admin'])
  const router = useRouter()
  const [advisories, setAdvisories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasAccess) {
      loadAdvisories()
    }
  }, [hasAccess])

  const loadAdvisories = async () => {
    try {
      const data = await govtService.getAdvisories()
      setAdvisories(data)
    } catch (error) {
      console.error('Failed to load advisories:', error)
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
              title="Government Advisories"
              subtitle="View all posted advisories and warnings"
              actions={[
                <button
                  key="new"
                  onClick={() => router.push('/govt/advisories/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  + New Advisory
                </button>
              ]}
            >
              <Table
                columns={columns}
                data={advisories}
                onRowClick={(row) => router.push(`/govt/advisories/${row.id}`)}
                emptyMessage="No advisories posted yet"
              />
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

