import { signInWithCustomToken, signOut } from "firebase/auth"
import { auth } from "./firebase-config"
import type {
  Barbershop,
  Booking,
  Review,
  BarbershopEmployee,
  User,
  UserRole,
  BarbershopFavorite,
  UserSettings,
  PublicUserProfile,
} from "./types"

const DEFAULT_LANGUAGE = "pt-BR"

function ensureDate(value: any, fallback?: Date): Date {
  if (!value) {
    return fallback ?? new Date()
  }

  if (value instanceof Date) {
    return value
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback ?? new Date() : parsed
}

function toArray<T>(value: any): T[] {
  if (Array.isArray(value)) {
    return value as T[]
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort((a, b) => {
        const numA = Number(a)
        const numB = Number(b)
        if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
          return numA - numB
        }
        return a.localeCompare(b)
      })
      .map((key) => value[key] as T)
  }

  return []
}

function normalizeWorkingHours(raw: any): Barbershop["workingHours"] {
  const fallback = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  }

  if (!raw || typeof raw !== "object") {
    return fallback
  }

  return {
    monday: toArray(raw.monday),
    tuesday: toArray(raw.tuesday),
    wednesday: toArray(raw.wednesday),
    thursday: toArray(raw.thursday),
    friday: toArray(raw.friday),
    saturday: toArray(raw.saturday),
    sunday: toArray(raw.sunday),
  }
}

function removeUndefinedFields(obj: any): any {
  const cleaned: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (typeof value === "object" && value !== null && !(value instanceof Date)) {
        cleaned[key] = removeUndefinedFields(value)
      } else {
        cleaned[key] = value
      }
    }
  }
  return cleaned
}

async function postJson<T>(url: string, body: Record<string, any>): Promise<T> {
  const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error || "Erro de requisicao")
  }

  return data as T
}

async function firebaseAction<T>(action: string, payload?: Record<string, any>): Promise<T> {
  const data = await postJson<{ result: T }>("/api/firebase", {
    action,
    payload: payload ?? {},
  })

  return data.result
}

function mergeUserSettings(base: UserSettings, updates?: Partial<UserSettings>): UserSettings {
  if (!updates) {
    return base
  }

  return {
    notifications: {
      ...base.notifications,
      ...(updates.notifications ?? {}),
    },
    privacy: {
      ...base.privacy,
      ...(updates.privacy ?? {}),
    },
    appearance: {
      ...base.appearance,
      ...(updates.appearance ?? {}),
    },
  }
}

export function getDefaultUserSettings(role: UserRole = "client"): UserSettings {
  const isClient = role === "client"
  const isBarber = role === "barber"

  return {
    notifications: {
      bookingConfirmed: true,
      bookingReminder: true,
      newReview: true,
      promotions: isClient,
      newBooking: isBarber,
    },
    privacy: {
      isProfilePublic: true,
      showReviewHistory: true,
      twoFactorEnabled: false,
    },
    appearance: {
      darkMode: true,
      language: DEFAULT_LANGUAGE,
    },
  }
}

function normalizeUser(uid: string, data: any): User {
  const role = (data.role as UserRole) ?? "client"
  const defaultSettings = getDefaultUserSettings(role)
  const rawSettings = (data.settings || {}) as Partial<UserSettings>
  const settings = mergeUserSettings(defaultSettings, rawSettings)

  return {
    id: uid,
    email: data.email as string,
    name: data.name as string,
    role,
    avatar: data.avatar,
    phone: data.phone,
    createdAt: ensureDate(data.createdAt),
    updatedAt: data.updatedAt ? ensureDate(data.updatedAt) : undefined,
    settings,
    employments: data.employments as User["employments"],
  }
}

function normalizePublicUserProfile(uid: string, data: any): PublicUserProfile {
  const role = (data.role as UserRole) ?? "client"

  return {
    id: uid,
    name: data.name as string,
    role,
    avatar: data.avatar,
    createdAt: ensureDate(data.createdAt),
    privacy: {
      isProfilePublic:
        typeof data?.privacy?.isProfilePublic === "boolean"
          ? data.privacy.isProfilePublic
          : getDefaultUserSettings(role).privacy.isProfilePublic,
      showReviewHistory:
        typeof data?.privacy?.showReviewHistory === "boolean"
          ? data.privacy.showReviewHistory
          : getDefaultUserSettings(role).privacy.showReviewHistory,
    },
  }
}

function normalizeBarbershop(data: any): Barbershop {
  const services = toArray<any>(data.services).map((service, index) => ({
    id: String(service?.id ?? index),
    name: String(service?.name ?? ""),
    description: String(service?.description ?? ""),
    price: Number(service?.price ?? 0),
    duration: Number(service?.duration ?? 0),
  }))

  const images = toArray<string>(data.images).filter((image) => typeof image === "string")

  return {
    ...data,
    id: data.id,
    services,
    images,
    workingHours: normalizeWorkingHours(data.workingHours),
    favoriteCount: typeof data.favoriteCount === "number" ? data.favoriteCount : 0,
    createdAt: ensureDate(data.createdAt),
  } as Barbershop
}

function normalizeBooking(data: any): Booking {
  return {
    ...data,
    id: data.id,
    date: ensureDate(data.date),
    createdAt: ensureDate(data.createdAt),
    updatedAt: data.updatedAt ? ensureDate(data.updatedAt) : undefined,
    confirmedAt: data.confirmedAt ? ensureDate(data.confirmedAt) : undefined,
    completedAt: data.completedAt ? ensureDate(data.completedAt) : undefined,
    cancelledAt: data.cancelledAt ? ensureDate(data.cancelledAt) : undefined,
  } as Booking
}

function normalizeReview(data: any): Review {
  return {
    ...data,
    id: data.id,
    createdAt: ensureDate(data.createdAt),
    updatedAt: data.updatedAt ? ensureDate(data.updatedAt) : undefined,
  } as Review
}

function normalizeFavorite(data: any): BarbershopFavorite {
  return {
    ...data,
    id: data.id,
    createdAt: ensureDate(data.createdAt),
  } as BarbershopFavorite
}

function normalizeEmployee(data: any): BarbershopEmployee {
  return {
    ...data,
    joinedAt: ensureDate(data.joinedAt),
  } as BarbershopEmployee
}

export async function signUpUser(email: string, password: string, userData: Omit<User, "id" | "createdAt">): Promise<User> {
  const data = await postJson<{ user: any; customToken: string }>("/api/auth/signup", {
    email,
    password,
    userData,
  })

  await signInWithCustomToken(auth, data.customToken)

  return normalizeUser(data.user.id, data.user)
}

export async function signInUser(email: string, password: string): Promise<User> {
  const data = await postJson<{ user: any; customToken: string }>("/api/auth/signin", {
    email,
    password,
  })

  await signInWithCustomToken(auth, data.customToken)

  return normalizeUser(data.user.id, data.user)
}

export async function signOutUser(): Promise<void> {
  await signOut(auth)
}

export async function getUserById(uid: string): Promise<User | null> {
  const user = await firebaseAction<any | null>("getUserById", { uid })
  if (!user) return null
  return normalizeUser(user.id, user)
}

export async function getPublicUserProfileById(uid: string): Promise<PublicUserProfile | null> {
  const profile = await firebaseAction<any | null>("getPublicUserProfileById", { uid })
  if (!profile) return null
  return normalizePublicUserProfile(profile.id, profile)
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; phone?: string; avatar?: string }
): Promise<User | null> {
  const updated = await firebaseAction<any | null>("updateUserProfile", { userId, data })
  if (!updated) return null
  return normalizeUser(updated.id, updated)
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<User | null> {
  const updated = await firebaseAction<any | null>("updateUserSettings", { userId, settings })
  if (!updated) return null
  return normalizeUser(updated.id, updated)
}

export async function getBarbershops(): Promise<Barbershop[]> {
  const data = await firebaseAction<any[]>("getBarbershops")
  return data.map(normalizeBarbershop)
}

export async function getBarbershopById(id: string): Promise<Barbershop | null> {
  const data = await firebaseAction<any | null>("getBarbershopById", { id })
  if (!data) return null
  return normalizeBarbershop(data)
}

export async function createBarbershop(data: Omit<Barbershop, "id">): Promise<string> {
  const result = await firebaseAction<{ id: string }>("createBarbershop", { data: removeUndefinedFields(data) })
  return result.id
}

export async function createBarbershopWithOwner(
  barbershopData: Omit<Barbershop, "id">,
  ownerId: string,
  ownerData: { name: string; email: string; avatar?: string; phone?: string }
): Promise<string> {
  const result = await firebaseAction<{ id: string }>("createBarbershopWithOwner", {
    barbershopData: removeUndefinedFields(barbershopData),
    ownerId,
    ownerData: removeUndefinedFields(ownerData),
  })

  return result.id
}

export async function updateBarbershop(id: string, data: Partial<Barbershop>): Promise<void> {
  await firebaseAction("updateBarbershop", { id, data: removeUndefinedFields(data) })
}

export async function isBarbershopFavorited(userId: string, barbershopId: string): Promise<boolean> {
  if (!userId) return false
  const result = await firebaseAction<{ favorited: boolean }>("isBarbershopFavorited", { userId, barbershopId })
  return !!result.favorited
}

export async function toggleBarbershopFavorite(
  userId: string,
  barbershopId: string
): Promise<{ favorited: boolean; favoriteCount: number }> {
  if (!userId) {
    throw new Error("User must be authenticated to favorite a barbershop")
  }

  return firebaseAction<{ favorited: boolean; favoriteCount: number }>("toggleBarbershopFavorite", {
    userId,
    barbershopId,
  })
}

export async function getBarbershopFavoritesByUser(userId: string): Promise<BarbershopFavorite[]> {
  if (!userId) return []
  const data = await firebaseAction<any[]>("getBarbershopFavoritesByUser", { userId })
  return data.map(normalizeFavorite)
}

export async function getBookingsByBarbershop(barbershopId: string): Promise<Booking[]> {
  const data = await firebaseAction<any[]>("getBookingsByBarbershop", { barbershopId })
  const bookings = data.map(normalizeBooking)
  return bookings.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export async function getBookingsByClient(clientId: string): Promise<Booking[]> {
  const data = await firebaseAction<any[]>("getBookingsByClient", { clientId })
  const bookings = data.map(normalizeBooking)
  return bookings.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export async function createBooking(data: Omit<Booking, "id">): Promise<string> {
  const result = await firebaseAction<{ id: string }>("createBooking", {
    data: removeUndefinedFields(data),
  })
  return result.id
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking["status"],
  options?: { updatedBy?: string; note?: string }
): Promise<void> {
  await firebaseAction("updateBookingStatus", {
    bookingId,
    status,
    options,
  })
}

export async function canUserReviewBarbershop(userId: string, barbershopId: string): Promise<boolean> {
  const result = await firebaseAction<{ canReview: boolean }>("canUserReviewBarbershop", {
    userId,
    barbershopId,
  })

  return !!result.canReview
}

export async function getReviewsByBarbershop(barbershopId: string): Promise<Review[]> {
  const data = await firebaseAction<any[]>("getReviewsByBarbershop", { barbershopId })
  return data.map(normalizeReview).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function getReviewsByUser(clientId: string): Promise<Review[]> {
  const data = await firebaseAction<any[]>("getReviewsByUser", { clientId })
  return data.map(normalizeReview).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function hasUserReviewedBarbershop(userId: string, barbershopId: string): Promise<boolean> {
  if (!userId) return false
  const result = await firebaseAction<{ reviewed: boolean }>("hasUserReviewedBarbershop", {
    userId,
    barbershopId,
  })

  return !!result.reviewed
}

export async function createReview(data: Omit<Review, "id">): Promise<string> {
  const cleanData = removeUndefinedFields({
    ...data,
    updatedAt: data.createdAt,
  })

  const result = await firebaseAction<{ id: string }>("createReview", { data: cleanData })
  return result.id
}

export async function updateReview(
  reviewId: string,
  updates: { rating: number; comment: string }
): Promise<void> {
  await firebaseAction("updateReview", { reviewId, updates })
}

export async function getEmployeesByBarbershop(barbershopId: string): Promise<BarbershopEmployee[]> {
  const data = await firebaseAction<any[]>("getEmployeesByBarbershop", { barbershopId })
  return data.map(normalizeEmployee)
}
