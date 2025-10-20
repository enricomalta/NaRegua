"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth'
import { auth } from './firebase-config'
import { getUserById } from './firebase-service'
import { AuthService, type AuthPayload } from './jwt-service'
import type { User } from './types'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  authUser: AuthPayload | null
  loading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  authUser: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  hasRole: () => false,
  hasAnyRole: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [authUser, setAuthUser] = useState<AuthPayload | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar auth data ao carregar
  useEffect(() => {
    const authData = AuthService.getCurrentUser()
    if (authData) {
      setAuthUser(authData)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setFirebaseUser(firebaseUser)
          const userData = await getUserById(firebaseUser.uid)
          if (userData) {
            setUser(userData)
            // Salvar dados de auth
            AuthService.saveAuth(userData)
            setAuthUser(AuthService.getCurrentUser())
          }
        } else {
          setFirebaseUser(null)
          setUser(null)
          setAuthUser(null)
          AuthService.removeAuth()
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUser(null)
        setAuthUser(null)
        AuthService.removeAuth()
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    AuthService.saveAuth(userData)
    setAuthUser(AuthService.getCurrentUser())
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setFirebaseUser(null)
      setAuthUser(null)
      AuthService.removeAuth()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const hasRole = (role: string): boolean => {
    return authUser?.role === role || false
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return !!authUser && roles.includes(authUser.role)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      authUser, 
      loading, 
      login, 
      logout, 
      hasRole, 
      hasAnyRole 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}