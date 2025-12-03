'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireRole } from '../../../hooks/useRoles'
import { complaintsService } from '../../../services/complaints'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'
import Table from '../../../components/Table'

export default function MyComplaintsPage() {
  const { user, hasAccess } = useRequireRole(['field_worker', 'site_admin', 'super_admin'])
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasAccess) {
      loadComplaints()
    }
  }, [hasAccess])

  const loadComplaints = async () => {
    try {
      const data = await complaintsService.getByUser()
      setComplaints(data)
    } catch (error) {
      console.error('Failed to load complaints:', error)
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
      header: 'Description',
      key: 'description',
      render: (val) => <span className="truncate max-w-xs">{val}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          val === 'resolved'
            ? 'bg-green-100 text-green-800'
            : val === 'in_progress'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {val?.toUpperCase() || 'PENDING'}
        </span>
      ),
    },
    {
      header: 'Submitted',
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
              title="My Reports"
              subtitle="View and track all your submitted rockfall reports"
              actions={[
                <button
                  key="new"
                  onClick={() => router.push('/complaints/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  + New Report
                </button>
              ]}
            >
              <Table
                columns={columns}
                data={complaints}
                onRowClick={(row) => router.push(`/complaints/${row.id}`)}
                emptyMessage="No complaints submitted yet. Click 'New Report' to submit one."
              />
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

