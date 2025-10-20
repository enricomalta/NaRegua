// Firebase Service - Functions to interact with Firebase
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, query, where, orderBy, runTransaction } from "firebase/firestore"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User as FirebaseUser } from "firebase/auth"
import { db, auth } from "./firebase-config"
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

// Authentication
export async function signUpUser(email: string, password: string, userData: Omit<User, "id" | "createdAt">): Promise<User> {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Create user document in Firestore using the UID as document ID
    const now = new Date()
    const user: Omit<User, "id"> = {
      ...userData,
      email: firebaseUser.email!,
      createdAt: now,
      updatedAt: now,
      settings: getDefaultUserSettings(userData.role),
    }

    const userDocRef = doc(db, "users", firebaseUser.uid)
    await setDoc(userDocRef, user)
    await setDoc(
      doc(db, "userPublicProfiles", firebaseUser.uid),
      buildPublicUserProfilePayload({
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        settings: user.settings,
      })
    )

    return normalizeUser(firebaseUser.uid, user)
  } catch (error) {
    console.error("[v0] Error creating user:", error)
    throw error
  }
}

export async function signInUser(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Get user data from Firestore using UID as document ID
    const userDocRef = doc(db, "users", firebaseUser.uid)
    const userDoc = await getDoc(userDocRef)
    
    if (!userDoc.exists()) {
      throw new Error("User data not found")
    }

  const user = normalizeUser(firebaseUser.uid, userDoc.data())
  await syncPublicUserProfile(user)
  return user
  } catch (error) {
    console.error("[v0] Error signing in:", error)
    throw error
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("[v0] Error signing out:", error)
    throw error
  }
}

export async function getUserById(uid: string): Promise<User | null> {
  try {
    const userDocRef = doc(db, "users", uid)
    const userDoc = await getDoc(userDocRef)
    
    if (!userDoc.exists()) {
      return null
    }

    const user = normalizeUser(uid, userDoc.data())
    await syncPublicUserProfile(user)
    return user
  } catch (error) {
    if ((error as { code?: string } | undefined)?.code === "permission-denied") {
      return null
    }

    console.error("[v0] Error fetching user:", error)
    return null
  }
}

export async function getPublicUserProfileById(uid: string): Promise<PublicUserProfile | null> {
  try {
    const publicDocRef = doc(db, "userPublicProfiles", uid)
    const docSnap = await getDoc(publicDocRef)

    if (!docSnap.exists()) {
      return null
    }

    return normalizePublicUserProfile(uid, docSnap.data())
  } catch (error) {
    console.error("[v0] Error fetching public user profile:", error)
    return null
  }
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; phone?: string; avatar?: string }
): Promise<User | null> {
  try {
    const userRef = doc(db, "users", userId)
    const payload = removeUndefinedFields(data)

    if (Object.keys(payload).length === 0) {
      return getUserById(userId)
    }

    const now = new Date()

    await updateDoc(userRef, {
      ...payload,
      updatedAt: now,
    })

    const userDoc = await getDoc(userRef)
    if (!userDoc.exists()) {
      return null
    }

    const updatedUser = normalizeUser(userId, userDoc.data())
    await syncPublicUserProfile(updatedUser)
    return updatedUser
  } catch (error) {
    console.error("[v0] Error updating user profile:", error)
    throw error
  }
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<User | null> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return null
    }

    const current = normalizeUser(userId, userDoc.data())
    const mergedSettings = mergeUserSettings(current.settings ?? getDefaultUserSettings(current.role), settings)
    const now = new Date()

    await updateDoc(userRef, {
      settings: mergedSettings,
      updatedAt: now,
    })

    const updatedUser: User = {
      ...current,
      settings: mergedSettings,
      updatedAt: now,
    }

    await syncPublicUserProfile(updatedUser)

    return updatedUser
  } catch (error) {
    console.error("[v0] Error updating user settings:", error)
    throw error
  }
}

// Barbershops
export async function getBarbershops(): Promise<Barbershop[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "barbershops"))
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()

      return {
        id: doc.id,
        ...data,
        favoriteCount: typeof data.favoriteCount === "number" ? data.favoriteCount : 0,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Barbershop
    })
  } catch (error) {
    console.error("[v0] Error fetching barbershops:", error)
    return []
  }
}

export async function getBarbershopById(id: string): Promise<Barbershop | null> {
  try {
    const docRef = doc(db, "barbershops", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()

      return {
        id: docSnap.id,
        ...data,
        favoriteCount: typeof data.favoriteCount === "number" ? data.favoriteCount : 0,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Barbershop
    }
    return null
  } catch (error) {
    console.error("[v0] Error fetching barbershop:", error)
    return null
  }
}

export async function createBarbershop(data: Omit<Barbershop, "id">): Promise<string> {
  try {
    const payload = {
      ...data,
      favoriteCount: typeof data.favoriteCount === "number" ? data.favoriteCount : 0,
    }

    const docRef = await addDoc(collection(db, "barbershops"), payload)
    return docRef.id
  } catch (error) {
    console.error("[v0] Error creating barbershop:", error)
    throw error
  }
}

// Helper function to remove undefined values from objects
function removeUndefinedFields(obj: any): any {
  const cleaned: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        cleaned[key] = removeUndefinedFields(value)
      } else {
        cleaned[key] = value
      }
    }
  }
  return cleaned
}

const DEFAULT_LANGUAGE = "pt-BR"

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

type PublicPrivacy = Pick<UserSettings["privacy"], "isProfilePublic" | "showReviewHistory">
type PublicProfilePayload = Omit<PublicUserProfile, "id">

function resolvePublicPrivacy(role: UserRole, settings?: UserSettings): PublicPrivacy {
  const defaults = getDefaultUserSettings(role).privacy
  const privacySettings: Partial<UserSettings["privacy"]> = settings?.privacy ?? {}

  return {
    isProfilePublic: privacySettings.isProfilePublic ?? defaults.isProfilePublic,
    showReviewHistory: privacySettings.showReviewHistory ?? defaults.showReviewHistory,
  }
}

function buildPublicUserProfilePayload(data: {
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
  settings?: UserSettings
}): PublicProfilePayload {
  return removeUndefinedFields({
    name: data.name,
    role: data.role,
    avatar: data.avatar,
    createdAt: ensureDate(data.createdAt),
    privacy: resolvePublicPrivacy(data.role, data.settings),
  }) as PublicProfilePayload
}

function ensureDate(value: any, fallback?: Date): Date {
  if (!value) {
    return fallback ?? new Date()
  }

  if (value instanceof Date) {
    return value
  }

  if (typeof value.toDate === "function") {
    return value.toDate()
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback ?? new Date() : parsed
}

function normalizeUser(uid: string, data: any): User {
  const role = (data.role as UserRole) ?? "client"
  const defaultSettings = getDefaultUserSettings(role)
  const rawSettings = (data.settings || {}) as Partial<UserSettings>
  const settings = mergeUserSettings(defaultSettings, rawSettings)

  const createdAt = ensureDate(data.createdAt)
  const updatedAt = data.updatedAt ? ensureDate(data.updatedAt) : undefined

  return {
    id: uid,
    email: data.email as string,
    name: data.name as string,
    role,
    avatar: data.avatar,
    phone: data.phone,
    createdAt,
    updatedAt,
    settings,
    employments: data.employments as User["employments"],
  }
}

function normalizePublicUserProfile(uid: string, data: any): PublicUserProfile {
  const role = (data.role as UserRole) ?? "client"
  const createdAt = ensureDate(data.createdAt)
  const privacyRaw = data.privacy ?? {}

  return {
    id: uid,
    name: data.name as string,
    role,
    avatar: data.avatar,
    createdAt,
    privacy: {
      isProfilePublic:
        typeof privacyRaw.isProfilePublic === "boolean"
          ? privacyRaw.isProfilePublic
          : getDefaultUserSettings(role).privacy.isProfilePublic,
      showReviewHistory:
        typeof privacyRaw.showReviewHistory === "boolean"
          ? privacyRaw.showReviewHistory
          : getDefaultUserSettings(role).privacy.showReviewHistory,
    },
  }
}

async function syncPublicUserProfile(user: User): Promise<void> {
  try {
    const publicProfileRef = doc(db, "userPublicProfiles", user.id)
    const payload = buildPublicUserProfilePayload({
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
      settings: user.settings,
    })

    await setDoc(publicProfileRef, payload, { merge: true })
  } catch (error) {
    console.error(`[v0] Error syncing public profile for user ${user.id}:`, error)
  }
}

// Nova função para criar barbearia e associar o owner automaticamente
export async function createBarbershopWithOwner(
  barbershopData: Omit<Barbershop, "id">, 
  ownerId: string,
  ownerData: { name: string; email: string; avatar?: string; phone?: string }
): Promise<string> {
  try {
    // 1. Criar a barbearia
    const payload = {
      ...barbershopData,
      favoriteCount: typeof barbershopData.favoriteCount === "number" ? barbershopData.favoriteCount : 0,
    }

    const barbershopRef = await addDoc(collection(db, "barbershops"), payload)
    const barbershopId = barbershopRef.id

    // 2. Preparar dados do funcionário para a barbearia
    const employeeData = {
      userId: ownerId,
      name: ownerData.name,
      email: ownerData.email,
      avatar: ownerData.avatar,
      phone: ownerData.phone,
      role: 'owner' as const,
      joinedAt: new Date(),
      isActive: true,
      permissions: {
        viewBookings: true,
        createBookings: true,
        editBookings: true,
        cancelBookings: true,
        viewServices: true,
        createServices: true,
        editServices: true,
        deleteServices: true,
        viewEmployees: true,
        inviteEmployees: true,
        editEmployees: true,
        removeEmployees: true,
        viewReports: true,
        viewRevenue: true,
        editBarbershop: true,
        manageBarbershop: true,
      }
    }

    // Remove undefined fields before saving
    const cleanEmployeeData = removeUndefinedFields(employeeData)

    // 3. Adicionar funcionário à barbearia
    await updateDoc(barbershopRef, {
      [`employees.${ownerId}`]: cleanEmployeeData
    })

    // 4. Preparar dados de emprego para o usuário
    const employmentData = {
      barbershopId,
      barbershopName: barbershopData.name,
      role: 'owner' as const,
      joinedAt: new Date(),
      isActive: true,
      permissions: cleanEmployeeData.permissions
    }

    // 5. Adicionar emprego ao usuário
    const userRef = doc(db, "users", ownerId)
    await updateDoc(userRef, {
      [`employments.${barbershopId}`]: employmentData
    })

    console.log(`✅ Barbearia criada e usuário ${ownerId} associado como owner`)
    return barbershopId

  } catch (error) {
    console.error("[v0] Error creating barbershop with owner:", error)
    throw error
  }
}

export async function updateBarbershop(id: string, data: Partial<Barbershop>): Promise<void> {
  try {
    const docRef = doc(db, "barbershops", id)
    const cleanedData = removeUndefinedFields(data)
    await updateDoc(docRef, cleanedData)
  } catch (error) {
    console.error("[v0] Error updating barbershop:", error)
    throw error
  }
}

export async function isBarbershopFavorited(userId: string, barbershopId: string): Promise<boolean> {
  if (!userId) {
    return false
  }

  try {
    const favoriteDocRef = doc(db, "barbershopFavorites", `${userId}_${barbershopId}`)
    const favoriteDoc = await getDoc(favoriteDocRef)
    return favoriteDoc.exists()
  } catch (error) {
    console.error("[v0] Error checking barbershop favorite:", error)
    return false
  }
}

export async function toggleBarbershopFavorite(
  userId: string,
  barbershopId: string
): Promise<{ favorited: boolean; favoriteCount: number }> {
  if (!userId) {
    throw new Error("User must be authenticated to favorite a barbershop")
  }

  try {
    const result = await runTransaction(db, async (transaction) => {
      const favoriteDocRef = doc(db, "barbershopFavorites", `${userId}_${barbershopId}`)
      const barbershopRef = doc(db, "barbershops", barbershopId)

      const favoriteDocSnap = await transaction.get(favoriteDocRef)
      const barbershopSnap = await transaction.get(barbershopRef)

      if (!barbershopSnap.exists()) {
        throw new Error("Barbershop not found")
      }

      const barbershopData = barbershopSnap.data()
      let favoriteCount = typeof barbershopData.favoriteCount === "number" ? barbershopData.favoriteCount : 0
      let favorited: boolean

      if (favoriteDocSnap.exists()) {
        transaction.delete(favoriteDocRef)
        favoriteCount = Math.max(0, favoriteCount - 1)
        favorited = false
      } else {
        transaction.set(favoriteDocRef, {
          userId,
          barbershopId,
          createdAt: new Date(),
        })
        favoriteCount += 1
        favorited = true
      }

      transaction.update(barbershopRef, {
        favoriteCount,
        updatedAt: new Date(),
      })

      return { favorited, favoriteCount }
    })

    return result
  } catch (error) {
    console.error("[v0] Error toggling barbershop favorite:", error)
    throw error
  }
}

export async function getBarbershopFavoritesByUser(userId: string): Promise<BarbershopFavorite[]> {
  if (!userId) {
    return []
  }

  try {
    const favoritesQuery = query(collection(db, "barbershopFavorites"), where("userId", "==", userId))
    const snapshot = await getDocs(favoritesQuery)

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        userId: data.userId as string,
        barbershopId: data.barbershopId as string,
        createdAt: data.createdAt?.toDate() || new Date(),
      }
    })
  } catch (error) {
    console.error("[v0] Error fetching barbershop favorites:", error)
    return []
  }
}

// Bookings
export async function getBookingsByBarbershop(barbershopId: string): Promise<Booking[]> {
  try {
    const q = query(collection(db, "bookings"), where("barbershopId", "==", barbershopId))
    const querySnapshot = await getDocs(q)
    const bookings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Booking[]
    const normalizedBookings = await autoCompletePastBookings(bookings)

    // Ordenar no client-side para evitar necessidade de índice composto
    return normalizedBookings.sort((a, b) => b.date.getTime() - a.date.getTime())
  } catch (error) {
    console.error("[v0] Error fetching bookings:", error)
    return []
  }
}

export async function getBookingsByClient(clientId: string): Promise<Booking[]> {
  try {
    const q = query(collection(db, "bookings"), where("clientId", "==", clientId))
    const querySnapshot = await getDocs(q)
    const bookings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Booking[]
    const normalizedBookings = await autoCompletePastBookings(bookings)

    // Ordenar no client-side para evitar necessidade de índice composto
    return normalizedBookings.sort((a, b) => b.date.getTime() - a.date.getTime())
  } catch (error) {
    console.error("[v0] Error fetching bookings:", error)
    return []
  }
}

export async function createBooking(data: Omit<Booking, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "bookings"), data)
    return docRef.id
  } catch (error) {
    console.error("[v0] Error creating booking:", error)
    throw error
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking["status"],
  options?: { updatedBy?: string; note?: string }
): Promise<void> {
  try {
    const bookingRef = doc(db, "bookings", bookingId)

    const updatePayload: Record<string, any> = {
      status,
      updatedAt: new Date(),
      updatedBy: options?.updatedBy,
    }

    if (options?.note) {
      updatePayload.statusNote = options.note
    }

    if (status === "confirmed") {
      updatePayload.confirmedAt = new Date()
    }

    if (status === "completed") {
      updatePayload.completedAt = new Date()
    }

    if (status === "cancelled") {
      updatePayload.cancelledAt = new Date()
    }

    const cleanPayload = removeUndefinedFields(updatePayload)

    await updateDoc(bookingRef, cleanPayload)
  } catch (error) {
    console.error("[v0] Error updating booking status:", error)
    throw error
  }
}

function isBookingInPast(booking: Booking): boolean {
  try {
    if (!booking?.date || !booking?.time) {
      return false
    }

    const [hours, minutes] = booking.time.split(":").map((value) => Number.parseInt(value, 10))

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return false
    }

    const scheduledAt = new Date(booking.date)
    scheduledAt.setHours(hours, minutes, 0, 0)

    const now = new Date()
    return scheduledAt.getTime() < now.getTime()
  } catch (error) {
    console.error("[v0] Error checking booking date:", error)
    return false
  }
}

async function autoCompletePastBookings(bookings: Booking[]): Promise<Booking[]> {
  if (!bookings.length) {
    return bookings
  }

  const updates = await Promise.all(
    bookings.map(async (booking) => {
      if (
        (booking.status === "pending" || booking.status === "confirmed") &&
        isBookingInPast(booking)
      ) {
        try {
          const now = new Date()
          await updateBookingStatus(booking.id, "completed", {
            updatedBy: "system-auto",
            note: "Auto-completed: horário finalizado",
          })

          return {
            ...booking,
            status: "completed" as Booking["status"],
            completedAt: now,
            updatedAt: now,
            updatedBy: "system-auto",
            statusNote: "Auto-completed: horário finalizado",
          }
        } catch (error) {
          console.error("[v0] Error auto completing booking:", error)
        }
      }

      return booking
    })
  )

  return updates
}

// Reviews
export async function canUserReviewBarbershop(userId: string, barbershopId: string): Promise<boolean> {
  try {
    // Verificar se o usuário já fez algum review para esta barbearia
    const existingReviewQuery = query(
      collection(db, "reviews"), 
      where("clientId", "==", userId),
      where("barbershopId", "==", barbershopId)
    )
    const existingReviewSnapshot = await getDocs(existingReviewQuery)
    
    // Se já fez review, não pode fazer outro
    if (!existingReviewSnapshot.empty) {
      return false
    }
    
    // Verificar se tem agendamento concluído nesta barbearia
    const completedBookingQuery = query(
      collection(db, "bookings"),
      where("clientId", "==", userId),
      where("barbershopId", "==", barbershopId),
      where("status", "==", "completed")
    )
    const completedBookingSnapshot = await getDocs(completedBookingQuery)
    
    // Só pode fazer review se tiver pelo menos um agendamento concluído
    return !completedBookingSnapshot.empty
  } catch (error) {
    console.error("[v0] Error checking review eligibility:", error)
    return false
  }
}

export async function getReviewsByBarbershop(barbershopId: string): Promise<Review[]> {
  try {
    const q = query(collection(db, "reviews"), where("barbershopId", "==", barbershopId))
    const querySnapshot = await getDocs(q)
    const reviews = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Review[]
    
    // Ordenar no client-side para evitar necessidade de índice composto
    return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error("[v0] Error fetching reviews:", error)
    return []
  }
}

export async function getReviewsByUser(clientId: string): Promise<Review[]> {
  try {
    const q = query(collection(db, "reviews"), where("clientId", "==", clientId))
    const querySnapshot = await getDocs(q)
    const reviews = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Review[]

    return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error("[v0] Error fetching user reviews:", error)
    return []
  }
}

export async function hasUserReviewedBarbershop(userId: string, barbershopId: string): Promise<boolean> {
  if (!userId) {
    return false
  }

  try {
    const reviewQuery = query(
      collection(db, "reviews"),
      where("clientId", "==", userId),
      where("barbershopId", "==", barbershopId)
    )
    const snapshot = await getDocs(reviewQuery)
    return !snapshot.empty
  } catch (error) {
    console.error("[v0] Error checking if user reviewed barbershop:", error)
    return false
  }
}

export async function createReview(data: Omit<Review, "id">): Promise<string> {
  try {
    // Preparar dados removendo campos undefined
    const cleanData: any = {
      clientId: data.clientId,
      clientName: data.clientName,
      barbershopId: data.barbershopId,
      rating: data.rating,
      comment: data.comment,
      createdAt: data.createdAt,
      updatedAt: data.createdAt,
    }
    
    // Só adicionar clientAvatar se não for undefined
    if (data.clientAvatar !== undefined) {
      cleanData.clientAvatar = data.clientAvatar
    }
    
    const docRef = await addDoc(collection(db, "reviews"), cleanData)
    await updateBarbershopRatingStats(data.barbershopId, data.rating)
    return docRef.id
  } catch (error) {
    console.error("[v0] Error creating review:", error)
    throw error
  }
}

export async function updateReview(
  reviewId: string,
  updates: { rating: number; comment: string }
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const reviewRef = doc(db, "reviews", reviewId)
      const reviewSnap = await transaction.get(reviewRef)

      if (!reviewSnap.exists()) {
        throw new Error("Review not found")
      }

      const reviewData = reviewSnap.data()
      const barbershopId = reviewData.barbershopId as string
      const previousRating = typeof reviewData.rating === "number" ? reviewData.rating : 0

      const barbershopRef = doc(db, "barbershops", barbershopId)
      const barbershopSnap = await transaction.get(barbershopRef)

      transaction.update(reviewRef, {
        rating: updates.rating,
        comment: updates.comment,
        updatedAt: new Date(),
      })

      if (!barbershopSnap.exists()) {
        return
      }

      const shopData = barbershopSnap.data()
      const reviewCount = typeof shopData.reviewCount === "number" ? shopData.reviewCount : 0
      const currentRating = typeof shopData.rating === "number" ? shopData.rating : 0

      if (reviewCount <= 0) {
        transaction.update(barbershopRef, {
          rating: Number.parseFloat(updates.rating.toFixed(2)),
          reviewCount: 1,
          updatedAt: new Date(),
        })
        return
      }

      const adjustedRating = Number.parseFloat(
        (((currentRating * reviewCount) - previousRating + updates.rating) / reviewCount).toFixed(2)
      )

      transaction.update(barbershopRef, {
        rating: adjustedRating,
        updatedAt: new Date(),
      })
    })
  } catch (error) {
    console.error("[v0] Error updating review:", error)
    throw error
  }
}

async function updateBarbershopRatingStats(barbershopId: string, newRating: number): Promise<void> {
  try {
    const barbershopRef = doc(db, "barbershops", barbershopId)

    await runTransaction(db, async (transaction) => {
      const barbershopSnap = await transaction.get(barbershopRef)
      if (!barbershopSnap.exists()) {
        return
      }

      const data = barbershopSnap.data()
      const currentCount = typeof data.reviewCount === "number" ? data.reviewCount : 0
      const currentRating = typeof data.rating === "number" ? data.rating : 0

      const updatedCount = currentCount + 1
      const updatedRating = Number.parseFloat(
        ((currentRating * currentCount + newRating) / updatedCount).toFixed(2)
      )

      transaction.update(barbershopRef, {
        reviewCount: updatedCount,
        rating: updatedRating,
        updatedAt: new Date()
      })
    })
  } catch (error) {
    console.error("[v0] Error updating barbershop rating stats:", error)
  }
}

// Employees - buscar funcionários de uma barbearia específica
export async function getEmployeesByBarbershop(barbershopId: string): Promise<BarbershopEmployee[]> {
  try {
    // Buscar a barbearia primeiro
    const barbershopDoc = await getDoc(doc(db, "barbershops", barbershopId))
    
    if (!barbershopDoc.exists()) {
      return []
    }

    const barbershopData = barbershopDoc.data()
    const employees = barbershopData.employees || {}
    
    // Converter objeto de funcionários em array
    return Object.values(employees).map((employee: any) => ({
      userId: employee.userId,
      name: employee.name,
      email: employee.email,
      avatar: employee.avatar,
      phone: employee.phone,
      role: employee.role,
      joinedAt: employee.joinedAt?.toDate() || new Date(),
      isActive: employee.isActive,
      permissions: employee.permissions
    })) as BarbershopEmployee[]
  } catch (error) {
    console.error("[v0] Error fetching employees:", error)
    return []
  }
}
