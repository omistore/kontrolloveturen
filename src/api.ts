export type Order = {
  id: string
  vin?: string
  vinMasked: string
  vehicleType?: string
  status: string
  paymentStatus: string
  reportStatus: string
  amountCents?: number
  createdAt: string
}

export type ReportField = string | number | null

export type DamagePoint = {
  part: string
  status: 'clean' | 'repaired' | 'damaged'
  note: string
}

export type MileagePoint = {
  date: string
  mileage: number
  source: string
  notes?: string
  status: 'verified' | 'flagged'
}

export type StolenCheck = {
  interpol: boolean
  europol: boolean
  nationalPolice: boolean
  statusText: string
}

export type VehicleReport = {
  vehicleIdentification?: ReportField
  certificateId?: string
  manufacturer?: ReportField
  model?: ReportField
  productionYear?: ReportField
  engine?: ReportField
  fuelType?: ReportField
  bodyType?: ReportField
  country?: ReportField
  safetyScore?: number
  riskLevel?: 'i_ulet' | 'mesatar' | 'i_larte'
  horsepower?: string
  transmission?: string
  driveType?: string
  paintColor?: string
  theftStatus?: ReportField
  previousOwners?: number
  usageType?: string
  mileageHistory?: ReportField[]
  mileageDetailed?: MileagePoint[]
  accidentHistory?: ReportField
  damageRecords?: ReportField[]
  damagesDetailed?: DamagePoint[]
  auctionPhotographs?: string[]
  registrationHistory?: ReportField[]
  equipmentList?: string[]
  stolenCheck?: StolenCheck
}

export type ReportResponse = {
  order: Order
  report: VehicleReport | null
  bankTransfer?: { iban: string; bic: string; holder: string; bankName: string; reference: string }
  message: string
}

export type DecodedVin = {
  vin: string
  make: string
  model: string
  year: number
  engine?: string
  fuelType?: string
  bodyType?: string
  country?: string
}

export type AdminOrder = {
  id: string
  vin: string
  firstName: string | null
  lastName: string | null
  vehicleType: string | null
  phone: string | null
  customerEmail: string | null
  paymentStatus: string
  reportStatus: string
  orderStatus: string
  createdAt: string
  amountCents: number
}

export type AdminDashboard = {
  totalOrders: number
  totalRevenueCents: number
  totalOpenOrders: number
  orders: AdminOrder[]
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new Error('Nuk mund të lidhemi me serverin. Ju lutemi provoni përsëri më vonë.')
  }
  const body = (await response.json().catch(() => null)) as { error?: string } | null
  if (!response.ok) {
    throw new Error(body?.error || 'Kërkesa nuk u krye. Ju lutemi provoni përsëri.')
  }
  return body as T
}

export function decodeVin(vin: string): Promise<{ success: boolean; data: DecodedVin }> {
  return request<{ success: boolean; data: DecodedVin }>(`/api/vin-decode/${encodeURIComponent(vin)}`)
}

export function createOrder(order: {
  vin: string
  firstName?: string
  lastName?: string
  vehicleType?: string
  phone?: string
  email: string
}): Promise<Order> {
  return request<Order>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  })
}

export function getReport(orderId: string): Promise<ReportResponse> {
  return request<ReportResponse>(`/api/reports/${encodeURIComponent(orderId)}`)
}

export function getAdminDashboard(token: string): Promise<AdminDashboard> {
  return request<AdminDashboard>('/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function startCheckout(orderId: string): Promise<{ checkoutUrl: string }> {
  return request<{ checkoutUrl: string }>('/api/payments/checkout', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  })
}

export function updateAdminOrderStatus(
  token: string,
  orderId: string,
  status: string,
  paymentStatus?: string,
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status, paymentStatus }),
  })
}
