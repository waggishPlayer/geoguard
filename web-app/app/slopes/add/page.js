'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireRole } from '../../../hooks/useRoles'
import { slopesService } from '../../../services/slopes'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'

export default function AddSlopePage() {
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lat: '',
    lng: '',
    riskLevel: 'low',
    latDirection: 'N',
    lngDirection: 'E',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await slopesService.create(formData)
      router.push('/slopes')
    } catch (error) {
      console.error('Failed to add slope:', error)
      alert('Failed to add slope')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hasAccess) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <Card title="Add New Slope" subtitle="Register a new slope location for monitoring">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slope Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., North Slope, Pit Wall A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Describe the slope location, characteristics, and any relevant details..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude *
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={formData.latDirection}
                        onChange={(e) => setFormData({ ...formData, latDirection: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3"
                      >
                        <option value="N">N</option>
                        <option value="S">S</option>
                      </select>
                      <input
                        type="number"
                        step="any"
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                        required
                        placeholder="e.g., 20.5937"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude *
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={formData.lngDirection}
                        onChange={(e) => setFormData({ ...formData, lngDirection: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3"
                      >
                        <option value="E">E</option>
                        <option value="W">W</option>
                      </select>
                      <input
                        type="number"
                        step="any"
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                        required
                        placeholder="e.g., 78.9629"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Level
                  </label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
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
                    {submitting ? 'Adding...' : 'Add Slope'}
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

