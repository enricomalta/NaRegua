import { NextRequest, NextResponse } from "next/server"
import { Timestamp } from "firebase-admin/firestore"
import { timingSafeEqual } from "node:crypto"
import { adminDb } from "@/lib/firebase-admin"

type WhatsAppAction =
  | "get_services"
  | "get_prices"
  | "get_available_slots"
  | "get_client_bookings"
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
const CANCELLABLE_STATUS = new Set(["pending", "confirmed"])

function normalizeString(value: unknown): string {
  return String(value ?? "").trim()
}

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

function parseIsoDateParts(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split("-")
  if (parts.length !== 3) throw new Error("date deve estar no formato YYYY-MM-DD")

  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])

  if ([year, month, day].some((num) => !Number.isInteger(num))) {
    throw new Error("date invalida")
  }

  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0))
  if (Number.isNaN(date.getTime())) throw new Error("date invalida")

  return { year, month, day }
}

function buildUtcNoonDateFromIso(dateStr: string): Date {
  const { year, month, day } = parseIsoDateParts(dateStr)
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0))
}

function dateKeyFromDateInSaoPaulo(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  if (!year || !month || !day) {
    throw new Error("Falha ao formatar data")
  }

  return `${year}-${month}-${day}`
}

function currentSaoPauloDateKeyAndMinutes(): { dateKey: string; minutes: number } {
  const now = new Date()
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now)

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0")
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0")

  if (!year || !month || !day || !Number.isInteger(hour) || !Number.isInteger(minute)) {
    throw new Error("Falha ao obter horario atual")
  }

  return {
    dateKey: `${year}-${month}-${day}`,
    minutes: hour * 60 + minute,
  }
}

function isSlotInThePastForToday(dateStr: string, time: string): boolean {
  const nowInSaoPaulo = currentSaoPauloDateKeyAndMinutes()
  return dateStr === nowInSaoPaulo.dateKey && minutesFromTime(time) <= nowInSaoPaulo.minutes
}

function normalizeBrazilPhone(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const digits = raw.replace(/\D/g, "")
  // Aceita apenas E.164 do Brasil: 55 + DDD + numero (12 ou 13 digitos)
  if (!digits.startsWith("55")) return undefined
  if (digits.length < 12 || digits.length > 13) return undefined
  return digits
}

function digitsOnly(raw: string | undefined): string {
  return raw ? raw.replace(/\D/g, "") : ""
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

function getDayKeyFromIsoDate(dateStr: string): keyof WorkingHours {
  const { year, month, day } = parseIsoDateParts(dateStr)
  const index = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)).getUTCDay()
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

function canCancelBooking(dateKey: string, time: string, status: string): boolean {
  if (!CANCELLABLE_STATUS.has(status)) return false

  const now = currentSaoPauloDateKeyAndMinutes()
  if (dateKey < now.dateKey) return false
  if (dateKey === now.dateKey && minutesFromTime(time) <= now.minutes) return false
  return true
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
  const barbershopId = normalizeString(payload?.barbershopId)
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

async function getClientBookings(payload: Record<string, any>) {
  const rawClientPhone = normalizeString(payload?.clientPhone)
  const rawClientId = normalizeString(payload?.clientId)
  const barbershopId = normalizeString(payload?.barbershopId)
  const onlyCancellable = payload?.onlyCancellable !== false

  if (!rawClientPhone && !rawClientId) {
    throw new Error("clientPhone ou clientId obrigatorio")
  }

  const phoneDigits = digitsOnly(rawClientPhone)
  const normalizedPhone = normalizeBrazilPhone(rawClientPhone)
  const candidateClientIds = new Set<string>()
  const candidatePhones = new Set<string>()

  if (rawClientId) candidateClientIds.add(rawClientId)
  if (phoneDigits) {
    candidateClientIds.add(`whatsapp:${phoneDigits}`)
    candidatePhones.add(phoneDigits)
  }
  if (normalizedPhone) {
    candidateClientIds.add(`whatsapp:${normalizedPhone}`)
    candidatePhones.add(normalizedPhone)
  }

  const snapshots = await Promise.all([
    ...Array.from(candidateClientIds).map((clientId) =>
      adminDb.collection("bookings").where("clientId", "==", clientId).get()
    ),
    ...Array.from(candidatePhones).map((clientPhone) =>
      adminDb.collection("bookings").where("clientPhone", "==", clientPhone).get()
    ),
  ])

  const uniqueBookings = new Map<string, Record<string, any>>()
  snapshots.forEach((snapshot) => {
    snapshot.forEach((doc) => {
      uniqueBookings.set(doc.id, { id: doc.id, ...(doc.data() ?? {}) })
    })
  })

  const bookings = Array.from(uniqueBookings.values()).filter((booking) => {
    if (barbershopId && booking.barbershopId !== barbershopId) return false

    const dateKey =
      typeof booking.dateKey === "string" && booking.dateKey
        ? booking.dateKey
        : dateKeyFromDateInSaoPaulo(ensureDate(booking.date))

    if (!onlyCancellable) return true
    return canCancelBooking(dateKey, String(booking.time ?? ""), String(booking.status ?? ""))
  })

  bookings.sort((a, b) => {
    const dateKeyA = typeof a.dateKey === "string" && a.dateKey ? a.dateKey : dateKeyFromDateInSaoPaulo(ensureDate(a.date))
    const dateKeyB = typeof b.dateKey === "string" && b.dateKey ? b.dateKey : dateKeyFromDateInSaoPaulo(ensureDate(b.date))
    if (dateKeyA !== dateKeyB) return dateKeyA.localeCompare(dateKeyB)
    return String(a.time ?? "").localeCompare(String(b.time ?? ""))
  })

  const uniqueBarbershopIds = Array.from(new Set(bookings.map((booking) => String(booking.barbershopId ?? "")).filter(Boolean)))
  const barbershopDocs = await Promise.all(
    uniqueBarbershopIds.map((id) => adminDb.collection("barbershops").doc(id).get())
  )

  const barbershopMap = new Map<string, Record<string, any>>()
  barbershopDocs.forEach((doc) => {
    if (doc.exists) {
      barbershopMap.set(doc.id, { id: doc.id, ...(doc.data() ?? {}) })
    }
  })

  return {
    clientPhone: rawClientPhone || undefined,
    clientId: rawClientId || undefined,
    total: bookings.length,
    bookings: bookings.map((booking) => {
      const shop = barbershopMap.get(String(booking.barbershopId ?? ""))
      const services = normalizeServices(shop?.services)
      const service = services.find((item) => item.id === String(booking.serviceId ?? ""))
      const dateKey =
        typeof booking.dateKey === "string" && booking.dateKey
          ? booking.dateKey
          : dateKeyFromDateInSaoPaulo(ensureDate(booking.date))
      const status = String(booking.status ?? "")
      const time = String(booking.time ?? "")

      return {
        bookingId: booking.id,
        barbershopId: booking.barbershopId,
        barbershopName: shop?.name ?? null,
        serviceId: booking.serviceId,
        serviceName: service?.name ?? null,
        clientName: booking.clientName ?? null,
        clientPhone: booking.clientPhone ?? null,
        date: dateKey,
        time,
        status,
        source: booking.source ?? null,
        canCancel: canCancelBooking(dateKey, time, status),
        notes: booking.notes ?? null,
      }
    }),
  }
}

async function getAvailableSlots(payload: Record<string, any>) {
  const barbershopId = normalizeString(payload?.barbershopId)
  const dateStr = normalizeString(payload?.date)
  const serviceId = payload?.serviceId ? normalizeString(payload.serviceId) : null
  const fallbackDuration = Number(payload?.durationMinutes ?? 30)

  if (!barbershopId) throw new Error("barbershopId obrigatorio")
  if (!dateStr) throw new Error("date obrigatoria, formato YYYY-MM-DD")

  // Valida formato da data recebida
  parseIsoDateParts(dateStr)

  const shop = await requireBarbershop(barbershopId)
  const services = normalizeServices(shop.services)
  const workingHours = ensureWorkingHours(shop.workingHours)
  const dayKey = getDayKeyFromIsoDate(dateStr)
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
    const bookingDateKey =
      typeof data.dateKey === "string" && data.dateKey
        ? data.dateKey
        : dateKeyFromDateInSaoPaulo(ensureDate(data.date))

    if (bookingDateKey === dateStr && STATUS_BLOCKED.has(String(data.status ?? ""))) {
      blockedTimes.add(String(data.time ?? ""))
    }
  })

  let availableSlots = allPossible.filter((time) => !blockedTimes.has(time))

  // Se a data solicitada for hoje em Sao Paulo, remove horarios que ja passaram.
  if (currentSaoPauloDateKeyAndMinutes().dateKey === dateStr) {
    const nowInSaoPaulo = currentSaoPauloDateKeyAndMinutes()
    availableSlots = availableSlots.filter((slot) => minutesFromTime(slot) > nowInSaoPaulo.minutes)
  }

  return {
    barbershopId,
    date: dateStr,
    serviceId,
    durationMinutes: serviceDuration,
    availableSlots,
  }
}

async function bookAppointment(payload: Record<string, any>) {
  const barbershopId = normalizeString(payload?.barbershopId)
  const serviceId = normalizeString(payload?.serviceId)
  const dateStr = normalizeString(payload?.date)
  const time = normalizeString(payload?.time)

  if (!barbershopId) throw new Error("barbershopId obrigatorio")
  if (!serviceId) throw new Error("serviceId obrigatorio")
  if (!dateStr) throw new Error("date obrigatoria, formato YYYY-MM-DD")
  if (!time) throw new Error("time obrigatorio, formato HH:mm")

  const targetDate = buildUtcNoonDateFromIso(dateStr)
  if (isSlotInThePastForToday(dateStr, time)) {
    throw new Error("horario ja passou para hoje")
  }

  const shop = await requireBarbershop(barbershopId)
  const services = normalizeServices(shop.services)
  const selectedService = services.find((service) => service.id === serviceId)
  if (!selectedService) {
    throw new Error("serviceId invalido para a barbershop informada")
  }

  // Verifica conflito exato de horario antes de gravar sem indice composto.
  const conflictQuery = await adminDb
    .collection("bookings")
    .where("barbershopId", "==", barbershopId)
    .get()

  const hasConflict = conflictQuery.docs.some((doc) => {
    const data = doc.data() ?? {}
    const status = String(data.status ?? "")
    const bookingTime = String(data.time ?? "")
    const bookingDateKey =
      typeof data.dateKey === "string" && data.dateKey
        ? data.dateKey
        : dateKeyFromDateInSaoPaulo(ensureDate(data.date))

    return bookingTime === time && bookingDateKey === dateStr && STATUS_BLOCKED.has(status)
  })

  if (hasConflict) {
    throw new Error("horario indisponivel")
  }

  const clientPhone = normalizeBrazilPhone(payload?.clientPhone ? normalizeString(payload.clientPhone) : undefined)
  const rawPhoneDigits = digitsOnly(payload?.clientPhone ? normalizeString(payload.clientPhone) : undefined)
  const rawClientId = payload?.clientId ? normalizeString(payload.clientId) : undefined
  const clientId =
    rawClientId && rawClientId.trim().length > 0
      ? rawClientId
      : rawPhoneDigits
      ? `whatsapp:${rawPhoneDigits}`
      : `whatsapp:${Date.now()}`
  const clientName = payload?.clientName ? normalizeString(payload.clientName) : ""

  const bookingData: Record<string, any> = {
    clientId,
    clientName: clientName || "Cliente WhatsApp",
    source: "whatsapp",
    barbershopId,
    serviceId,
    date: targetDate,
    dateKey: dateStr,
    time,
    status: "pending",
    notes: payload?.notes ? normalizeString(payload.notes) : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    updatedBy: "whatsapp-bot",
  }

  if (clientPhone !== undefined) bookingData.clientPhone = clientPhone

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
  const bookingId = normalizeString(payload?.bookingId)
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
    statusNote: payload?.reason ? normalizeString(payload.reason) : "Cancelado via WhatsApp",
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
  get_client_bookings: getClientBookings,
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

    if (message.includes("horario indisponivel") || message.includes("horario ja passou")) {
      return NextResponse.json({ error: message }, { status: 409 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
