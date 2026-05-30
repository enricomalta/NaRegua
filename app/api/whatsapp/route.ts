import { NextRequest, NextResponse } from "next/server"
import { Timestamp } from "firebase-admin/firestore"
import { timingSafeEqual } from "node:crypto"
import { adminDb } from "@/lib/firebase-admin"

type WhatsAppAction =
  | "get_services"
  | "get_prices"
  | "get_available_slots"
  | "book_appointment"
  | "cancel_appointment"

type RequestBody = {
  action?: WhatsAppAction
  secret_key?: string
  payload?: Record<string, any>
}

type TimeSlot = { start: string; end: string }

type WorkingHours = {
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
  sunday: TimeSlot[]
}

const STATUS_BLOCKED = new Set(["pending", "confirmed"])

function getConfiguredSecret(): string | null {
  const secret = process.env.WHATSAPP_BOT_SECRET_KEY ?? process.env.WHATSAPP_SECRET_KEY ?? null
  return secret && secret.trim().length > 0 ? secret.trim() : null
}

function safeSecretEquals(expected: string, provided: string): boolean {
  const expectedBuf = Buffer.from(expected, "utf8")
  const providedBuf = Buffer.from(provided, "utf8")

  if (expectedBuf.length !== providedBuf.length) {
    return false
  }

  return timingSafeEqual(expectedBuf, providedBuf)
}

function normalizeObjectArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value as T[]

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort((a, b) => {
        const numA = Number(a)
        const numB = Number(b)
        if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB
        return a.localeCompare(b)
      })
      .map((key) => value[key] as T)
  }

  return []
}

function ensureWorkingHours(raw: any): WorkingHours {
  return {
    monday: normalizeObjectArray(raw?.monday),
    tuesday: normalizeObjectArray(raw?.tuesday),
    wednesday: normalizeObjectArray(raw?.wednesday),
    thursday: normalizeObjectArray(raw?.thursday),
    friday: normalizeObjectArray(raw?.friday),
    saturday: normalizeObjectArray(raw?.saturday),
    sunday: normalizeObjectArray(raw?.sunday),
  }
}

function ensureDate(value: any): Date {
  if (value instanceof Date) return value
  if (value instanceof Timestamp) return value.toDate()
  if (value && typeof value?.toDate === "function") return value.toDate()
  return new Date(value)
}

function parseIsoDate(dateStr: string): Date {
  const parts = dateStr.split("-")
  if (parts.length !== 3) throw new Error("date deve estar no formato YYYY-MM-DD")

  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])

  if ([year, month, day].some((num) => !Number.isInteger(num))) {
    throw new Error("date invalida")
  }

  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) throw new Error("date invalida")
  return date
}

function isWithinDay(date: Date, dayStart: Date, dayEnd: Date): boolean {
  const ms = date.getTime()
  return ms >= dayStart.getTime() && ms <= dayEnd.getTime()
}

function minutesFromTime(time: string): number {
  const [h, m] = time.split(":").map(Number)
  if (!Number.isInteger(h) || !Number.isInteger(m)) {
    throw new Error("time invalido, esperado HH:mm")
  }
  return h * 60 + m
}

function timeFromMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function getDayKey(date: Date): keyof WorkingHours {
  const index = date.getDay()
  const map: Array<keyof WorkingHours> = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ]
  return map[index]
}

function generateTimeSlots(start: string, end: string, durationMinutes: number): string[] {
  const startMinutes = minutesFromTime(start)
  const endMinutes = minutesFromTime(end)
  if (durationMinutes <= 0 || endMinutes <= startMinutes) return []

  const output: string[] = []
  for (let current = startMinutes; current + durationMinutes <= endMinutes; current += durationMinutes) {
    output.push(timeFromMinutes(current))
  }

  return output
}

async function requireBarbershop(barbershopId: string): Promise<Record<string, any> & { id: string }> {
  const shopDoc = await adminDb.collection("barbershops").doc(barbershopId).get()
  if (!shopDoc.exists) {
    throw new Error("barbershop nao encontrada")
  }

  return { id: shopDoc.id, ...(shopDoc.data() ?? {}) }
}

function normalizeServices(rawServices: any): Array<{
  id: string
  name: string
  description: string
  price: number
  duration: number
}> {
  return normalizeObjectArray<any>(rawServices).map((service, index) => ({
    id: String(service?.id ?? index),
    name: String(service?.name ?? ""),
    description: String(service?.description ?? ""),
    price: Number(service?.price ?? 0),
    duration: Number(service?.duration ?? 0),
  }))
}

async function getServices(payload: Record<string, any>) {
  const barbershopId = String(payload?.barbershopId ?? "")
  if (!barbershopId) throw new Error("barbershopId obrigatorio")

  const shop = await requireBarbershop(barbershopId)
  const services = normalizeServices(shop.services)

  return {
    barbershopId,
    services,
  }
}

async function getPrices(payload: Record<string, any>) {
  const result = await getServices(payload)

  return {
    barbershopId: result.barbershopId,
    prices: result.services.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration,
    })),
  }
}

async function getAvailableSlots(payload: Record<string, any>) {
  const barbershopId = String(payload?.barbershopId ?? "")
  const dateStr = String(payload?.date ?? "")
  const serviceId = payload?.serviceId ? String(payload.serviceId) : null
  const fallbackDuration = Number(payload?.durationMinutes ?? 30)

  if (!barbershopId) throw new Error("barbershopId obrigatorio")
  if (!dateStr) throw new Error("date obrigatoria, formato YYYY-MM-DD")

  const targetDate = parseIsoDate(dateStr)
  const dayStart = new Date(targetDate)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(targetDate)
  dayEnd.setHours(23, 59, 59, 999)

  const shop = await requireBarbershop(barbershopId)
  const services = normalizeServices(shop.services)
  const workingHours = ensureWorkingHours(shop.workingHours)
  const dayKey = getDayKey(targetDate)
  const slotsForDay = workingHours[dayKey]

  if (!slotsForDay || slotsForDay.length === 0) {
    return {
      barbershopId,
      date: dateStr,
      availableSlots: [],
      reason: "barbershop fechada neste dia",
    }
  }

  const serviceDuration = serviceId
    ? services.find((service) => service.id === serviceId)?.duration ?? fallbackDuration
    : fallbackDuration

  const allPossible = slotsForDay.flatMap((slot) => generateTimeSlots(slot.start, slot.end, serviceDuration))

  // Query simplificada para evitar dependencia de indice composto.
  const existingBookingsSnap = await adminDb
    .collection("bookings")
    .where("barbershopId", "==", barbershopId)
    .get()

  const blockedTimes = new Set<string>()
  existingBookingsSnap.forEach((doc) => {
    const data = doc.data() ?? {}
    const bookingDate = ensureDate(data.date)
    if (isWithinDay(bookingDate, dayStart, dayEnd) && STATUS_BLOCKED.has(String(data.status ?? ""))) {
      blockedTimes.add(String(data.time ?? ""))
    }
  })

  const availableSlots = allPossible.filter((time) => !blockedTimes.has(time))

  return {
    barbershopId,
    date: dateStr,
    serviceId,
    durationMinutes: serviceDuration,
    availableSlots,
  }
}

async function bookAppointment(payload: Record<string, any>) {
  const barbershopId = String(payload?.barbershopId ?? "")
  const serviceId = String(payload?.serviceId ?? "")
  const dateStr = String(payload?.date ?? "")
  const time = String(payload?.time ?? "")

  if (!barbershopId) throw new Error("barbershopId obrigatorio")
  if (!serviceId) throw new Error("serviceId obrigatorio")
  if (!dateStr) throw new Error("date obrigatoria, formato YYYY-MM-DD")
  if (!time) throw new Error("time obrigatorio, formato HH:mm")

  const targetDate = parseIsoDate(dateStr)

  const shop = await requireBarbershop(barbershopId)
  const services = normalizeServices(shop.services)
  const selectedService = services.find((service) => service.id === serviceId)
  if (!selectedService) {
    throw new Error("serviceId invalido para a barbershop informada")
  }

  // Verifica conflito exato de horario antes de gravar sem indice composto.
  const dayStart = new Date(targetDate)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(targetDate)
  dayEnd.setHours(23, 59, 59, 999)

  const conflictQuery = await adminDb
    .collection("bookings")
    .where("barbershopId", "==", barbershopId)
    .get()

  const hasConflict = conflictQuery.docs.some((doc) => {
    const data = doc.data() ?? {}
    const status = String(data.status ?? "")
    const bookingTime = String(data.time ?? "")
    const bookingDate = ensureDate(data.date)
    return bookingTime === time && isWithinDay(bookingDate, dayStart, dayEnd) && STATUS_BLOCKED.has(status)
  })

  if (hasConflict) {
    throw new Error("horario indisponivel")
  }

  const clientPhone = payload?.clientPhone ? String(payload.clientPhone) : undefined
  const bookingData = {
    clientId: payload?.clientId ? String(payload.clientId) : `whatsapp:${clientPhone ?? "unknown"}`,
    clientName: payload?.clientName ? String(payload.clientName) : "Cliente WhatsApp",
    clientPhone,
    source: "whatsapp",
    barbershopId,
    serviceId,
    date: targetDate,
    time,
    status: "pending",
    notes: payload?.notes ? String(payload.notes) : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    updatedBy: "whatsapp-bot",
  }

  const ref = await adminDb.collection("bookings").add(bookingData)

  return {
    bookingId: ref.id,
    barbershopId,
    serviceId,
    date: dateStr,
    time,
    status: "pending",
  }
}

async function cancelAppointment(payload: Record<string, any>) {
  const bookingId = String(payload?.bookingId ?? "")
  if (!bookingId) throw new Error("bookingId obrigatorio")

  const bookingRef = adminDb.collection("bookings").doc(bookingId)
  const bookingDoc = await bookingRef.get()

  if (!bookingDoc.exists) {
    throw new Error("agendamento nao encontrado")
  }

  await bookingRef.update({
    status: "cancelled",
    cancelledAt: new Date(),
    updatedAt: new Date(),
    updatedBy: "whatsapp-bot",
    statusNote: payload?.reason ? String(payload.reason) : "Cancelado via WhatsApp",
  })

  return {
    bookingId,
    status: "cancelled",
  }
}

const handlers: Record<WhatsAppAction, (payload: Record<string, any>) => Promise<any>> = {
  get_services: getServices,
  get_prices: getPrices,
  get_available_slots: getAvailableSlots,
  book_appointment: bookAppointment,
  cancel_appointment: cancelAppointment,
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody
    const action = body.action

    if (!action || !(action in handlers)) {
      return NextResponse.json(
        {
          error: "action invalida",
          allowedActions: Object.keys(handlers),
        },
        { status: 400 }
      )
    }

    const configuredSecret = getConfiguredSecret()
    if (!configuredSecret) {
      return NextResponse.json(
        { error: "WHATSAPP_BOT_SECRET_KEY nao configurada no servidor" },
        { status: 500 }
      )
    }

    const providedSecret =
      request.headers.get("x-secret-key") ??
      request.headers.get("x-api-key") ??
      body.secret_key ??
      ""

    if (!safeSecretEquals(configuredSecret, String(providedSecret))) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const result = await handlers[action](body.payload ?? {})
    return NextResponse.json({ ok: true, action, result })
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Erro interno"
    console.error("[api/whatsapp] Error:", error)

    if (
      message.includes("obrigatorio") ||
      message.includes("invalido") ||
      message.includes("formato")
    ) {
      return NextResponse.json({ error: message }, { status: 400 })
    }

    if (message.includes("nao encontrada") || message.includes("nao encontrado")) {
      return NextResponse.json({ error: message }, { status: 404 })
    }

    if (message.includes("horario indisponivel")) {
      return NextResponse.json({ error: message }, { status: 409 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
