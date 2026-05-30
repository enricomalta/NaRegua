import { NextRequest, NextResponse } from "next/server"
import { Timestamp } from "firebase-admin/firestore"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

type ApiBody = {
  action?: string
  payload?: Record<string, any>
}

function toDate(value: any): Date {
  if (!value) return new Date()
  if (value instanceof Date) return value
  if (value instanceof Timestamp) return value.toDate()
  if (typeof value?.toDate === "function") return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function serialize(value: any): any {
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (Array.isArray(value)) return value.map(serialize)
  if (value && typeof value === "object") {
    const output: Record<string, any> = {}
    for (const [key, inner] of Object.entries(value)) {
      output[key] = serialize(inner)
    }
    return output
  }
  return value
}

function requireFields(payload: Record<string, any>, fields: string[]) {
  for (const field of fields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
      throw new Error(`Campo obrigatorio ausente: ${field}`)
    }
  }
}

async function getUserById(payload: Record<string, any>) {
  requireFields(payload, ["uid"])
  const doc = await adminDb.collection("users").doc(payload.uid).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() }
}

async function getPublicUserProfileById(payload: Record<string, any>) {
  requireFields(payload, ["uid"])
  const doc = await adminDb.collection("userPublicProfiles").doc(payload.uid).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() }
}

async function updateUserProfile(payload: Record<string, any>) {
  requireFields(payload, ["userId"])
  const { userId, data } = payload

  const cleanedData = Object.fromEntries(
    Object.entries(data ?? {}).filter(([, value]) => value !== undefined)
  )

  await adminDb.collection("users").doc(userId).update({
    ...cleanedData,
    updatedAt: new Date(),
  })

  const updated = await adminDb.collection("users").doc(userId).get()
  return updated.exists ? { id: updated.id, ...updated.data() } : null
}

async function updateUserSettings(payload: Record<string, any>) {
  requireFields(payload, ["userId", "settings"])
  const { userId, settings } = payload

  const userDoc = await adminDb.collection("users").doc(userId).get()
  if (!userDoc.exists) return null

  const userData = userDoc.data() ?? {}
  const mergedSettings = {
    ...(userData.settings ?? {}),
    ...(settings ?? {}),
    notifications: {
      ...(userData.settings?.notifications ?? {}),
      ...(settings?.notifications ?? {}),
    },
    privacy: {
      ...(userData.settings?.privacy ?? {}),
      ...(settings?.privacy ?? {}),
    },
    appearance: {
      ...(userData.settings?.appearance ?? {}),
      ...(settings?.appearance ?? {}),
    },
  }

  await adminDb.collection("users").doc(userId).update({
    settings: mergedSettings,
    updatedAt: new Date(),
  })

  const updated = await adminDb.collection("users").doc(userId).get()
  return updated.exists ? { id: updated.id, ...updated.data() } : null
}

async function getBarbershops() {
  const snapshot = await adminDb.collection("barbershops").get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

async function getBarbershopById(payload: Record<string, any>) {
  requireFields(payload, ["id"])
  const doc = await adminDb.collection("barbershops").doc(payload.id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() }
}

async function createBarbershop(payload: Record<string, any>) {
  requireFields(payload, ["data"])
  const docRef = await adminDb.collection("barbershops").add(payload.data)
  return { id: docRef.id }
}

async function createBarbershopWithOwner(payload: Record<string, any>) {
  requireFields(payload, ["barbershopData", "ownerId", "ownerData"])
  const { barbershopData, ownerId, ownerData } = payload

  // Strip undefined fields recursively to satisfy Firestore
  function stripUndefined(obj: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined) continue
      if (v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date))
        out[k] = stripUndefined(v)
      else out[k] = v
    }
    return out
  }

  const permissions = {
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

  const joinedAt = new Date()

  const employeeData = stripUndefined({
    userId: ownerId,
    name: ownerData.name,
    email: ownerData.email,
    avatar: ownerData.avatar,
    phone: ownerData.phone,
    role: "owner",
    joinedAt,
    isActive: true,
    permissions,
  })

  const barbershopId = adminDb.collection("barbershops").doc().id
  const barbershopRef = adminDb.collection("barbershops").doc(barbershopId)
  const userRef = adminDb.collection("users").doc(ownerId)

  const cleanBarbershopData = stripUndefined({
    ...barbershopData,
    employees: { [ownerId]: employeeData },
  })

  const employmentData = stripUndefined({
    barbershopId,
    barbershopName: barbershopData.name,
    role: "owner",
    joinedAt,
    isActive: true,
    permissions,
  })

  // Atomic batch: barbershop doc + user employment in a single commit
  const batch = adminDb.batch()
  batch.set(barbershopRef, cleanBarbershopData)
  batch.update(userRef, { [`employments.${barbershopId}`]: employmentData })
  await batch.commit()

  return { id: barbershopId }
}

async function updateBarbershop(payload: Record<string, any>) {
  requireFields(payload, ["id", "data"])
  const cleanedData = Object.fromEntries(
    Object.entries(payload.data ?? {}).filter(([, value]) => value !== undefined)
  )
  await adminDb.collection("barbershops").doc(payload.id).update(cleanedData)
  return { ok: true }
}

async function isBarbershopFavorited(payload: Record<string, any>) {
  requireFields(payload, ["userId", "barbershopId"])
  const docId = `${payload.userId}_${payload.barbershopId}`
  const favoriteDoc = await adminDb.collection("barbershopFavorites").doc(docId).get()
  return { favorited: favoriteDoc.exists }
}

async function toggleBarbershopFavorite(payload: Record<string, any>) {
  requireFields(payload, ["userId", "barbershopId"])
  const { userId, barbershopId } = payload

  const result = await adminDb.runTransaction(async (tx) => {
    const favoriteRef = adminDb.collection("barbershopFavorites").doc(`${userId}_${barbershopId}`)
    const barbershopRef = adminDb.collection("barbershops").doc(barbershopId)

    const [favoriteSnap, barbershopSnap] = await Promise.all([tx.get(favoriteRef), tx.get(barbershopRef)])

    if (!barbershopSnap.exists) {
      throw new Error("Barbershop not found")
    }

    const barbershopData = barbershopSnap.data() ?? {}
    let favoriteCount = typeof barbershopData.favoriteCount === "number" ? barbershopData.favoriteCount : 0
    let favorited = false

    if (favoriteSnap.exists) {
      tx.delete(favoriteRef)
      favoriteCount = Math.max(0, favoriteCount - 1)
      favorited = false
    } else {
      tx.set(favoriteRef, {
        userId,
        barbershopId,
        createdAt: new Date(),
      })
      favoriteCount += 1
      favorited = true
    }

    tx.update(barbershopRef, {
      favoriteCount,
      updatedAt: new Date(),
    })

    return { favorited, favoriteCount }
  })

  return result
}

async function getBarbershopFavoritesByUser(payload: Record<string, any>) {
  requireFields(payload, ["userId"])
  const snapshot = await adminDb.collection("barbershopFavorites").where("userId", "==", payload.userId).get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

async function getBookingsByBarbershop(payload: Record<string, any>) {
  requireFields(payload, ["barbershopId"])
  const snapshot = await adminDb.collection("bookings").where("barbershopId", "==", payload.barbershopId).get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

async function getBookingsByClient(payload: Record<string, any>) {
  requireFields(payload, ["clientId"])
  const snapshot = await adminDb.collection("bookings").where("clientId", "==", payload.clientId).get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

async function createBooking(payload: Record<string, any>) {
  requireFields(payload, ["data"])
  const docRef = await adminDb.collection("bookings").add(payload.data)
  return { id: docRef.id }
}

async function updateBookingStatus(payload: Record<string, any>) {
  requireFields(payload, ["bookingId", "status"])
  const { bookingId, status, options } = payload

  const updateData: Record<string, any> = {
    status,
    updatedAt: new Date(),
  }

  if (options?.updatedBy !== undefined) updateData.updatedBy = options.updatedBy
  if (options?.note !== undefined) updateData.statusNote = options.note

  if (status === "confirmed") updateData.confirmedAt = new Date()
  if (status === "completed") updateData.completedAt = new Date()
  if (status === "cancelled") updateData.cancelledAt = new Date()

  await adminDb.collection("bookings").doc(bookingId).update(updateData)
  return { ok: true }
}

async function canUserReviewBarbershop(payload: Record<string, any>) {
  requireFields(payload, ["userId", "barbershopId"])
  const { userId, barbershopId } = payload

  const existingReview = await adminDb
    .collection("reviews")
    .where("clientId", "==", userId)
    .where("barbershopId", "==", barbershopId)
    .limit(1)
    .get()

  if (!existingReview.empty) {
    return { canReview: false }
  }

  const completedBooking = await adminDb
    .collection("bookings")
    .where("clientId", "==", userId)
    .where("barbershopId", "==", barbershopId)
    .where("status", "==", "completed")
    .limit(1)
    .get()

  return { canReview: !completedBooking.empty }
}

async function getReviewsByBarbershop(payload: Record<string, any>) {
  requireFields(payload, ["barbershopId"])
  const snapshot = await adminDb.collection("reviews").where("barbershopId", "==", payload.barbershopId).get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

async function getReviewsByUser(payload: Record<string, any>) {
  requireFields(payload, ["clientId"])
  const snapshot = await adminDb.collection("reviews").where("clientId", "==", payload.clientId).get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

async function hasUserReviewedBarbershop(payload: Record<string, any>) {
  requireFields(payload, ["userId", "barbershopId"])
  const snapshot = await adminDb
    .collection("reviews")
    .where("clientId", "==", payload.userId)
    .where("barbershopId", "==", payload.barbershopId)
    .limit(1)
    .get()

  return { reviewed: !snapshot.empty }
}

async function createReview(payload: Record<string, any>) {
  requireFields(payload, ["data"])
  const { data } = payload

  const now = new Date()
  const reviewData = {
    ...data,
    createdAt: data.createdAt ? toDate(data.createdAt) : now,
    updatedAt: now,
  }

  const docRef = await adminDb.collection("reviews").add(reviewData)

  await adminDb.runTransaction(async (tx) => {
    const barbershopRef = adminDb.collection("barbershops").doc(data.barbershopId)
    const barbershopSnap = await tx.get(barbershopRef)
    if (!barbershopSnap.exists) return

    const shopData = barbershopSnap.data() ?? {}
    const currentCount = typeof shopData.reviewCount === "number" ? shopData.reviewCount : 0
    const currentRating = typeof shopData.rating === "number" ? shopData.rating : 0
    const updatedCount = currentCount + 1
    const updatedRating = Number.parseFloat(
      ((currentRating * currentCount + Number(data.rating)) / updatedCount).toFixed(2)
    )

    tx.update(barbershopRef, {
      reviewCount: updatedCount,
      rating: updatedRating,
      updatedAt: now,
    })
  })

  return { id: docRef.id }
}

async function updateReview(payload: Record<string, any>) {
  requireFields(payload, ["reviewId", "updates"])
  const { reviewId, updates } = payload

  await adminDb.runTransaction(async (tx) => {
    const reviewRef = adminDb.collection("reviews").doc(reviewId)
    const reviewSnap = await tx.get(reviewRef)

    if (!reviewSnap.exists) {
      throw new Error("Review not found")
    }

    const reviewData = reviewSnap.data() ?? {}
    const barbershopId = reviewData.barbershopId as string
    const previousRating = typeof reviewData.rating === "number" ? reviewData.rating : 0

    const barbershopRef = adminDb.collection("barbershops").doc(barbershopId)
    const barbershopSnap = await tx.get(barbershopRef)

    tx.update(reviewRef, {
      rating: updates.rating,
      comment: updates.comment,
      updatedAt: new Date(),
    })

    if (!barbershopSnap.exists) return

    const shopData = barbershopSnap.data() ?? {}
    const reviewCount = typeof shopData.reviewCount === "number" ? shopData.reviewCount : 0
    const currentRating = typeof shopData.rating === "number" ? shopData.rating : 0

    if (reviewCount <= 0) {
      tx.update(barbershopRef, {
        rating: Number.parseFloat(Number(updates.rating).toFixed(2)),
        reviewCount: 1,
        updatedAt: new Date(),
      })
      return
    }

    const adjustedRating = Number.parseFloat(
      (((currentRating * reviewCount) - previousRating + Number(updates.rating)) / reviewCount).toFixed(2)
    )

    tx.update(barbershopRef, {
      rating: adjustedRating,
      updatedAt: new Date(),
    })
  })

  return { ok: true }
}

async function getEmployeesByBarbershop(payload: Record<string, any>) {
  requireFields(payload, ["barbershopId"])
  const doc = await adminDb.collection("barbershops").doc(payload.barbershopId).get()
  if (!doc.exists) return []

  const data = doc.data() ?? {}
  const employees = data.employees ?? {}
  return Object.values(employees)
}

const actionHandlers: Record<string, (payload: Record<string, any>) => Promise<any>> = {
  getUserById,
  getPublicUserProfileById,
  updateUserProfile,
  updateUserSettings,
  getBarbershops,
  getBarbershopById,
  createBarbershop,
  createBarbershopWithOwner,
  updateBarbershop,
  isBarbershopFavorited,
  toggleBarbershopFavorite,
  getBarbershopFavoritesByUser,
  getBookingsByBarbershop,
  getBookingsByClient,
  createBooking,
  updateBookingStatus,
  canUserReviewBarbershop,
  getReviewsByBarbershop,
  getReviewsByUser,
  hasUserReviewedBarbershop,
  createReview,
  updateReview,
  getEmployeesByBarbershop,
}

const publicActions = new Set([
  "getBarbershops",
  "getBarbershopById",
  "getReviewsByBarbershop",
  "getPublicUserProfileById",
])

const ownerBoundKeys = ["uid", "userId", "clientId", "ownerId"]

async function getRequestAuth(request: NextRequest): Promise<{ uid: string; isAdmin: boolean } | null> {
  const authorization = request.headers.get("authorization")
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null

  if (!token) {
    return null
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get()
    const role = userDoc.exists ? userDoc.data()?.role : null
    return {
      uid: decoded.uid,
      isAdmin: role === "admin",
    }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ApiBody
    const action = body.action
    const payload = body.payload ?? {}

    if (!action || !(action in actionHandlers)) {
      return NextResponse.json({ error: "Acao invalida" }, { status: 400 })
    }

    if (!publicActions.has(action)) {
      const authInfo = await getRequestAuth(request)
      if (!authInfo) {
        return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
      }

      if (!authInfo.isAdmin) {
        for (const key of ownerBoundKeys) {
          const value = payload[key]
          if (typeof value === "string" && value.length > 0 && value !== authInfo.uid) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
          }
        }
      }
    }

    const result = await actionHandlers[action](payload)
    return NextResponse.json({ result: serialize(result) })
  } catch (error) {
    console.error("[api/firebase] Error:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
