'use client'

import { useState, useEffect } from 'react'
import { useRequireRole } from '../../../hooks/useRoles'
import { mlService } from '../../../services/ml'
import { slopesService } from '../../../services/slopes'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'

export default function MLExplainPage() {
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const [slopes, setSlopes] = useState([])
  const [selectedSlope, setSelectedSlope] = useState('')
  const [predictionId, setPredictionId] = useState('')
  const [explanation, setExplanation] = useState(null)
  const [mlStatus, setMlStatus] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const handleExplain = async () => {
    if (!selectedSlope || !predictionId) {
      alert('Please select a slope and enter prediction ID')
      return
    }

    setLoading(true)
    try {
      const result = await mlService.explain(selectedSlope, predictionId)
      setMlStatus(result)
      setExplanation(result?.data || null)
    } catch (error) {
      console.error('Explanation failed:', error)
      setMlStatus({
        ok: false,
        implemented: false,
        message: 'Unable to generate ML explanation',
      })
      setExplanation(null)
    } finally {
      setLoading(false)
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
          <div className="max-w-4xl mx-auto space-y-6">
            <Card
              title="ML Model Explainability"
              subtitle="Understand which features contribute most to risk predictions"
            >
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong>{' '}
                  {mlStatus?.message || 'ML is not integrated yet — placeholder only. Explainability results will appear once integration is complete.'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Slope
                  </label>
                  <select
                    value={selectedSlope}
                    onChange={(e) => setSelectedSlope(e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prediction ID
                  </label>
                  <input
                    type="text"
                    value={predictionId}
                    onChange={(e) => setPredictionId(e.target.value)}
                    placeholder="Enter prediction ID from ML predictions"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleExplain}
                  disabled={!selectedSlope || !predictionId || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Generating Explanation...' : 'Get SHAP Explanation'}
                </button>
              </div>
            </Card>

            {explanation && (
              <>
                <Card title="SHAP Explanation Results">
                  <div className="space-y-4">
                    {explanation.explanation && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-gray-800">{explanation.explanation}</p>
                        </div>
                      </div>
                    )}

                    {explanation.shap_values && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">SHAP Values (Feature Contributions)</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-3">
                            {Object.entries(explanation.shap_values)
                              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                              .map(([feature, value]) => (
                                <div key={feature} className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700 capitalize">
                                    {feature.replace(/_/g, ' ')}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <div className="w-40 bg-gray-200 rounded-full h-3">
                                      <div
                                        className={`h-3 rounded-full ${
                                          value > 0 ? 'bg-red-500' : 'bg-green-500'
                                        }`}
                                        style={{
                                          width: `${Math.min(Math.abs(value) * 100, 100)}%`,
                                          marginLeft: value < 0 ? 'auto' : '0'
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm font-mono w-16 text-right">
                                      {value > 0 ? '+' : ''}{value.toFixed(3)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {explanation.feature_importance && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Feature Importance Levels</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(explanation.feature_importance).map(([feature, level]) => (
                              <div key={feature} className="flex items-center justify-between p-2 bg-white rounded">
                                <span className="text-sm text-gray-700 capitalize">
                                  {feature.replace(/_/g, ' ')}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    level === 'high'
                                      ? 'bg-red-100 text-red-800'
                                      : level === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {level}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

