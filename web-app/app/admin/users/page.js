'use client'

import { useState, useEffect } from 'react'
import { useRequireRole } from '../../../hooks/useRoles'
import { adminService } from '../../../services/admin'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'
import Table from '../../../components/Table'

export default function AdminUsersPage() {
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasAccess) {
      loadUsers()
      loadRoles()
    }
  }, [hasAccess])

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const data = await adminService.getRoles()
      setRoles(data)
    } catch (error) {
      console.error('Failed to load roles:', error)
      setRoles([])
    }
  }

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      await adminService.updateUserRole(userId, newRoleId)
      await loadUsers()
    } catch (error) {
      console.error('Failed to update role:', error)
      alert('Failed to update user role')
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
      header: 'Email',
      key: 'email',
    },
    {
      header: 'Phone',
      key: 'phone',
      render: (val) => val || 'N/A',
    },
    {
      header: 'Role',
      key: 'role_id',
      render: (val, row) => (
        <select
          value={val}
          onChange={(e) => handleRoleChange(row.id, parseInt(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
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
              title="User Management"
              subtitle="Manage all system users and their roles"
            >
              <Table
                columns={columns}
                data={users}
                emptyMessage="No users found"
              />
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

