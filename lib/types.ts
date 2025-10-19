export type UserRole = "client" | "barber" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  createdAt: Date
}

export interface Barbershop {
  id: string
  name: string
  description: string
  ownerId: string
  address: string
  latitude: number
  longitude: number
  phone: string
  images: string[]
  rating: number
  reviewCount: number
  services: Service[]
  workingHours: WorkingHours
  createdAt: Date
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
  date: Date
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: Date
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
}

export type EmployeeRole = "owner" | "barber" | "receptionist" | "manager"

export interface Employee {
  id: string
  userId: string
  barbershopId: string
  role: EmployeeRole
  name: string
  email: string
  avatar?: string
  phone?: string
  joinedAt: Date
  permissions: {
    manageBookings: boolean
    manageServices: boolean
    manageEmployees: boolean
    viewReports: boolean
  }
}

export interface PlatformStats {
  totalBarbershops: number
  totalUsers: number
  totalBookings: number
  totalRevenue: number
  activeBarbershops: number
  pendingApprovals: number
}
