'use client'

import { useState, useEffect } from 'react'
import api from '../../services/api'
import RiskIndicator from '../../components/RiskIndicator'

export default function CameraFeed() {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCameraFeeds()
  }, [])

  const loadCameraFeeds = async () => {
    try {
      // TODO: Replace with actual camera snapshots endpoint when backend is ready
      // For now, this is a placeholder
      // Backend endpoint: GET /api/camera/snapshots
      setFeeds([])
    } catch (error) {
      console.error('Failed to load camera feeds:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">📷 Camera Snapshots</h2>
        <button
          onClick={loadCameraFeeds}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          🔄 Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {feeds.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-gray-500 text-sm">No camera snapshots available</p>
            <p className="text-gray-400 text-xs mt-1">
              Camera feeds will appear here when ML detection is active
            </p>
          </div>
        ) : (
          feeds.map((feed) => (
            <div
              key={feed.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative">
                <img
                  src={feed.image_url || '/placeholder-camera.jpg'}
                  alt={feed.slope_name}
                  className="w-full h-48 object-cover"
                />
                {feed.detection && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      ⚠️ Detected
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold text-gray-800">{feed.slope_name}</p>
                  {feed.risk_level && <RiskIndicator riskLevel={feed.risk_level} />}
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(feed.created_at).toLocaleString()}
                </p>
                {feed.detection && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                    <p className="font-semibold text-yellow-800">ML Detection:</p>
                    <p className="text-yellow-700">{JSON.stringify(feed.detection)}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

