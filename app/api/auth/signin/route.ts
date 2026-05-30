import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

function getAuthApiKey(): string | null {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha sao obrigatorios." }, { status: 400 })
    }

    const apiKey = getAuthApiKey()
    if (!apiKey) {
      return NextResponse.json({ error: "Chave de autenticacao nao configurada." }, { status: 500 })
    }

    const signInResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    )

    if (!signInResponse.ok) {
      return NextResponse.json({ error: "Email ou senha invalidos." }, { status: 401 })
    }

    const signInData = (await signInResponse.json()) as { localId: string }
    const uid = signInData.localId

    const userDoc = await adminDb.collection("users").doc(uid).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: "Dados de usuario nao encontrados." }, { status: 404 })
    }

    const customToken = await adminAuth.createCustomToken(uid)

    return NextResponse.json({
      user: {
        id: uid,
        ...userDoc.data(),
      },
      customToken,
    })
  } catch (error) {
    console.error("[api/auth/signin] Error:", error)
    return NextResponse.json({ error: "Erro ao autenticar usuario." }, { status: 500 })
  }
}
