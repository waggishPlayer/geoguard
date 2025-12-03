'use client'

import { useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, loading, markAll, markOne } = useNotifications()

  const toggle = () => setOpen((prev) => !prev)

  const renderIcon = (type) => {
    switch (type) {
      case 'task':
        return '📝'
      case 'complaint':
        return '📸'
      case 'advisory':
        return '📣'
      case 'message':
        return '💬'
      default:
        return '🔔'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative p-2 hover:bg-blue-700 rounded-full transition"
        aria-label="Notifications"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 z-40">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <p className="font-semibold">Notifications</p>
              <p className="text-xs text-gray-500">
                {loading ? 'Loading...' : `${unreadCount} unread`}
              </p>
            </div>
            <button
              onClick={markAll}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No notifications yet</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markOne(notification.id)}
                  className={`w-full text-left px-4 py-3 flex space-x-3 hover:bg-gray-50 ${
                    notification.is_read ? 'opacity-70' : ''
                  }`}
                >
                  <span className="text-xl">{renderIcon(notification.type)}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{notification.title}</p>
                    <p className="text-xs text-gray-500">{notification.body}</p>
                    <span className="text-[11px] text-gray-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

