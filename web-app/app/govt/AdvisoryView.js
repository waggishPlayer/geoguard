'use client'

import { useState, useEffect } from 'react'
import { govtService } from '../../services/govt'
import { sensorsService } from '../../services/sensors'

export default function AdvisoryView() {
  const [advisories, setAdvisories] = useState([])
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('info')
  const [slopeId, setSlopeId] = useState(null)
  const [slopes, setSlopes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdvisories()
    loadSlopes()
  }, [])

  const loadSlopes = async () => {
    const data = await sensorsService.getAll() // slope list is inside admin/sensors? we adjust soon
    setSlopes(data)
  }

  const loadAdvisories = async () => {
    setLoading(true)
    try {
      const data = await govtService.getAdvisories()
      setAdvisories(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!message) return alert('Message cannot be empty')

    try {
      await govtService.postAdvisory({ slopeId, message, severity })
      setMessage('')
      setSeverity('info')
      await loadAdvisories()
    } catch (error) {
      console.error('Failed to post advisory', error)
      alert('Failed to post advisory')
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow space-y-4">

      {/* Advisory form */}
      <div>
        <h2 className="font-bold mb-2">Post New Advisory</h2>

        <select
          value={slopeId || ''}
          onChange={e => setSlopeId(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        >
          <option value="">Select slope</option>
          {slopes.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <textarea
          className="border p-2 rounded w-full"
          rows={3}
          placeholder="Enter advisory message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />

        <select
          value={severity}
          onChange={e => setSeverity(e.target.value)}
          className="border p-2 rounded w-full mt-2"
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>

        <button
          onClick={handleSubmit}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Advisory
        </button>
      </div>

      {/* Advisory list */}
      <div>
        <h2 className="font-bold mb-2">Advisory History</h2>

        {loading ? (
          <p>Loading...</p>
        ) : advisories.length === 0 ? (
          <p className="text-gray-500">No advisories found</p>
        ) : (
          <div className="space-y-2">
            {advisories.map(a => (
              <div key={a.id} className="p-3 rounded border bg-gray-50">
                <p className="font-semibold">{a.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(a.created_at).toLocaleString()}
                </p>
                <p className="text-xs">Severity: {a.severity}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
