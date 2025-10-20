"use client"

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UseRoleProtectionProps {
  requiredRoles?: string[]
  redirectTo?: string
  requireAuth?: boolean
}

export function useRoleProtection({
  requiredRoles = [],
  redirectTo = '/login',
  requireAuth = true
}: UseRoleProtectionProps = {}) {
  const { user, authUser, loading, hasAnyRole } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (loading) return

    // Se requer autenticação e não está logado
    if (requireAuth && !user) {
      router.push(redirectTo)
      return
    }

    // Se não requer autenticação ou não tem roles específicas
    if (!requireAuth || requiredRoles.length === 0) {
      setIsAuthorized(true)
      return
    }

    // Verificar se tem alguma das roles necessárias
    if (hasAnyRole(requiredRoles)) {
      setIsAuthorized(true)
    } else {
      // Redirecionar baseado na role do usuário
      const userRole = authUser?.role
      switch (userRole) {
        case 'admin':
          router.push('/admin/dashboard')
          break
        case 'barber':
          router.push('/barber/dashboard')
          break
        case 'client':
          router.push('/client/dashboard')
          break
        default:
          router.push('/login')
      }
    }
  }, [user, authUser, loading, hasAnyRole, requiredRoles, requireAuth, redirectTo, router])

  return {
    isAuthorized,
    loading,
    user,
    authUser
  }
}

// HOC para proteção de componentes
export function withRoleProtection<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  protection: UseRoleProtectionProps
) {
  return function ProtectedComponent(props: T) {
    const { isAuthorized, loading } = useRoleProtection(protection)

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthorized) {
      return null
    }

    return <Component {...props} />
  }
}

// Componente para mostrar conteúdo baseado em roles
interface RoleBasedContentProps {
  allowedRoles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleBasedContent({ 
  allowedRoles, 
  children, 
  fallback = null 
}: RoleBasedContentProps) {
  const { hasAnyRole } = useAuth()

  if (hasAnyRole(allowedRoles)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

// Componente para conteúdo apenas para usuários logados
interface AuthenticatedContentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthenticatedContent({ 
  children, 
  fallback = null 
}: AuthenticatedContentProps) {
  const { user } = useAuth()

  if (user) {
    return <>{children}</>
  }

  return <>{fallback}</>
}