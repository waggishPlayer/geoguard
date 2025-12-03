'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

export function useRequireRole(allowedRoles) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
      } else if (!allowedRoles.includes(user.role_name)) {
        router.push('/dashboard')
      }
    }
  }, [user, loading, allowedRoles, router])

  return { user, loading, hasAccess: user && allowedRoles.includes(user.role_name) }
}

export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  return { user, loading }
}

