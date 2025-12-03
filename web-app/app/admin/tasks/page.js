'use client'

import { useState, useEffect } from 'react'
import { useRequireRole } from '../../../hooks/useRoles'
import { adminService } from '../../../services/admin'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'
import Table from '../../../components/Table'
import { slopesService } from '../../../services/slopes'

const STATUSES = ['pending', 'in_progress', 'completed']

export default function AdminTasksPage() {
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [slopes, setSlopes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    assignedTo: '',
    slopeId: '',
    title: '',
    description: '',
  })

  useEffect(() => {
    if (hasAccess) {
      loadUsers()
      loadSlopes()
      loadTasks(filter)
    }
  }, [hasAccess, filter])

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers()
      setUsers(data.filter((u) => u.role_id))
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const loadSlopes = async () => {
    try {
      const data = await slopesService.getAll()
      setSlopes(data)
    } catch (error) {
      console.error('Failed to load slopes:', error)
    }
  }

  const loadTasks = async (status) => {
    try {
      setLoading(true)
      const data = await adminService.getTasks(status === 'all' ? undefined : status)
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!formData.assignedTo || !formData.title) return
    try {
      setCreating(true)
      await adminService.createTask({
        assignedTo: Number(formData.assignedTo),
        slopeId: formData.slopeId ? Number(formData.slopeId) : null,
        title: formData.title,
        description: formData.description,
      })
      setFormData({ assignedTo: '', slopeId: '', title: '', description: '' })
      loadTasks(filter)
    } catch (error) {
      alert(error.message || 'Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Title', key: 'title' },
    {
      header: 'Assigned To',
      key: 'assigned_to',
      render: (val) => {
        const user = users.find((u) => u.id === val)
        return user ? `${user.name} (${user.role_name?.replace('_', ' ')})` : `User #${val}`
      },
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          val === 'completed'
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
      header: 'Created',
      key: 'created_at',
      render: (val) => new Date(val).toLocaleString(),
    },
  ]

  if (!hasAccess) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Card title="Create Task" subtitle="Assign work to field teams quickly">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateTask}>
                <div>
                  <label className="text-sm text-gray-600">Assign To *</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select user</option>
                    {users
                      .filter((u) => u.role_name === 'field_worker')
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Slope</label>
                  <select
                    value={formData.slopeId}
                    onChange={(e) => setFormData({ ...formData, slopeId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Optional</option>
                    {slopes.map((slope) => (
                      <option key={slope.id} value={slope.id}>
                        {slope.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                  >
                    {creating ? 'Assigning...' : 'Assign Task'}
                  </button>
                </div>
              </form>
            </Card>

            <Card
              title="Task Management"
              subtitle="View and filter all tasks"
              actions={[
                <select
                  key="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Statuses</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>,
              ]}
            >
              {loading ? (
                <div className="text-center py-6 text-gray-500">Loading tasks...</div>
              ) : (
                <Table columns={columns} data={tasks} emptyMessage="No tasks found" />
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

