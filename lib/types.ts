export type UserRole = "client" | "barber" | "admin"
export type EmployeeRole = "owner" | "manager" | "barber" | "receptionist"

export interface UserNotificationSettings {
  bookingConfirmed: boolean
  bookingReminder: boolean
  newReview: boolean
  promotions: boolean
  newBooking: boolean
}

export interface UserPrivacySettings {
  isProfilePublic: boolean
  showReviewHistory: boolean
  twoFactorEnabled: boolean
}

export interface UserAppearanceSettings {
  darkMode: boolean
  language: string
}

export interface UserSettings {
  notifications: UserNotificationSettings
  privacy: UserPrivacySettings
  appearance: UserAppearanceSettings
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  createdAt: Date
  updatedAt?: Date
  settings?: UserSettings
  // Relação com barbearias onde trabalha
  employments?: Record<string, Employment>
}

export interface PublicUserProfile {
  id: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
  privacy: Pick<UserPrivacySettings, "isProfilePublic" | "showReviewHistory">
}

export interface Employment {
  barbershopId: string
  barbershopName: string
  role: EmployeeRole
  joinedAt: Date
  isActive: boolean
  permissions: EmployeePermissions
}

export interface EmployeePermissions {
  // Agendamentos
  viewBookings: boolean
  createBookings: boolean
  editBookings: boolean
  cancelBookings: boolean
  
  // Serviços
  viewServices: boolean
  createServices: boolean
  editServices: boolean
  deleteServices: boolean
  
  // Funcionários
  viewEmployees: boolean
  inviteEmployees: boolean
  editEmployees: boolean
  removeEmployees: boolean
  
  // Relatórios e dashboard
  viewReports: boolean
  viewRevenue: boolean
  
  // Barbearia
  editBarbershop: boolean
  manageBarbershop: boolean
}

export interface Barbershop {
  id: string
  name: string
  description: string
  ownerId: string
  address: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    fullAddress: string // endereço completo formatado
  }
  latitude: number
  longitude: number
  phone: string
  images: string[]
  rating: number
  reviewCount: number
  favoriteCount?: number
  services: Service[]
  workingHours: WorkingHours
  createdAt: Date
  // Funcionários da barbearia
  employees?: BarbershopEmployee[]
}

export interface BarbershopEmployee {
  userId: string
  name: string
  email: string
  avatar?: string
  phone?: string
  role: EmployeeRole
  joinedAt: Date
  isActive: boolean
  permissions: EmployeePermissions
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // in minutes
}

export interface WorkingHours {
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
  sunday: TimeSlot[]
}

export interface TimeSlot {
  start: string // HH:mm format
  end: string
}

export interface Booking {
  id: string
  clientId: string
  barbershopId: string
  serviceId: string
  barberId?: string // ID do barbeiro que vai atender
  date: Date
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: Date
  notes?: string
  updatedAt?: Date
  updatedBy?: string
  confirmedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
  statusNote?: string
}

export interface Review {
  id: string
  clientId: string
  clientName: string
  clientAvatar?: string
  barbershopId: string
  rating: number
  comment: string
  createdAt: Date
  updatedAt?: Date
}

export interface BarbershopFavorite {
  id: string
  userId: string
  barbershopId: string
  createdAt: Date
}

// Para convites de funcionários
export interface EmployeeInvitation {
  id: string
  barbershopId: string
  barbershopName: string
  invitedEmail: string
  invitedBy: string
  role: EmployeeRole
  permissions: EmployeePermissions
  status: "pending" | "accepted" | "rejected" | "expired"
  createdAt: Date
  expiresAt: Date
}

export interface PlatformStats {
  totalBarbershops: number
  totalUsers: number
  totalBookings: number
  totalRevenue: number
  activeBarbershops: number
  pendingApprovals: number
}
