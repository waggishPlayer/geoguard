'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { t } = useLanguage()

  const isActive = (path) => pathname === path

  const menuItems = [
    { path: '/dashboard', label: t('dashboard'), icon: '📊' },
    { path: '/tasks', label: t('tasks'), icon: '📝', roles: ['field_worker', 'site_admin', 'super_admin'] },
    { path: '/complaints', label: t('complaints'), icon: '📸', roles: ['field_worker', 'site_admin', 'super_admin'] },
    { path: '/messages', label: t('messages'), icon: '💬', roles: ['site_admin', 'gov_authority', 'super_admin'] },
    { path: '/sensors', label: t('sensors'), icon: '📡', roles: ['site_admin', 'super_admin'] },
    { path: '/slopes', label: t('slopes'), icon: '🏔️', roles: ['site_admin', 'super_admin'] },
    { path: '/alerts', label: t('alerts'), icon: '🚨', roles: ['site_admin', 'super_admin', 'gov_authority'] },
    { path: '/ml/predictions', label: t('ml'), icon: '🤖', roles: ['site_admin', 'super_admin'] },
    { path: '/uploads/sensors', label: t('uploads'), icon: '📤', roles: ['site_admin', 'super_admin'] },
    { path: '/admin', label: t('admin'), icon: '⚙️', roles: ['site_admin', 'super_admin'] },
    { path: '/govt', label: t('govt'), icon: '🏛️', roles: ['gov_authority', 'super_admin'] },
    { path: '/profile', label: t('profile'), icon: '👤' },
  ]

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    if (!user || !user.role_name) return false;
    return item.roles.includes(user.role_name);
  });  

  return (
    <aside className="w-64 bg-gray-800 text-white h-screen flex flex-col overflow-y-auto">
      <div className="p-6 flex-1">
        <h2 className="text-xl font-bold mb-6">{t('dashboard')}</h2>
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}

