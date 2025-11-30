'use client'

import { useState, useEffect } from 'react'
import { useRequireRole } from '../../../hooks/useRoles'
import { slopesService } from '../../../services/slopes'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'

export default function UploadSlopeFeaturesPage() {
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const [slopes, setSlopes] = useState([])
  const [selectedSlope, setSelectedSlope] = useState('')
  const [formData, setFormData] = useState({
    tilt_angle: '',
    rainfall: '',
    vibration: '',
    temperature: '',
    humidity: '',
  })
  const [submitting, setSubmitting] = useState(false)

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
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedSlope) {
      alert('Please select a slope')
      return
    }

    setSubmitting(true)
    try {
      // TODO: Replace with actual backend endpoint when manual data upload is implemented
      // Backend endpoint: POST /api/ml/manual-input
      // This will send manual sensor values to ML service for prediction
      
      const sensorData = {
        slopeId: parseInt(selectedSlope),
        features: {
          tilt_angle: parseFloat(formData.tilt_angle) || 0,
          rainfall: parseFloat(formData.rainfall) || 0,
          vibration: parseFloat(formData.vibration) || 0,
          temperature: parseFloat(formData.temperature) || 0,
          humidity: parseFloat(formData.humidity) || 0,
        },
      }

      // Placeholder - will call ML service when backend is ready
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Manual data submitted. ML prediction will be available when backend ML service is integrated.')
      
      // Reset form
      setFormData({
        tilt_angle: '',
        rainfall: '',
        vibration: '',
        temperature: '',
        humidity: '',
      })
    } catch (error) {
      console.error('Failed to submit data:', error)
      alert('Failed to submit manual data')
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
            <Card
              title="Manual Slope Feature Input"
              subtitle="Enter manual sensor readings for ML prediction"
            >
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This data will be sent to the ML service for risk prediction once backend integration is complete.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Slope *
                  </label>
                  <select
                    value={selectedSlope}
                    onChange={(e) => setSelectedSlope(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a slope...</option>
                    {slopes.map((slope) => (
                      <option key={slope.id} value={slope.id}>
                        {slope.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tilt Angle (degrees)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.tilt_angle}
                      onChange={(e) => setFormData({ ...formData, tilt_angle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rainfall (mm)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.rainfall}
                      onChange={(e) => setFormData({ ...formData, rainfall: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vibration (Hz)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.vibration}
                      onChange={(e) => setFormData({ ...formData, vibration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Humidity (%)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.humidity}
                    onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit for ML Prediction'}
                </button>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

