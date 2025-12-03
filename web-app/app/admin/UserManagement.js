'use client'

import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState([])

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      // TODO: Add roles endpoint or fetch from auth service
      setRoles([
        { id: 1, name: 'field_worker' },
        { id: 2, name: 'site_admin' },
        { id: 3, name: 'gov_authority' },
        { id: 4, name: 'super_admin' },
      ])
    } catch (error) {
      console.error('Failed to load roles:', error)
    }
  }

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { roleId: newRoleId })
      loadUsers()
    } catch (error) {
      console.error('Failed to update user role:', error)
      alert('Failed to update user role')
    }
  }

  if (loading) {
    return <div className="p-6">Loading users...</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role_name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={user.role_id}
                    onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

