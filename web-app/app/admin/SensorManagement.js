'use client'

import { useEffect, useState } from 'react'
import { sensorsService } from '../../services/sensors'
import api from '../../services/api'

export default function SensorManagement() {
  const [sensors, setSensors] = useState([])
  const [slopes, setSlopes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSensor, setNewSensor] = useState({
    slopeId: '',
    name: '',
    sensorType: '',
    unit: '',
  })

  useEffect(() => {
    loadSensors()
    loadSlopes()
  }, [])

  const loadSensors = async () => {
    try {
      const data = await sensorsService.getAll()
      setSensors(data)
    } catch (error) {
      console.error('Failed to load sensors:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSlopes = async () => {
    try {
      // TODO: Add slopes endpoint or fetch from admin service
      const response = await api.get('/admin/slopes')
      setSlopes(response.data.data || [])
    } catch (error) {
      console.error('Failed to load slopes:', error)
    }
  }

  const handleAddSensor = async (e) => {
    e.preventDefault()
    try {
      await sensorsService.create(newSensor)
      setNewSensor({ slopeId: '', name: '', sensorType: '', unit: '' })
      setShowAddForm(false)
      loadSensors()
    } catch (error) {
      console.error('Failed to add sensor:', error)
      alert('Failed to add sensor')
    }
  }

  if (loading) {
    return <div className="p-6">Loading sensors...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sensor Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showAddForm ? 'Cancel' : 'Add Sensor'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Sensor</h3>
          <form onSubmit={handleAddSensor} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slope
              </label>
              <select
                value={newSensor.slopeId}
                onChange={(e) => setNewSensor({ ...newSensor, slopeId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a slope</option>
                {slopes.map((slope) => (
                  <option key={slope.id} value={slope.id}>
                    {slope.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sensor Name
              </label>
              <input
                type="text"
                value={newSensor.name}
                onChange={(e) => setNewSensor({ ...newSensor, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sensor Type
              </label>
              <select
                value={newSensor.sensorType}
                onChange={(e) => setNewSensor({ ...newSensor, sensorType: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="tilt">Tilt</option>
                <option value="vibration">Vibration</option>
                <option value="rainfall">Rainfall</option>
                <option value="manual_input">Manual Input</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                value={newSensor.unit}
                onChange={(e) => setNewSensor({ ...newSensor, unit: e.target.value })}
                placeholder="e.g., degrees, mm, Hz"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Sensor
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
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sensors.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No sensors found
                </td>
              </tr>
            ) : (
              sensors.map((sensor) => (
                <tr key={sensor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sensor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.sensor_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.unit || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        sensor.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sensor.is_active ? 'Active' : 'Inactive'}
                    </span>
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

