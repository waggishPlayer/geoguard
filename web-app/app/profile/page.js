'use client'

import { useState } from 'react'
import { useRequireAuth } from '../../hooks/useRoles'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import Card from '../../components/Card'
import { authService } from '../../services/auth'
import { useAuth } from '../../hooks/useAuth'

export default function ProfilePage() {
  const { user } = useRequireAuth()
  const { setUser } = useAuth()
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      setSavingProfile(true)
      const response = await authService.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
      })
      setUser(response.data)
      setMessage('Profile updated successfully')
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (!passwordForm.newPassword) return
    setMessage('')
    setError('')
    try {
      setSavingPassword(true)
      await authService.updateProfile(passwordForm)
      setPasswordForm({ currentPassword: '', newPassword: '' })
      setMessage('Password updated successfully')
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {(message || error) && (
              <div className={`${message ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'} border px-4 py-2 rounded`}>
                {message || error}
              </div>
            )}

            <Card title="Profile Information" subtitle="Update your account details">
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm">
                <p><span className="font-semibold">Role:</span> {user.role_name?.replace('_', ' ').toUpperCase()}</p>
                <p><span className="font-semibold">Member Since:</span> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <form className="space-y-4" onSubmit={handleProfileUpdate}>
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold">{user.email}</p>
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </Card>

            <Card title="Change Password" subtitle="Keep your account secure">
              <form className="space-y-4" onSubmit={handlePasswordUpdate}>
                <div>
                  <label className="text-sm text-gray-600">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    minLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

