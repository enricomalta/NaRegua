import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Validating user:', userId)

    // Buscar usuário no Firestore usando Firebase Admin
    const userDoc = await adminDb.collection('users').doc(userId).get()

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    const user = {
      id: userDoc.id,
      ...userData
    }

    return NextResponse.json({ 
      success: true, 
      user 
    })

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}