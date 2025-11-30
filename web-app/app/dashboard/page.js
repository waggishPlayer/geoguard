'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import dynamic from 'next/dynamic'
const MapView = dynamic(() => import('./MapView'), { ssr: false })
// import MapView from './MapView'
import AlertsPanel from './AlertsPanel'
import SensorCharts from './SensorCharts'
import CameraFeed from './CameraFeed'
import { useAuth } from '../../hooks/useAuth'
import { alertsService } from '../../services/alerts'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sosMessage, setSosMessage] = useState('')
  const [sendingSOS, setSendingSOS] = useState(false)
  const [sosStatus, setSosStatus] = useState('')

  // Get user role for conditional rendering
  const isWorker = user?.role_name === 'field_worker'
  const isAdmin = ['site_admin', 'super_admin'].includes(user?.role_name)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  // Get user role for conditional rendering
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-gray-600">
              {isWorker 
                ? 'Monitor alerts and report any rockfall risks you observe'
                : 'Monitor slope conditions, sensor data, and manage rockfall detection system'
              }
            </p>
          </div>

          {/* Quick Actions for Workers */}
          {isWorker && (
            <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">⚠️ See Something Dangerous?</h2>
                  <p className="text-blue-100">Report rockfall risks, cracks, or loose rocks immediately</p>
                </div>
                <button
                  onClick={() => router.push('/complaints')}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg"
                >
                  📸 Report Issue
                </button>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">SOS / Emergency Broadcast</p>
                    <p className="text-xs text-blue-100">Notifies Site Admins & Govt Authorities instantly</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (sendingSOS) return
                      try {
                        setSendingSOS(true)
                        setSosStatus('')
                        await alertsService.sendSOS({ message: sosMessage })
                        setSosStatus('SOS sent successfully. Stay safe, help is on the way.')
                        setSosMessage('')
                      } catch (err) {
                        setSosStatus(err.message || 'Failed to send SOS')
                      } finally {
                        setSendingSOS(false)
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                    disabled={sendingSOS}
                  >
                    {sendingSOS ? 'Sending...' : '🚨 Send SOS'}
                  </button>
                </div>
                <textarea
                  value={sosMessage}
                  onChange={(e) => setSosMessage(e.target.value)}
                  placeholder="Describe your emergency (location, severity)..."
                  className="w-full mt-2 rounded-lg px-3 py-2 text-gray-800"
                  rows={2}
                />
                {sosStatus && (
                  <p className="text-xs mt-2 text-blue-50">
                    {sosStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Slopes</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
                <div className="text-3xl">🏔️</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600">-</p>
                </div>
                <div className="text-3xl">🚨</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sensors Active</p>
                  <p className="text-2xl font-bold text-green-600">-</p>
                </div>
                <div className="text-3xl">📡</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Reports</p>
                  <p className="text-2xl font-bold text-yellow-600">-</p>
                </div>
                <div className="text-3xl">📋</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <MapView />
            </div>
            <div className="space-y-6">
              <AlertsPanel />
              <SensorCharts />
            </div>
          </div>

          {/* Camera Feeds */}
          {isAdmin && (
            <div className="mt-6">
              <CameraFeed />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
