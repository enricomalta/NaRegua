// Script para migrar dados existentes para nova estrutura
// Execute este script uma vez para atualizar a estrutura do banco de dados

import { adminDb } from '@/lib/firebase-admin'
import { DEFAULT_PERMISSIONS } from '@/lib/permissions-config'
import type { EmployeeRole } from '@/lib/types'

export async function migrateUserToBarbershopOwner(
  userId: string,
  barbershopId: string,
  barbershopName: string,
  role: EmployeeRole = 'owner'
) {
  try {
    console.log(`Migrating user ${userId} to ${role} of ${barbershopName}...`)

    // Buscar o usuário atual
    const userDoc = await adminDb.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      throw new Error(`User ${userId} not found`)
    }

    const userData = userDoc.data()
    
    // Preparar os dados de emprego
    const employment = {
      barbershopId,
      barbershopName,
      role,
      joinedAt: new Date(),
      isActive: true,
      permissions: DEFAULT_PERMISSIONS[role]
    }

    // Atualizar o usuário com informações de emprego
    const updatedEmployments = {
      ...(userData?.employments || {}),
      [barbershopId]: employment
    }

    await adminDb.collection('users').doc(userId).update({
      employments: updatedEmployments
    })

    // Buscar a barbearia
    const barbershopDoc = await adminDb.collection('barbershops').doc(barbershopId).get()
    
    if (barbershopDoc.exists) {
      const barbershopData = barbershopDoc.data()
      
      // Adicionar o funcionário à barbearia
      const barbershopEmployee = {
        userId,
        name: userData?.name || 'Nome não informado',
        email: userData?.email || '',
        avatar: userData?.avatar,
        phone: userData?.phone,
        role,
        joinedAt: new Date(),
        isActive: true,
        permissions: DEFAULT_PERMISSIONS[role]
      }

      const updatedEmployees = {
        ...(barbershopData?.employees || {}),
        [userId]: barbershopEmployee
      }

      await adminDb.collection('barbershops').doc(barbershopId).update({
        employees: updatedEmployees
      })
    }

    console.log(`✅ Successfully migrated user ${userId}`)
    return true

  } catch (error) {
    console.error(`❌ Error migrating user ${userId}:`, error)
    return false
  }
}

// Função para executar a migração do usuário específico
export async function runMigration() {
  const userId = "2jP9GIsXYMW0lEp7wdQySyhwKp02"
  const barbershopId = "barbershop-teste-123" // Substitua pelo ID real da barbearia
  const barbershopName = "Barbearia Teste"
  
  const success = await migrateUserToBarbershopOwner(userId, barbershopId, barbershopName, 'owner')
  
  if (success) {
    console.log("🎉 Migration completed successfully!")
  } else {
    console.log("❌ Migration failed")
  }
}

// Para usar: importe e chame runMigration() em algum lugar do seu código