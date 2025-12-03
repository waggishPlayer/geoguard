'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '../../hooks/useRoles'
import { complaintsService } from '../../services/complaints'
import { slopesService } from '../../services/slopes'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import Card from '../../components/Card'
import Table from '../../components/Table'

export default function ComplaintsPage() {
  const { user } = useRequireAuth()
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComplaints()
  }, [])

  const loadComplaints = async () => {
    setLoading(true)
    try {
      const data = await complaintsService.getAll()
      setComplaints(data)
    } catch (error) {
      console.error('Failed to load complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = ['site_admin', 'super_admin'].includes(user?.role_name)

  const columns = [
    {
      header: 'ID',
      key: 'id',
    },
    {
      header: 'Description',
      key: 'description',
      render: (val) => <span className="truncate max-w-md">{val}</span>,
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
    {
      header: 'Action',
      key: 'action',
      render: (_, row) => (
        <button
          onClick={() => router.push(`/complaints/${row.id}`)}
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
        >
          View Details
        </button>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Card
              title={isAdmin ? "All Complaints" : "Complaints"}
              subtitle={isAdmin ? "Manage all rockfall reports" : "View and manage rockfall reports"}
              actions={[
                <button
                  key="new"
                  onClick={() => router.push('/complaints/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  + New Report
                </button>,
                user?.role_name === 'field_worker' && (
                  <button
                    key="my"
                    onClick={() => router.push('/complaints/my')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold"
                  >
                    My Reports
                  </button>
                ),
              ].filter(Boolean)}
            >
              <Table
                columns={columns}
                data={complaints}
                emptyMessage="No complaints found"
              />
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

