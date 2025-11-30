'use client'

import { useRouter } from 'next/navigation'
import { useRequireRole } from '../../hooks/useRoles'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import Card from '../../components/Card'

export default function GovtPage() {
  const { hasAccess } = useRequireRole(['gov_authority', 'super_admin'])
  const router = useRouter()

  if (!hasAccess) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Government Authority Portal</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                title="Advisories"
                subtitle="Post and manage government advisories"
                actions={[
                  <button
                    key="view"
                    onClick={() => router.push('/govt/advisories')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    View All
                  </button>
                ]}
              >
                <p className="text-gray-600">Manage advisories and warnings for field workers and site administrators.</p>
              </Card>
              <Card
                title="Alerts"
                subtitle="View critical alerts and incidents"
                actions={[
                  <button
                    key="view"
                    onClick={() => router.push('/alerts')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    View Alerts
                  </button>
                ]}
              >
                <p className="text-gray-600">Monitor all system alerts and critical incidents across all slopes.</p>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
