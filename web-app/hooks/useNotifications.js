import { useEffect, useState } from 'react'
import { notificationsService } from '../services/notifications'
import { useWebSocket } from './useWebSocket'

export function useNotifications() {
  const { notifications: wsNotifications } = useWebSocket()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationsService.list()
      setNotifications(data)
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useEffect(() => {
    if (!wsNotifications || wsNotifications.length === 0) return

    setNotifications((prev) => {
      const map = new Map(prev.map((n) => [n.id, n]))
      wsNotifications.forEach((note) => {
        if (!note?.id) return
        if (!map.has(note.id)) {
          map.set(note.id, note)
        }
      })
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
    })
  }, [wsNotifications])

  const markAll = async () => {
    await notificationsService.markAll()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const markOne = async (notificationId) => {
    await notificationsService.markOne(notificationId)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    )
  }

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.is_read).length,
    loading,
    error,
    reload: loadNotifications,
    markAll,
    markOne,
  }
}

