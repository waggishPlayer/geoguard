'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRequireRole } from '../../../hooks/useRoles'
import { slopesService } from '../../../services/slopes'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'
import RiskIndicator from '../../../components/RiskIndicator'

export default function SlopeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const [slope, setSlope] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (hasAccess && id) {
      loadSlope()
    }
  }, [hasAccess, id])

  const loadSlope = async () => {
    try {
      const data = await slopesService.getById(id)
      setSlope(data)
    } catch (error) {
      console.error('Failed to load slope:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRiskUpdate = async (newRisk) => {
    setUpdating(true)
    try {
      await slopesService.updateRisk(id, newRisk)
      await loadSlope()
    } catch (error) {
      console.error('Failed to update risk:', error)
      alert('Failed to update risk level')
    } finally {
      setUpdating(false)
    }
  }

  if (!hasAccess || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!slope) {
    return <div className="flex items-center justify-center h-screen">Slope not found</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card
              title={slope.name}
              subtitle={`Created: ${new Date(slope.created_at).toLocaleString()}`}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {slope.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Risk Level</h4>
                    <RiskIndicator riskLevel={slope.risk_level} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
                    <p className="text-gray-900">
                      {slope.lat && slope.lng ? `${slope.lat}, ${slope.lng}` : 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Update Risk Level</h4>
                  <div className="flex space-x-2">
                    {['low', 'medium', 'high', 'critical'].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleRiskUpdate(level)}
                        disabled={updating || slope.risk_level === level}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          slope.risk_level === level
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        } disabled:opacity-50`}
                      >
                        {level.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

