'use client'

import { useEffect, useState } from 'react'
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
import { sensorsService } from '../../services/sensors'

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

export default function SensorCharts() {
  const [chartData, setChartData] = useState(null)
  const [sensors, setSensors] = useState([])
  const [selectedSensor, setSelectedSensor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSensors()
  }, [])

  useEffect(() => {
    if (selectedSensor) {
      loadSensorData(selectedSensor)
    }
  }, [selectedSensor])

  const loadSensors = async () => {
    try {
      const data = await sensorsService.getAll()
      setSensors(data)
      if (data.length > 0) {
        setSelectedSensor(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load sensors:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSensorData = async (sensorId) => {
    try {
      const readings = await sensorsService.getReadings(sensorId, 50)
      
      if (readings.length === 0) {
        setChartData(null)
        return
      }

      const labels = readings
        .slice()
        .reverse()
        .map(r => new Date(r.time).toLocaleTimeString())

      const values = readings
        .slice()
        .reverse()
        .map(r => Number(r.value))

      const sensor = sensors.find(s => s.id === sensorId)
      const sensorName = sensor ? `${sensor.name} (${sensor.sensor_type})` : 'Sensor Reading'

      setChartData({
        labels,
        datasets: [
          {
            label: sensorName,
            data: values,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 4,
          }
        ]
      })
    } catch (error) {
      console.error('Failed to load sensor data:', error)
      setChartData(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">📊 Sensor Monitoring</h2>
        {sensors.length > 0 && (
          <select
            value={selectedSensor || ''}
            onChange={(e) => setSelectedSensor(parseInt(e.target.value))}
            className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500"
          >
            {sensors.map((sensor) => (
              <option key={sensor.id} value={sensor.id}>
                {sensor.name} ({sensor.sensor_type})
              </option>
            ))}
          </select>
        )}
      </div>
      {chartData ? (
        <div className="h-64">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-sm">No sensor data available</p>
            <p className="text-xs mt-1">Select a sensor to view readings</p>
          </div>
        </div>
      )}
    </div>
  )
}
