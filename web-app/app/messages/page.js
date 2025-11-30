'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import { useRequireRole } from '../../hooks/useRoles'
import { messagesService } from '../../services/messages'

export default function MessagesPage() {
  const { user, hasAccess } = useRequireRole(['site_admin', 'gov_authority', 'super_admin'])
  const router = useRouter()
  const [conversations, setConversations] = useState([])
  const [participants, setParticipants] = useState([])
  const [selectedParticipant, setSelectedParticipant] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [departmentFilter, setDepartmentFilter] = useState('all')

  useEffect(() => {
    if (hasAccess) {
      loadData()
    }
  }, [hasAccess])

  const loadData = async () => {
    try {
      setLoading(true)
      const [conversationData, participantData] = await Promise.all([
        messagesService.getConversations(),
        messagesService.getParticipants(),
      ])
      setConversations(conversationData)
      setParticipants(participantData)
    } catch (err) {
      setError(err.message || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const handleStartConversation = async (e) => {
    e.preventDefault()
    if (!selectedParticipant) return

    try {
      setCreating(true)
      const convo = await messagesService.startConversation(Number(selectedParticipant))
      setSelectedParticipant('')
      router.push(`/messages/${convo.id}`)
    } catch (err) {
      setError(err.message || 'Unable to start conversation')
    } finally {
      setCreating(false)
    }
  }

  if (!hasAccess) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const departmentOptions = Array.from(
    new Set(participants.map((p) => p.department || 'General'))
  )

  const filteredParticipants = participants.filter((participant) => {
    if (departmentFilter === 'all') return true
    return (participant.department || 'General') === departmentFilter
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Messaging Hub</h1>
                <p className="text-gray-500 text-sm">
                  Secure communication between authorities and site admins
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card
                title="Conversations"
                subtitle="Select a thread to view messages"
              >
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No active conversations yet</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {conversations.map((conversation) => (
                      <li key={conversation.id}>
                        <button
                          onClick={() => router.push(`/messages/${conversation.id}`)}
                          className="flex w-full justify-between items-center px-3 py-4 hover:bg-gray-50 rounded-lg transition"
                        >
                          <div>
                            <p className="font-semibold text-gray-800">
                              {conversation.site_admin_name || conversation.gov_name}
                            </p>
                            {conversation.gov_department && (
                              <p className="text-xs text-gray-500">
                                {conversation.gov_department}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Updated {new Date(conversation.last_message_at).toLocaleString()}
                            </p>
                          </div>
                          <span className="text-xs text-blue-600">Open ➜</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card
                title="Start a Conversation"
                subtitle="Select a counterpart and send your first message"
              >
                <form className="space-y-4" onSubmit={handleStartConversation}>
                  {user?.role_name === 'site_admin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by sub-role
                      </label>
                      <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All</option>
                        {departmentOptions.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {user?.role_name === 'site_admin' ? 'Government Authority' : 'Site Admin'}
                    </label>
                    <select
                      value={selectedParticipant}
                      onChange={(e) => setSelectedParticipant(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select recipient...</option>
                      {filteredParticipants.map((participant) => (
                        <option key={participant.id} value={participant.id}>
                          {participant.name} — {participant.email}
                          {participant.department ? ` (${participant.department})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
                  >
                    {creating ? 'Creating conversation...' : 'Start Conversation'}
                  </button>
                </form>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

