'use client'

import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import { useAuth } from './useAuth'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'

export function useWebSocket() {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!user) return

    const s = io(SOCKET_URL, {
      auth: { token: typeof window !== 'undefined' ? localStorage.getItem('token') : null },
    })

    s.on('connect', () => {
      s.emit('join', user.id)
    })

    s.on('alert', (data) => {
      setAlerts((prev) => [data, ...prev].slice(0, 50))
    })

    s.on('notification', (data) => {
      setNotifications((prev) => [data, ...prev])
    })

    s.on('message:new', (data) => {
      setMessages((prev) => [data, ...prev])
    })

    setSocket(s)

    return () => s.disconnect()
  }, [user])

  return { socket, alerts, notifications, messages }
}
