'use client'

import { useState, useEffect } from 'react'
import { useRequireRole } from '../../../hooks/useRoles'
import { mlService } from '../../../services/ml'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'
import Table from '../../../components/Table'
import RiskIndicator from '../../../components/RiskIndicator'

export default function AdminMLPage() {
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const [predictions, setPredictions] = useState([])
  const [mlStatus, setMlStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasAccess) {
      loadPredictions()
    }
  }, [hasAccess])

  const loadPredictions = async () => {
    try {
      const result = await mlService.getPredictions()
      setMlStatus(result)
      const predictionData = Array.isArray(result?.data?.predictions)
        ? result.data.predictions
        : result?.data || []
      setPredictions(predictionData)
    } catch (error) {
      console.error('Failed to load predictions:', error)
      setPredictions([])
      setMlStatus({
        ok: false,
        implemented: false,
        message: 'Unable to load ML predictions',
      })
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      header: 'ID',
      key: 'id',
    },
    {
      header: 'Slope ID',
      key: 'slope_id',
    },
    {
      header: 'Risk Score',
      key: 'risk_score',
      render: (val) => (
        <span className="font-semibold">
          {val ? (parseFloat(val) * 100).toFixed(1) + '%' : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Prediction',
      key: 'prediction',
      render: (val) => {
        if (!val) return 'N/A'
        const pred = typeof val === 'string' ? JSON.parse(val) : val
        return pred.risk_level || 'N/A'
      },
    },
    {
      header: 'Created',
      key: 'created_at',
      render: (val) => new Date(val).toLocaleString(),
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
          <div className="max-w-7xl mx-auto space-y-6">
            <Card
              title="ML Predictions"
              subtitle="View all machine learning risk predictions"
            >
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong>{' '}
                  {mlStatus?.message || 'ML is not integrated yet — placeholder only. This dashboard will show real predictions after integration.'}
                </p>
              </div>
              <Table
                columns={columns}
                data={predictions}
                emptyMessage="No predictions available. ML service integration pending."
              />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                title="Model Status"
                subtitle="Current ML model information"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Model Status</p>
                    <p className="text-lg font-semibold text-yellow-600">Pending Integration</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Model Version</p>
                    <p className="text-lg font-semibold">N/A</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Training</p>
                    <p className="text-lg font-semibold">N/A</p>
                  </div>
                </div>
              </Card>

              <Card
                title="Prediction Statistics"
                subtitle="Summary of ML predictions"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Total Predictions</p>
                    <p className="text-lg font-semibold">{predictions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Risk Score</p>
                    <p className="text-lg font-semibold">
                      {predictions.length > 0
                        ? (predictions.reduce((sum, p) => sum + (parseFloat(p.risk_score) || 0), 0) / predictions.length * 100).toFixed(1) + '%'
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

