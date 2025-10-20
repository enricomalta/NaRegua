// Firebase Service - Functions to interact with Firebase
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, query, where, orderBy } from "firebase/firestore"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User as FirebaseUser } from "firebase/auth"
import { db, auth } from "./firebase-config"
import type { Barbershop, Booking, Review, BarbershopEmployee, User, UserRole } from "./types"

// Authentication
export async function signUpUser(email: string, password: string, userData: Omit<User, "id" | "createdAt">): Promise<User> {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Create user document in Firestore using the UID as document ID
    const user: Omit<User, "id"> = {
      ...userData,
      email: firebaseUser.email!,
      createdAt: new Date(),
    }

    const userDocRef = doc(db, "users", firebaseUser.uid)
    await setDoc(userDocRef, user)

    return {
      id: firebaseUser.uid,
      ...user,
    }
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

    return {
      id: firebaseUser.uid,
      ...userDoc.data(),
      createdAt: userDoc.data().createdAt?.toDate() || new Date(),
    } as User
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

    return {
      id: uid,
      ...userDoc.data(),
      createdAt: userDoc.data().createdAt?.toDate() || new Date(),
    } as User
  } catch (error) {
    console.error("[v0] Error fetching user:", error)
    return null
  }
}

// Barbershops
export async function getBarbershops(): Promise<Barbershop[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "barbershops"))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Barbershop[]
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
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
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
    const docRef = await addDoc(collection(db, "barbershops"), data)
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

// Nova função para criar barbearia e associar o owner automaticamente
export async function createBarbershopWithOwner(
  barbershopData: Omit<Barbershop, "id">, 
  ownerId: string,
  ownerData: { name: string; email: string; avatar?: string; phone?: string }
): Promise<string> {
  try {
    // 1. Criar a barbearia
    const barbershopRef = await addDoc(collection(db, "barbershops"), barbershopData)
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
    await updateDoc(docRef, data)
  } catch (error) {
    console.error("[v0] Error updating barbershop:", error)
    throw error
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
    
    // Ordenar no client-side para evitar necessidade de índice composto
    return bookings.sort((a, b) => b.date.getTime() - a.date.getTime())
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
    
    // Ordenar no client-side para evitar necessidade de índice composto
    return bookings.sort((a, b) => b.date.getTime() - a.date.getTime())
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
    })) as Review[]
    
    // Ordenar no client-side para evitar necessidade de índice composto
    return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error("[v0] Error fetching reviews:", error)
    return []
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
      createdAt: data.createdAt
    }
    
    // Só adicionar clientAvatar se não for undefined
    if (data.clientAvatar !== undefined) {
      cleanData.clientAvatar = data.clientAvatar
    }
    
    const docRef = await addDoc(collection(db, "reviews"), cleanData)
    return docRef.id
  } catch (error) {
    console.error("[v0] Error creating review:", error)
    throw error
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
