"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Barbershop, Booking, Review, Employee } from "./types"
import { mockBarbershops, mockBookings, mockReviews, mockEmployees } from "./mock-data"
import * as FirebaseService from "./firebase-service"

type DataMode = "mock" | "firebase"

interface DataContextType {
  mode: DataMode
  setMode: (mode: DataMode) => void
  barbershops: Barbershop[]
  bookings: Booking[]
  reviews: Review[]
  employees: Employee[]
  loading: boolean
  refreshData: () => Promise<void>
  getBarbershopById: (id: string) => Barbershop | undefined
  getBookingsByBarbershop: (barbershopId: string) => Booking[]
  getReviewsByBarbershop: (barbershopId: string) => Review[]
  getEmployeesByBarbershop: (barbershopId: string) => Employee[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DataMode>("mock")
  const [barbershops, setBarbershops] = useState<Barbershop[]>(mockBarbershops)
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [loading, setLoading] = useState(false)

  const refreshData = async () => {
    if (mode === "mock") {
      setBarbershops(mockBarbershops)
      setBookings(mockBookings)
      setReviews(mockReviews)
      setEmployees(mockEmployees)
      return
    }

    setLoading(true)
    try {
      const [fetchedBarbershops] = await Promise.all([FirebaseService.getBarbershops()])

      setBarbershops(fetchedBarbershops)
      // Note: For bookings, reviews, and employees, we'll fetch them on-demand
      // to avoid loading all data at once
    } catch (error) {
      console.error("[v0] Error refreshing data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [mode])

  const getBarbershopById = (id: string) => {
    return barbershops.find((b) => b.id === id)
  }

  const getBookingsByBarbershop = (barbershopId: string) => {
    return bookings.filter((b) => b.barbershopId === barbershopId)
  }

  const getReviewsByBarbershop = (barbershopId: string) => {
    return reviews.filter((r) => r.barbershopId === barbershopId)
  }

  const getEmployeesByBarbershop = (barbershopId: string) => {
    return employees.filter((e) => e.barbershopId === barbershopId)
  }

  return (
    <DataContext.Provider
      value={{
        mode,
        setMode,
        barbershops,
        bookings,
        reviews,
        employees,
        loading,
        refreshData,
        getBarbershopById,
        getBookingsByBarbershop,
        getReviewsByBarbershop,
        getEmployeesByBarbershop,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
