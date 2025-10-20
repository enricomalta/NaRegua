"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'

interface PermissionCheck {
  userRole: string
  requiredRoles?: string[]
  action: string
  resource: string
}

interface PermissionResponse {
  hasPermission: boolean
  reason: string
}

// Cache para evitar requisições duplicadas
const permissionCache = new Map<string, PermissionResponse>()
const userCache = new Map<string, any>()

export function usePermissions() {
  const { authUser } = useAuth()

  const checkPermission = useCallback(async ({
    userRole,
    requiredRoles,
    action,
    resource
  }: PermissionCheck): Promise<PermissionResponse> => {
    const cacheKey = `${userRole}-${action}-${resource}-${requiredRoles?.join(',') || ''}`
    
    // Verificar cache primeiro
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey)!
    }

    try {
      const response = await fetch('/api/auth/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userRole,
          requiredRoles,
          action,
          resource
        })
      })

      if (!response.ok) {
        throw new Error('Permission check failed')
      }

      const result = await response.json()
      
      // Cachear resultado por 5 minutos
      permissionCache.set(cacheKey, result)
      setTimeout(() => permissionCache.delete(cacheKey), 5 * 60 * 1000)
      
      return result
    } catch (error) {
      console.error('Permission check error:', error)
      const errorResult = {
        hasPermission: false,
        reason: 'Error checking permissions'
      }
      return errorResult
    }
  }, [])

  const validateUser = useCallback(async (userId: string) => {
    // Verificar cache primeiro
    if (userCache.has(userId)) {
      return userCache.get(userId)
    }

    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('User validation failed')
      }

      const data = await response.json()
      const user = data.user
      
      // Cachear usuário por 10 minutos
      userCache.set(userId, user)
      setTimeout(() => userCache.delete(userId), 10 * 60 * 1000)
      
      return user
    } catch (error) {
      console.error('User validation error:', error)
      return null
    }
  }, [])

  const canRead = useCallback((resource: string) => {
    if (!authUser) return Promise.resolve({ hasPermission: false, reason: 'Not authenticated' })
    
    return checkPermission({
      userRole: authUser.role,
      action: 'read',
      resource
    })
  }, [authUser, checkPermission])

  const canCreate = useCallback((resource: string, requiredRoles?: string[]) => {
    if (!authUser) return Promise.resolve({ hasPermission: false, reason: 'Not authenticated' })
    
    return checkPermission({
      userRole: authUser.role,
      requiredRoles,
      action: 'create',
      resource
    })
  }, [authUser, checkPermission])

  const canUpdate = useCallback((resource: string, requiredRoles?: string[]) => {
    if (!authUser) return Promise.resolve({ hasPermission: false, reason: 'Not authenticated' })
    
    return checkPermission({
      userRole: authUser.role,
      requiredRoles,
      action: 'update',
      resource
    })
  }, [authUser, checkPermission])

  const canDelete = useCallback((resource: string, requiredRoles?: string[]) => {
    if (!authUser) return Promise.resolve({ hasPermission: false, reason: 'Not authenticated' })
    
    return checkPermission({
      userRole: authUser.role,
      requiredRoles,
      action: 'delete',
      resource
    })
  }, [authUser, checkPermission])

  return {
    checkPermission,
    validateUser,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    userRole: authUser?.role || null
  }
}

// Hook para componente que requer permissão específica
export function useResourcePermission(resource: string, action: string) {
  const { authUser } = useAuth()
  const { checkPermission } = usePermissions()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!authUser) {
      setHasPermission(false)
      setReason('Not authenticated')
      setLoading(false)
      return
    }

    const check = async () => {
      setLoading(true)
      const result = await checkPermission({
        userRole: authUser.role,
        action,
        resource
      })
      
      setHasPermission(result.hasPermission)
      setReason(result.reason)
      setLoading(false)
    }

    check()
  }, [authUser, resource, action, checkPermission])

  return {
    hasPermission,
    loading,
    reason
  }
}