import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatTime(time: string): string {
  return time
}

export function generateTimeSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = []
  const [startHour, startMinute] = start.split(":").map(Number)
  const [endHour, endMinute] = end.split(":").map(Number)

  let currentMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute

  while (currentMinutes + duration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60)
    const minutes = currentMinutes % 60
    slots.push(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`)
    currentMinutes += duration
  }

  return slots
}

export function getDayOfWeek(
  date: Date,
): "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const
  return days[date.getDay()]
}

export function calculateDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRadians = (value: number) => (value * Math.PI) / 180

  const R = 6371 // Earth radius in km
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
