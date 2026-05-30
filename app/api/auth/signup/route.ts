import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import type { UserRole, UserSettings } from "@/lib/types"

function getDefaultUserSettings(role: UserRole = "client"): UserSettings {
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
      language: "pt-BR",
    },
  }
}

function normalizeErrorMessage(code?: string): string {
  switch (code) {
    case "auth/email-already-exists":
      return "Este email ja esta em uso."
    case "auth/invalid-password":
      return "Senha invalida."
    case "auth/invalid-email":
      return "Email invalido."
    default:
      return "Erro ao criar conta."
  }
}

function removeUndefinedFields(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue
    }

    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      cleaned[key] = removeUndefinedFields(value)
      continue
    }

    cleaned[key] = value
  }

  return cleaned
}

export async function POST(request: NextRequest) {
  let createdUserId: string | null = null

  try {
    const body = await request.json()
    const { email, password, userData } = body as {
      email?: string
      password?: string
      userData?: {
        name?: string
        role?: UserRole
        phone?: string
        avatar?: string
      }
    }

    if (!email || !password || !userData?.name || !userData?.role) {
      return NextResponse.json({ error: "Dados de cadastro invalidos." }, { status: 400 })
    }

    const now = new Date()
    const role = userData.role

    let createdUser

    try {
      createdUser = await adminAuth.createUser({
        email,
        password,
        displayName: userData.name,
      })
    } catch (createError) {
      const createCode = (createError as { code?: string } | undefined)?.code

      // Auto-recupera email "orfao" no Auth sem perfil no Firestore.
      if (createCode === "auth/email-already-exists") {
        const existing = await adminAuth.getUserByEmail(email)
        const existingUserDoc = await adminDb.collection("users").doc(existing.uid).get()

        if (!existingUserDoc.exists) {
          await adminAuth.deleteUser(existing.uid)
          createdUser = await adminAuth.createUser({
            email,
            password,
            displayName: userData.name,
          })
        } else {
          throw createError
        }
      } else {
        throw createError
      }
    }

    createdUserId = createdUser.uid

    const appUser = removeUndefinedFields({
      email,
      name: userData.name,
      role,
      phone: userData.phone,
      avatar: userData.avatar,
      createdAt: now,
      updatedAt: now,
      settings: getDefaultUserSettings(role),
    })

    const publicProfile = removeUndefinedFields({
      name: userData.name,
      role,
      avatar: userData.avatar,
      createdAt: now,
      privacy: {
        isProfilePublic: true,
        showReviewHistory: true,
      },
    })

    // Escrita atomica entre as colecoes do Firestore.
    const batch = adminDb.batch()
    batch.set(adminDb.collection("users").doc(createdUser.uid), appUser)
    batch.set(adminDb.collection("userPublicProfiles").doc(createdUser.uid), publicProfile)
    await batch.commit()

    const customToken = await adminAuth.createCustomToken(createdUser.uid)

    return NextResponse.json({
      user: {
        id: createdUser.uid,
        ...appUser,
      },
      customToken,
    })
  } catch (error) {
    console.error("[api/auth/signup] Error:", error)

    // Rollback no Auth se a persistencia do Firestore falhar.
    if (createdUserId) {
      try {
        await adminAuth.deleteUser(createdUserId)
      } catch (rollbackError) {
        console.error("[api/auth/signup] Rollback error:", rollbackError)
      }
    }

    const code = (error as { code?: string } | undefined)?.code
    return NextResponse.json({ error: normalizeErrorMessage(code) }, { status: 400 })
  }
}
