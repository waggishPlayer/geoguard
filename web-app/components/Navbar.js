'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import NotificationCenter from './NotificationCenter'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '../hooks/useLanguage'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useLanguage()

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800'
      case 'site_admin':
        return 'bg-blue-100 text-blue-800'
      case 'gov_authority':
        return 'bg-green-100 text-green-800'
      case 'field_worker':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <nav className="bg-gradient-to-b from-blue-700 via-blue-600 to-blue-700 shadow-lg flex flex-col text-white">
      <div className="flex flex-wrap items-center justify-between px-6 py-2 text-[13px] font-semibold tracking-wide">
        <span>{t('navTitle')}</span>
        <LanguageSwitcher />
      </div>
      <div className="h-14 flex items-center justify-between px-6 border-t border-white/10">
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold">🛡️ SIH Rockfall Detection</div>
          {pathname !== '/dashboard' && (
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm hover:underline"
            >
              Dashboard
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
        <NotificationCenter />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-2 hover:bg-blue-700 px-3 py-2 rounded transition"
          >
            <div className="text-right">
              <div className="font-medium text-sm">{user?.name || 'User'}</div>
              <div className="text-xs text-blue-200">{user?.email || ''}</div>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-semibold ${getRoleBadgeColor(user?.role_name)}`}>
              {user?.role_name?.replace('_', ' ').toUpperCase() || 'USER'}
            </div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white text-gray-800 shadow-xl rounded-lg w-48 border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200">
                <div className="font-semibold text-sm">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    router.push('/dashboard')
                    setMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  📊 Dashboard
                </button>
                {(user?.role_name === 'field_worker') && (
                  <button
                    onClick={() => {
                      router.push('/complaints')
                      setMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    📸 Report Issue
                  </button>
                )}
                <button
                  onClick={() => {
                    handleLogout()
                    setMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </nav>
  )
}
