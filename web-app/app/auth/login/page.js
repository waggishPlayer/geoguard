'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../services/auth'
import { useAuth } from '../../../hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const { setUser } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
  
    try {
      const res = await authService.login(email, password)
  
      if (res && res.success && res.token) {
        setUser(res.data, res.token)
        router.push('/dashboard')
      } else {
        setError(res?.message || 'Invalid credentials')
      }
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">

        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="border p-2 w-full rounded"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="border p-2 w-full rounded"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>

        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a className="text-blue-500" href="/auth/register">Register</a>
        </p>

      </div>
    </div>
  )
}
