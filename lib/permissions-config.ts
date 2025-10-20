import { EmployeeRole, EmployeePermissions } from './types'

// Configurações de permissões padrão por cargo
export const DEFAULT_PERMISSIONS: Record<EmployeeRole, EmployeePermissions> = {
  owner: {
    // Agendamentos
    viewBookings: true,
    createBookings: true,
    editBookings: true,
    cancelBookings: true,
    
    // Serviços
    viewServices: true,
    createServices: true,
    editServices: true,
    deleteServices: true,
    
    // Funcionários
    viewEmployees: true,
    inviteEmployees: true,
    editEmployees: true,
    removeEmployees: true,
    
    // Relatórios e dashboard
    viewReports: true,
    viewRevenue: true,
    
    // Barbearia
    editBarbershop: true,
    manageBarbershop: true,
  },
  
  manager: {
    // Agendamentos
    viewBookings: true,
    createBookings: true,
    editBookings: true,
    cancelBookings: true,
    
    // Serviços
    viewServices: true,
    createServices: true,
    editServices: true,
    deleteServices: false,
    
    // Funcionários
    viewEmployees: true,
    inviteEmployees: true,
    editEmployees: false,
    removeEmployees: false,
    
    // Relatórios e dashboard
    viewReports: true,
    viewRevenue: false,
    
    // Barbearia
    editBarbershop: false,
    manageBarbershop: false,
  },
  
  barber: {
    // Agendamentos
    viewBookings: true,
    createBookings: true,
    editBookings: true,
    cancelBookings: false,
    
    // Serviços
    viewServices: true,
    createServices: false,
    editServices: false,
    deleteServices: false,
    
    // Funcionários
    viewEmployees: true,
    inviteEmployees: false,
    editEmployees: false,
    removeEmployees: false,
    
    // Relatórios e dashboard
    viewReports: false,
    viewRevenue: false,
    
    // Barbearia
    editBarbershop: false,
    manageBarbershop: false,
  },
  
  receptionist: {
    // Agendamentos
    viewBookings: true,
    createBookings: true,
    editBookings: true,
    cancelBookings: true,
    
    // Serviços
    viewServices: true,
    createServices: false,
    editServices: false,
    deleteServices: false,
    
    // Funcionários
    viewEmployees: true,
    inviteEmployees: false,
    editEmployees: false,
    removeEmployees: false,
    
    // Relatórios e dashboard
    viewReports: false,
    viewRevenue: false,
    
    // Barbearia
    editBarbershop: false,
    manageBarbershop: false,
  },
}

// Função para obter permissões padrão por cargo
export function getDefaultPermissions(role: EmployeeRole): EmployeePermissions {
  return { ...DEFAULT_PERMISSIONS[role] }
}

// Função para verificar se um usuário tem uma permissão específica
export function hasPermission(
  userPermissions: EmployeePermissions,
  permission: keyof EmployeePermissions
): boolean {
  return userPermissions[permission] === true
}

// Função para verificar múltiplas permissões
export function hasAllPermissions(
  userPermissions: EmployeePermissions,
  permissions: (keyof EmployeePermissions)[]
): boolean {
  return permissions.every(permission => hasPermission(userPermissions, permission))
}

// Função para verificar se tem pelo menos uma das permissões
export function hasAnyPermission(
  userPermissions: EmployeePermissions,
  permissions: (keyof EmployeePermissions)[]
): boolean {
  return permissions.some(permission => hasPermission(userPermissions, permission))
}

// Descrições das permissões para interface do usuário
export const PERMISSION_DESCRIPTIONS: Record<keyof EmployeePermissions, string> = {
  viewBookings: 'Visualizar agendamentos',
  createBookings: 'Criar novos agendamentos',
  editBookings: 'Editar agendamentos existentes',
  cancelBookings: 'Cancelar agendamentos',
  
  viewServices: 'Visualizar serviços',
  createServices: 'Criar novos serviços',
  editServices: 'Editar serviços existentes',
  deleteServices: 'Deletar serviços',
  
  viewEmployees: 'Visualizar funcionários',
  inviteEmployees: 'Convidar novos funcionários',
  editEmployees: 'Editar dados dos funcionários',
  removeEmployees: 'Remover funcionários',
  
  viewReports: 'Visualizar relatórios',
  viewRevenue: 'Visualizar dados de faturamento',
  
  editBarbershop: 'Editar dados da barbearia',
  manageBarbershop: 'Gerenciar configurações da barbearia',
}

// Agrupamento de permissões por categoria
export const PERMISSION_GROUPS = {
  bookings: [
    'viewBookings',
    'createBookings', 
    'editBookings',
    'cancelBookings'
  ] as (keyof EmployeePermissions)[],
  
  services: [
    'viewServices',
    'createServices',
    'editServices', 
    'deleteServices'
  ] as (keyof EmployeePermissions)[],
  
  employees: [
    'viewEmployees',
    'inviteEmployees',
    'editEmployees',
    'removeEmployees'
  ] as (keyof EmployeePermissions)[],
  
  reports: [
    'viewReports',
    'viewRevenue'
  ] as (keyof EmployeePermissions)[],
  
  barbershop: [
    'editBarbershop',
    'manageBarbershop'
  ] as (keyof EmployeePermissions)[],
}