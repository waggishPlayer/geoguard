'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireRole } from '../../../../hooks/useRoles'
import { govtService } from '../../../../services/govt'
import { slopesService } from '../../../../services/slopes'
import Navbar from '../../../../components/Navbar'
import Sidebar from '../../../../components/Sidebar'
import Card from '../../../../components/Card'

export default function NewAdvisoryPage() {
  const { hasAccess } = useRequireRole(['gov_authority', 'super_admin'])
  const router = useRouter()
  const [slopes, setSlopes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    slopeId: '',
    message: '',
    severity: 'info',
  })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.message) {
      alert('Message is required')
      return
    }

    setSubmitting(true)
    try {
      await govtService.postAdvisory({
        slopeId: formData.slopeId || null,
        message: formData.message,
        severity: formData.severity,
      })
      router.push('/govt/advisories')
    } catch (error) {
      console.error('Failed to post advisory:', error)
      alert('Failed to post advisory')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hasAccess || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <Card
              title="Post New Advisory"
              subtitle="Issue warnings or advisories to field workers and site admins"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Slope (Optional)
                  </label>
                  <select
                    value={formData.slopeId}
                    onChange={(e) => setFormData({ ...formData, slopeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">General Advisory (All Slopes)</option>
                    {slopes.map((slope) => (
                      <option key={slope.id} value={slope.id}>
                        {slope.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advisory Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    placeholder="Enter the advisory message, warning, or instructions for field workers..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity Level *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">Info</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                  >
                    {submitting ? 'Posting...' : 'Post Advisory'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

