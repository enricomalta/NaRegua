import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { EmployeePermissions } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      barbershopId, 
      permission, 
      userRole, 
      requiredRoles, 
      action, 
      resource 
    } = body

    // Verificação básica de role (compatibilidade com sistema antigo)
    if (userRole && action && resource) {
      return handleLegacyPermissionCheck(userRole, action, resource, requiredRoles)
    }

    // Nova verificação de permissões granulares
    if (!userId || !barbershopId || !permission) {
      return NextResponse.json(
        { error: 'userId, barbershopId and permission are required for granular check' },
        { status: 400 }
      )
    }

    // Buscar usuário no Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      return NextResponse.json({
        hasPermission: false,
        reason: 'User not found'
      })
    }

    const userData = userDoc.data()

    // Admin sempre tem permissão
    if (userData?.role === 'admin') {
      return NextResponse.json({
        hasPermission: true,
        reason: 'Admin has full access'
      })
    }

    // Verificar se o usuário tem emprego na barbearia
    const employment = userData?.employments?.[barbershopId]
    
    if (!employment || !employment.isActive) {
      return NextResponse.json({
        hasPermission: false,
        reason: 'User is not an active employee of this barbershop'
      })
    }

    // Verificar a permissão específica
    const hasPermission = employment.permissions?.[permission] === true

    return NextResponse.json({
      hasPermission,
      reason: hasPermission 
        ? `User has ${permission} permission` 
        : `User does not have ${permission} permission`,
      userRole: employment.role,
      barbershopId
    })

  } catch (error) {
    console.error('Permission check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Função para compatibilidade com sistema antigo
function handleLegacyPermissionCheck(userRole: string, action: string, resource: string, requiredRoles?: string[]) {
  if (!userRole) {
    return NextResponse.json(
      { error: 'User role is required' },
      { status: 400 }
    )
  }

  // Admin sempre tem permissão
  if (userRole === 'admin') {
    return NextResponse.json({
      hasPermission: true,
      reason: 'Admin has full access'
    })
  }

  // Verificar roles específicas
  if (requiredRoles && Array.isArray(requiredRoles)) {
    const hasRequiredRole = requiredRoles.includes(userRole)
    
    if (!hasRequiredRole) {
      return NextResponse.json({
        hasPermission: false,
        reason: `User role '${userRole}' not in required roles: ${requiredRoles.join(', ')}`
      })
    }
  }

  // Regras específicas por resource e action
  const permission = checkSpecificPermissions(userRole, action, resource)
  
  return NextResponse.json(permission)
}

function checkSpecificPermissions(userRole: string, action: string, resource: string) {
  // Regras específicas por recurso
  switch (resource) {
    case 'barbershop':
      return checkBarbershopPermissions(userRole, action)
    
    case 'booking':
      return checkBookingPermissions(userRole, action)
    
    case 'review':
      return checkReviewPermissions(userRole, action)
    
    case 'user':
      return checkUserPermissions(userRole, action)
    
    default:
      return {
        hasPermission: false,
        reason: `Unknown resource: ${resource}`
      }
  }
}

function checkBarbershopPermissions(userRole: string, action: string) {
  switch (action) {
    case 'read':
      // Todos podem ler barbearias
      return { hasPermission: true, reason: 'Public resource' }
    
    case 'create':
      // Apenas barbeiros podem criar barbearias
      return {
        hasPermission: userRole === 'barber',
        reason: userRole === 'barber' ? 'Barber can create barbershop' : 'Only barbers can create barbershops'
      }
    
    case 'update':
    case 'delete':
      // Apenas donos da barbearia ou admin
      return {
        hasPermission: userRole === 'barber',
        reason: userRole === 'barber' ? 'Barber can manage own barbershop' : 'Only barbershop owner can update/delete'
      }
    
    default:
      return { hasPermission: false, reason: `Unknown action: ${action}` }
  }
}

function checkBookingPermissions(userRole: string, action: string) {
  switch (action) {
    case 'read':
      // Clientes veem seus agendamentos, barbeiros veem da sua barbearia
      return {
        hasPermission: ['client', 'barber'].includes(userRole),
        reason: userRole === 'client' ? 'Client can read own bookings' : 
                userRole === 'barber' ? 'Barber can read barbershop bookings' : 
                'Only clients and barbers can read bookings'
      }
    
    case 'create':
      // Clientes e funcionários podem criar agendamentos
      return {
        hasPermission: ['client', 'barber'].includes(userRole),
        reason: 'Clients and barbershop staff can create bookings'
      }
    
    case 'update':
      // Barbeiros podem atualizar status, clientes podem cancelar
      return {
        hasPermission: ['client', 'barber'].includes(userRole),
        reason: 'Clients can cancel, barbers can update status'
      }
    
    case 'delete':
      // Apenas barbeiros e admin podem deletar
      return {
        hasPermission: userRole === 'barber',
        reason: userRole === 'barber' ? 'Barber can delete bookings' : 'Only barbers can delete bookings'
      }
    
    default:
      return { hasPermission: false, reason: `Unknown action: ${action}` }
  }
}

function checkReviewPermissions(userRole: string, action: string) {
  switch (action) {
    case 'read':
      // Todos podem ler reviews
      return { hasPermission: true, reason: 'Public resource' }
    
    case 'create':
      // Apenas clientes podem criar reviews
      return {
        hasPermission: userRole === 'client',
        reason: userRole === 'client' ? 'Client can create reviews' : 'Only clients can create reviews'
      }
    
    case 'update':
    case 'delete':
      // Apenas autor do review ou admin
      return {
        hasPermission: userRole === 'client',
        reason: 'Only review author can update/delete'
      }
    
    default:
      return { hasPermission: false, reason: `Unknown action: ${action}` }
  }
}

function checkUserPermissions(userRole: string, action: string) {
  switch (action) {
    case 'read':
      // Usuário pode ler próprios dados
      return { hasPermission: true, reason: 'User can read own data' }
    
    case 'update':
      // Usuário pode atualizar próprios dados
      return { hasPermission: true, reason: 'User can update own data' }
    
    case 'delete':
      // Apenas próprio usuário ou admin
      return {
        hasPermission: true,
        reason: 'User can delete own account'
      }
    
    default:
      return { hasPermission: false, reason: `Unknown action: ${action}` }
  }
}