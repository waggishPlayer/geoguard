'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRequireAuth } from '../../../hooks/useRoles'
import { complaintsService } from '../../../services/complaints'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Card from '../../../components/Card'

export default function ComplaintDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useRequireAuth()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const isAdmin = ['site_admin', 'super_admin'].includes(user?.role_name)

  useEffect(() => {
    if (id) {
      loadComplaint()
    }
  }, [id])

  const loadComplaint = async () => {
    try {
      setLoading(true)
      const detail = await complaintsService.getDetail(id)
      setComplaint(detail)
    } catch (error) {
      console.error('Failed to load complaint:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      await complaintsService.updateStatus(id, newStatus)
      await loadComplaint()
    } catch (error) {
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (!feedbackMessage.trim()) return
    try {
      setSubmittingFeedback(true)
      await complaintsService.sendFeedback(id, feedbackMessage)
      setFeedbackMessage('')
      await loadComplaint()
    } catch (error) {
      alert('Failed to send feedback')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            <Card title="Complaint Not Found">
              <p className="text-gray-600">The complaint you're looking for doesn't exist.</p>
              <button
                onClick={() => router.push('/complaints')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Back to Complaints
              </button>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  const timeline = [
    {
      id: 'created',
      label: 'Complaint submitted',
      message: complaint.description,
      created_at: complaint.created_at,
    },
    ...(complaint.feedback || []),
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <Card
              title={`Complaint #${complaint.id}`}
              subtitle={`Submitted ${new Date(complaint.created_at).toLocaleString()}`}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      complaint.status === 'resolved'
                        ? 'bg-green-100 text-green-800'
                        : complaint.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {complaint.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{complaint.description}</p>
                </div>

                {complaint.media?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Evidence</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {complaint.media.map((media) => (
                        <img
                          key={media.id}
                          src={media.url}
                          alt="Evidence"
                          className="w-full rounded-xl border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Admin Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={updating || complaint.status === 'in_progress'}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        Mark In Progress
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('resolved')}
                        disabled={updating || complaint.status === 'resolved'}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        Mark Resolved
                      </button>
                    </div>

                    <form onSubmit={handleFeedbackSubmit} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Send feedback to worker</label>
                      <textarea
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="Share detailed guidance or request more info..."
                      />
                      <button
                        type="submit"
                        disabled={submittingFeedback}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        {submittingFeedback ? 'Sending...' : 'Send Feedback'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Timeline" subtitle="Status changes and feedback">
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={`${event.id}-${index}`} className="flex items-start space-x-3">
                    <div className="flex flex-col items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mt-1"></span>
                      {index !== timeline.length - 1 && (
                        <span className="w-px h-10 bg-blue-200"></span>
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">
                        {event.event_type === 'status'
                          ? 'Status Update'
                          : event.id === 'created'
                          ? 'Complaint Submitted'
                          : 'Feedback'}
                      </p>
                      <p className="text-sm text-gray-600">{event.message}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

