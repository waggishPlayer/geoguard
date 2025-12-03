'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../services/auth'

const ROLE_OPTIONS = [
  { id: 1, label: 'Field Worker', value: 1 },
  { id: 2, label: 'Site Admin', value: 2 },
  { id: 3, label: 'Government Authority', value: 3 },
]

const GOV_SUBROLES = ['Police', 'Fire & Rescue', 'Health', 'Disaster Response', 'Other']

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleId: ROLE_OPTIONS[0].value,
    department: GOV_SUBROLES[0],
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRoleChange = (e) => {
    setFormData({
      ...formData,
      roleId: Number(e.target.value)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        ...formData,
        roleId: Number(formData.roleId),
      }
      if (payload.roleId !== 3) {
        delete payload.department
      }
      const res = await authService.register(payload)
      if (res.success) {
        router.push('/auth/login')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="border p-2 w-full mb-3 rounded"
            required
          />

          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 w-full mb-3 rounded"
            required
          />

          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="border p-2 w-full mb-3 rounded"
            required
          />

          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="border p-2 w-full mb-3 rounded"
            minLength={6}
            required
          />

          {/* Role Selection */}
          <label className="block text-sm font-medium mb-2">Role</label>
          <select
            value={formData.roleId}
            onChange={handleRoleChange}
            className="border p-2 w-full rounded mb-3 text-black"
            required
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          {Number(formData.roleId) === 3 && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Government Sub Role</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="border p-2 w-full rounded text-black"
                required
              >
                {GOV_SUBROLES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded mt-3"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/auth/login" className="text-blue-600">Login</a>
        </p>
      </div>
    </div>
  )
}
