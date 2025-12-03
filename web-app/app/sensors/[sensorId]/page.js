'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useRequireRole } from '../../../hooks/useRoles'
import { sensorsService } from '../../../services/sensors'
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
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function SensorDetailPage() {
  const { sensorId } = useParams()
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const [sensor, setSensor] = useState(null)
  const [readings, setReadings] = useState([])
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasAccess && sensorId) {
      loadSensorData()
    }
  }, [hasAccess, sensorId])

  const loadSensorData = async () => {
    try {
      // Try to get sensor by ID, fallback to getting from list
      let sensorData
      try {
        sensorData = await sensorsService.getById(sensorId)
      } catch (error) {
        // If getById fails, get from list
        const sensors = await sensorsService.getAll()
        sensorData = sensors.find(s => s.id === parseInt(sensorId))
      }
      
      if (!sensorData) {
        setLoading(false)
        return
      }
      setSensor(sensorData)
      
      const readingsData = await sensorsService.getReadings(sensorId, 100)
      setReadings(readingsData)

      if (readingsData.length > 0) {
        const labels = readingsData
          .slice()
          .reverse()
          .map(r => new Date(r.time).toLocaleTimeString())
        const values = readingsData
          .slice()
          .reverse()
          .map(r => Number(r.value))

        setChartData({
          labels,
          datasets: [
            {
              label: `${sensorData.name} (${sensorData.sensor_type})`,
              data: values,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4,
            }
          ]
        })
      }
    } catch (error) {
      console.error('Failed to load sensor data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!hasAccess || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!sensor) {
    return <div className="flex items-center justify-center h-screen">Sensor not found</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Card title={`Sensor: ${sensor.name}`} subtitle={`Type: ${sensor.sensor_type} | Unit: ${sensor.unit || 'N/A'}`}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`text-lg font-semibold ${sensor.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {sensor.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Readings</p>
                  <p className="text-lg font-semibold">{readings.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Reading</p>
                  <p className="text-lg font-semibold">
                    {readings.length > 0 ? new Date(readings[0].time).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>

            {chartData && (
              <Card title="Reading History">
                <div className="h-96">
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true },
                      },
                    }}
                  />
                </div>
              </Card>
            )}

            <Card title="Recent Readings">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {readings.slice(0, 20).map((reading, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(reading.time).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{reading.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            reading.status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {reading.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

