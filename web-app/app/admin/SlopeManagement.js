'use client'

import { useEffect, useState } from 'react'
import api from '../../services/api'
import RiskIndicator from '../../components/RiskIndicator'

export default function SlopeManagement() {
  const [slopes, setSlopes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSlope, setNewSlope] = useState({
    name: '',
    description: '',
    lat: '',
    lng: '',
  })

  useEffect(() => {
    loadSlopes()
  }, [])

  const loadSlopes = async () => {
    try {
      const response = await api.get('/admin/slopes')
      setSlopes(response.data.data || [])
    } catch (error) {
      console.error('Failed to load slopes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSlope = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/slopes', newSlope)
      setNewSlope({ name: '', description: '', lat: '', lng: '' })
      setShowAddForm(false)
      loadSlopes()
    } catch (error) {
      console.error('Failed to add slope:', error)
      alert('Failed to add slope')
    }
  }

  const handleRiskUpdate = async (slopeId, riskLevel) => {
    try {
      await api.patch(`/admin/slopes/${slopeId}/risk`, { riskLevel })
      loadSlopes()
    } catch (error) {
      console.error('Failed to update risk level:', error)
      alert('Failed to update risk level')
    }
  }

  if (loading) {
    return <div className="p-6">Loading slopes...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Slope Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showAddForm ? 'Cancel' : 'Add Slope'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Slope</h3>
          <form onSubmit={handleAddSlope} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={newSlope.name}
                onChange={(e) => setNewSlope({ ...newSlope, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newSlope.description}
                onChange={(e) => setNewSlope({ ...newSlope, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={newSlope.lat}
                  onChange={(e) => setNewSlope({ ...newSlope, lat: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={newSlope.lng}
                  onChange={(e) => setNewSlope({ ...newSlope, lng: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Slope
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {slopes.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No slopes found
                </td>
              </tr>
            ) : (
              slopes.map((slope) => (
                <tr key={slope.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {slope.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {slope.description || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RiskIndicator riskLevel={slope.risk_level} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={slope.risk_level}
                      onChange={(e) => handleRiskUpdate(slope.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

