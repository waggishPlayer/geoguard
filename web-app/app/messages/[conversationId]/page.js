'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'
import Navbar from '../../../components/Navbar'
import { useRequireRole } from '../../../hooks/useRoles'
import { messagesService } from '../../../services/messages'
import { useWebSocket } from '../../../hooks/useWebSocket'

export default function ConversationPage() {
  const { conversationId } = useParams()
  const { user, hasAccess } = useRequireRole(['site_admin', 'gov_authority', 'super_admin'])
  const { messages: wsMessages } = useWebSocket()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (hasAccess && conversationId) {
      loadMessages()
    }
  }, [hasAccess, conversationId])

  useEffect(() => {
    if (!wsMessages || wsMessages.length === 0) return
    const latest = wsMessages[0]
    if (latest?.conversation_id?.toString() === conversationId?.toString()) {
      setMessages((prev) => {
        const exists = prev.find((msg) => msg.id === latest.id)
        if (exists) return prev
        return [...prev, latest]
      })
      scrollToBottom()
    }
  }, [wsMessages, conversationId])

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      const data = await messagesService.getMessages(conversationId)
      setMessages(data)
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      setError(err.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    try {
      setSending(true)
      const message = await messagesService.sendMessage(conversationId, { body: input })
      setMessages((prev) => [...prev, message])
      setInput('')
      scrollToBottom()
    } catch (err) {
      setError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (!hasAccess) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Conversation #{conversationId}</p>
                <p className="text-xs text-gray-500">Secure channel</p>
              </div>
              <button
                onClick={loadMessages}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>

            <div className="h-[60vh] overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
              {loading ? (
                <div className="text-center text-gray-400">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((message) => {
                  const isMine = message.sender_id === user?.id
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          isMine ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.body}</p>
                        <span className="text-[10px] opacity-70 block mt-1">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {error && (
              <div className="px-6 py-2 text-sm text-red-600 border-t border-red-100 bg-red-50">
                {error}
              </div>
            )}

            <form onSubmit={handleSend} className="border-t border-gray-100 flex items-center px-6 py-4 space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

