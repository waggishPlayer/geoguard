'use client'

import { useState, useEffect } from 'react'
import { useRequireRole } from '../../../hooks/useRoles'
import { mlService } from '../../../services/ml'
import { slopesService } from '../../../services/slopes'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function MLForecastPage() {
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const [slopes, setSlopes] = useState([])
  const [selectedSlope, setSelectedSlope] = useState('')
  const [forecast, setForecast] = useState(null)
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

  const handleForecast = async () => {
    if (!selectedSlope) {
      alert('Please select a slope')
      return
    }

    setLoading(true)
    try {
      const result = await mlService.forecast(selectedSlope)
      setMlStatus(result)
      setForecast(result?.data || null)
    } catch (error) {
      console.error('Forecast failed:', error)
      setMlStatus({
        ok: false,
        implemented: false,
        message: 'Unable to generate ML forecast',
      })
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }

  if (!hasAccess) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const chartData = forecast ? {
    labels: forecast.timestamps || [],
    datasets: [
      {
        label: 'Risk Forecast',
        data: forecast.forecast || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      }
    ]
  } : null

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card
              title="72-Hour Risk Forecast"
              subtitle="Get AI-powered risk predictions for the next 72 hours"
            >
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong>{' '}
                  {mlStatus?.message || 'ML is not integrated yet — placeholder only. Forecasts will appear once integration is complete.'}
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

                <button
                  onClick={handleForecast}
                  disabled={!selectedSlope || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Forecasting...' : 'Get 72-Hour Forecast'}
                </button>
              </div>
            </Card>

            {chartData && (
              <>
                <Card title="72-Hour Risk Forecast">
                  <div className="h-96">
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: true },
                          tooltip: {
                            callbacks: {
                              label: (context) => `Risk: ${(context.parsed.y * 100).toFixed(1)}%`
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 1,
                            ticks: {
                              callback: (value) => `${(value * 100).toFixed(0)}%`
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </Card>

                {forecast && forecast.current_assessment && (
                  <Card title="Current Assessment">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Base Risk</p>
                          <p className="text-lg font-bold">
                            {(forecast.current_assessment.base_risk * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Enhanced Risk</p>
                          <p className="text-lg font-bold">
                            {(forecast.current_assessment.enhanced_risk * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      {forecast.current_assessment.weather_data && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Weather Conditions</p>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            <p>Temperature: {forecast.current_assessment.weather_data.temperature}°C</p>
                            <p>Condition: {forecast.current_assessment.weather_data.weather_condition}</p>
                            <p>Rainfall (24h): {forecast.current_assessment.weather_data.rainfall_24h}mm</p>
                            <p>Rainfall (72h): {forecast.current_assessment.weather_data.rainfall_72h}mm</p>
                          </div>
                        </div>
                      )}
                      {forecast.current_assessment.alerts && forecast.current_assessment.alerts.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Alerts</p>
                          <div className="space-y-1">
                            {forecast.current_assessment.alerts.map((alert, idx) => (
                              <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm">
                                {alert}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

