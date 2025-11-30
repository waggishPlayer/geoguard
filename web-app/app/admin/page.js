'use client'

import { useRouter } from 'next/navigation'
import { useRequireRole } from '../../hooks/useRoles'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import Card from '../../components/Card'

export default function AdminPage() {
  const { user, hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const router = useRouter()

  if (!hasAccess) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const adminCards = [
    {
      title: 'Users',
      subtitle: 'Manage system users and roles',
      path: '/admin/users',
      icon: '👥',
    },
    {
      title: 'Roles',
      subtitle: 'View system roles and permissions',
      path: '/admin/roles',
      icon: '🔐',
      roles: ['super_admin'],
    },
    {
      title: 'Sensors',
      subtitle: 'Monitor and configure sensors',
      path: '/admin/sensors',
      icon: '📡',
    },
    {
      title: 'Slopes',
      subtitle: 'Manage slope locations',
      path: '/admin/slopes',
      icon: '🏔️',
    },
    {
      title: 'Tasks',
      subtitle: 'Assign and track tasks',
      path: '/admin/tasks',
      icon: '📋',
    },
    {
      title: 'ML Predictions',
      subtitle: 'View ML model predictions',
      path: '/admin/ml',
      icon: '🤖',
    },
  ]

  // Filter cards based on user role
  const filteredCards = adminCards.filter(card => {
    if (!card.roles) return true
    return user && card.roles.includes(user.role_name)
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card) => (
                <Card
                  key={card.path}
                  title={
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{card.icon}</span>
                      <span>{card.title}</span>
                    </div>
                  }
                  subtitle={card.subtitle}
                  actions={[
                    <button
                      key="view"
                      onClick={() => router.push(card.path)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Manage
                    </button>
                  ]}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

