'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireRole } from '../../../hooks/useRoles'

export default function AdminSensorsPage() {
  const { hasAccess } = useRequireRole(['site_admin', 'super_admin'])
  const router = useRouter()

  useEffect(() => {
    if (hasAccess) {
      router.push('/sensors')
    }
  }, [hasAccess, router])

  return <div className="flex items-center justify-center h-screen">Redirecting...</div>
}

