// Firebase Service - Functions to interact with Firebase
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy } from "firebase/firestore"
import { db } from "./firebase-config"
import type { Barbershop, Booking, Review, Employee } from "./types"

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
    const q = query(collection(db, "bookings"), where("barbershopId", "==", barbershopId), orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Booking[]
  } catch (error) {
    console.error("[v0] Error fetching bookings:", error)
    return []
  }
}

export async function getBookingsByClient(clientId: string): Promise<Booking[]> {
  try {
    const q = query(collection(db, "bookings"), where("clientId", "==", clientId), orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Booking[]
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
export async function getReviewsByBarbershop(barbershopId: string): Promise<Review[]> {
  try {
    const q = query(collection(db, "reviews"), where("barbershopId", "==", barbershopId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Review[]
  } catch (error) {
    console.error("[v0] Error fetching reviews:", error)
    return []
  }
}

export async function createReview(data: Omit<Review, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "reviews"), data)
    return docRef.id
  } catch (error) {
    console.error("[v0] Error creating review:", error)
    throw error
  }
}

// Employees
export async function getEmployeesByBarbershop(barbershopId: string): Promise<Employee[]> {
  try {
    const q = query(collection(db, "employees"), where("barbershopId", "==", barbershopId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate() || new Date(),
    })) as Employee[]
  } catch (error) {
    console.error("[v0] Error fetching employees:", error)
    return []
  }
}
