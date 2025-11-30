'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)

  // web-app/hooks/useAuth.js (inside useEffect)
  useEffect(() => {
    const token = authService.getToken();
    const storedUser = authService.getCurrentUser();
  
    if (token && storedUser) {
      setUserState(storedUser);
    }
  
    setLoading(false);
  }, []);  

  const setUser = (userData, token) => {
    setUserState(userData)
    // Token is already stored in authService.login
  }

  const logout = () => {
    setUserState(null)
    authService.logout()
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

