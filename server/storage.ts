import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { pool } from './db.js'

export type UserRecord = {
  id: string
  email: string
  created_at: string
}

export type OrderRecord = {
  id: string
  user_id: string | null
  vin: string
  first_name: string | null
  last_name: string | null
  vehicle_type: string | null
  phone: string | null
  status: string
  created_at: string
  updated_at: string
}

export type PaymentRecord = {
  id: string
  order_id: string
  provider: string
  provider_session_id: string | null
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
  amount_cents: number
  currency: string
  created_at: string
  updated_at: string
}

export type ReportRecord = {
  id: string
  order_id: string
  provider: string
  data: Record<string, unknown>
  provider_response_at: string
  created_at: string
}

type FileStore = {
  users: UserRecord[]
  orders: OrderRecord[]
  payments: PaymentRecord[]
  reports: ReportRecord[]
}

const dataDir = path.resolve(process.cwd(), 'server/data')
const storeFile = path.resolve(dataDir, 'store.json')

function getFileStore(): FileStore {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(storeFile)) {
    const initial: FileStore = { users: [], orders: [], payments: [], reports: [] }
    fs.writeFileSync(storeFile, JSON.stringify(initial, null, 2), 'utf8')
    return initial
  }
  try {
    const raw = fs.readFileSync(storeFile, 'utf8')
    return JSON.parse(raw) as FileStore
  } catch {
    return { users: [], orders: [], payments: [], reports: [] }
  }
}

function saveFileStore(store: FileStore): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf8')
}

export class StorageService {
  private usePostgres = false

  setPostgresActive(active: boolean) {
    this.usePostgres = active
  }

  isPostgresActive(): boolean {
    return this.usePostgres
  }

  async getOrCreateUser(email: string): Promise<UserRecord> {
    const normalizedEmail = email.trim().toLowerCase()
    if (this.usePostgres && pool) {
      try {
        const res = await pool.query<{ id: string; email: string; created_at: Date }>(
          `INSERT INTO users (email) VALUES ($1)
           ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
           RETURNING id, email, created_at`,
          [normalizedEmail],
        )
        const row = res.rows[0]
        return { id: row.id, email: row.email, created_at: row.created_at.toISOString() }
      } catch (err) {
        console.warn('Postgres getOrCreateUser failed, falling back to local store:', (err as Error).message)
      }
    }

    const store = getFileStore()
    let user = store.users.find((u) => u.email === normalizedEmail)
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        created_at: new Date().toISOString(),
      }
      store.users.push(user)
      saveFileStore(store)
    }
    return user
  }

  async createOrder(params: {
    userId: string
    vin: string
    firstName: string
    lastName: string
    vehicleType: string
    phone: string
  }): Promise<OrderRecord> {
    const now = new Date().toISOString()
    if (this.usePostgres && pool) {
      try {
        const res = await pool.query<{
          id: string
          user_id: string
          vin: string
          first_name: string
          last_name: string
          vehicle_type: string
          phone: string
          status: string
          created_at: Date
          updated_at: Date
        }>(
          `INSERT INTO orders (user_id, vin, first_name, last_name, vehicle_type, phone, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'awaiting_payment')
           RETURNING id, user_id, vin, first_name, last_name, vehicle_type, phone, status, created_at, updated_at`,
          [params.userId, params.vin, params.firstName, params.lastName, params.vehicleType, params.phone],
        )
        const row = res.rows[0]
        return {
          id: row.id,
          user_id: row.user_id,
          vin: row.vin,
          first_name: row.first_name,
          last_name: row.last_name,
          vehicle_type: row.vehicle_type,
          phone: row.phone,
          status: row.status,
          created_at: row.created_at.toISOString(),
          updated_at: row.updated_at.toISOString(),
        }
      } catch (err) {
        console.warn('Postgres createOrder failed, falling back to local store:', (err as Error).message)
      }
    }

    const store = getFileStore()
    const order: OrderRecord = {
      id: crypto.randomUUID(),
      user_id: params.userId,
      vin: params.vin,
      first_name: params.firstName,
      last_name: params.lastName,
      vehicle_type: params.vehicleType,
      phone: params.phone,
      status: 'awaiting_payment',
      created_at: now,
      updated_at: now,
    }
    store.orders.push(order)
    saveFileStore(store)
    return order
  }

  async getOrder(orderId: string): Promise<{
    order: OrderRecord
    customerEmail?: string
    paymentStatus: string
    reportData: Record<string, unknown> | null
  } | null> {
    if (this.usePostgres && pool) {
      try {
        const res = await pool.query<{
          id: string
          user_id: string | null
          vin: string
          first_name: string | null
          last_name: string | null
          vehicle_type: string | null
          phone: string | null
          order_status: string
          created_at: Date
          updated_at: Date
          customer_email: string | null
          payment_status: string | null
          report_data: Record<string, unknown> | null
        }>(
          `SELECT o.id, o.user_id, o.vin, o.first_name, o.last_name, o.vehicle_type, o.phone,
                  o.status AS order_status, o.created_at, o.updated_at,
                  u.email AS customer_email,
                  COALESCE(p.status, 'unpaid') AS payment_status,
                  r.data AS report_data
           FROM orders o
           LEFT JOIN users u ON u.id = o.user_id
           LEFT JOIN LATERAL (
             SELECT status FROM payments WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1
           ) p ON TRUE
           LEFT JOIN reports r ON r.order_id = o.id
           WHERE o.id = $1`,
          [orderId],
        )
        if (res.rowCount && res.rows[0]) {
          const row = res.rows[0]
          return {
            order: {
              id: row.id,
              user_id: row.user_id,
              vin: row.vin,
              first_name: row.first_name,
              last_name: row.last_name,
              vehicle_type: row.vehicle_type,
              phone: row.phone,
              status: row.order_status,
              created_at: row.created_at.toISOString(),
              updated_at: row.updated_at.toISOString(),
            },
            customerEmail: row.customer_email || undefined,
            paymentStatus: row.payment_status || 'unpaid',
            reportData: row.report_data,
          }
        }
      } catch (err) {
        console.warn('Postgres getOrder failed, falling back to local store:', (err as Error).message)
      }
    }

    const store = getFileStore()
    const order = store.orders.find((o) => o.id === orderId)
    if (!order) return null

    const user = store.users.find((u) => u.id === order.user_id)
    const payment = store.payments
      .filter((p) => p.order_id === orderId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    const report = store.reports.find((r) => r.order_id === orderId)

    return {
      order,
      customerEmail: user?.email,
      paymentStatus: payment?.status === 'paid' ? 'paid' : order.status === 'paid' || order.status === 'completed' ? 'paid' : 'unpaid',
      reportData: report?.data || null,
    }
  }

  async saveReport(orderId: string, provider: string, data: Record<string, unknown>): Promise<void> {
    const now = new Date().toISOString()
    if (this.usePostgres && pool) {
      try {
        await pool.query(
          `INSERT INTO reports (order_id, provider, data, provider_response_at)
           VALUES ($1, $2, $3::jsonb, NOW())
           ON CONFLICT (order_id) DO UPDATE
           SET data = EXCLUDED.data, provider_response_at = EXCLUDED.provider_response_at`,
          [orderId, provider, JSON.stringify(data)],
        )
        return
      } catch (err) {
        console.warn('Postgres saveReport failed, falling back to local store:', (err as Error).message)
      }
    }

    const store = getFileStore()
    const existingIndex = store.reports.findIndex((r) => r.order_id === orderId)
    if (existingIndex >= 0) {
      store.reports[existingIndex].data = data
      store.reports[existingIndex].provider_response_at = now
    } else {
      store.reports.push({
        id: crypto.randomUUID(),
        order_id: orderId,
        provider,
        data,
        provider_response_at: now,
        created_at: now,
      })
    }
    saveFileStore(store)
  }

  async createPayment(orderId: string, amountCents: number, provider = 'internal_card'): Promise<PaymentRecord> {
    const now = new Date().toISOString()
    const sessionId = `sess_${crypto.randomBytes(12).toString('hex')}`
    if (this.usePostgres && pool) {
      try {
        const res = await pool.query<{ id: string; created_at: Date; updated_at: Date }>(
          `INSERT INTO payments (order_id, provider, provider_session_id, amount_cents, currency, status)
           VALUES ($1, $2, $3, $4, 'EUR', 'pending')
           RETURNING id, created_at, updated_at`,
          [orderId, provider, sessionId, amountCents],
        )
        const row = res.rows[0]
        return {
          id: row.id,
          order_id: orderId,
          provider,
          provider_session_id: sessionId,
          status: 'pending',
          amount_cents: amountCents,
          currency: 'EUR',
          created_at: row.created_at.toISOString(),
          updated_at: row.updated_at.toISOString(),
        }
      } catch (err) {
        console.warn('Postgres createPayment failed, falling back to local store:', (err as Error).message)
      }
    }

    const store = getFileStore()
    const payment: PaymentRecord = {
      id: crypto.randomUUID(),
      order_id: orderId,
      provider,
      provider_session_id: sessionId,
      status: 'pending',
      amount_cents: amountCents,
      currency: 'EUR',
      created_at: now,
      updated_at: now,
    }
    store.payments.push(payment)
    saveFileStore(store)
    return payment
  }

  async markPaymentPaid(orderId: string, amountCents = 1999): Promise<void> {
    const now = new Date().toISOString()
    if (this.usePostgres && pool) {
      try {
        await pool.query(
          `INSERT INTO payments (order_id, provider, provider_session_id, amount_cents, currency, status)
           VALUES ($1, 'card_direct', $2, $3, 'EUR', 'paid')`,
          [orderId, `paid_${Date.now()}`, amountCents],
        )
        await pool.query(`UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = $1`, [orderId])
        return
      } catch (err) {
        console.warn('Postgres markPaymentPaid failed, falling back to local store:', (err as Error).message)
      }
    }

    const store = getFileStore()
    const payment = store.payments.find((p) => p.order_id === orderId)
    if (payment) {
      payment.status = 'paid'
      payment.updated_at = now
    } else {
      store.payments.push({
        id: crypto.randomUUID(),
        order_id: orderId,
        provider: 'card_direct',
        provider_session_id: `paid_${Date.now()}`,
        status: 'paid',
        amount_cents: amountCents,
        currency: 'EUR',
        created_at: now,
        updated_at: now,
      })
    }

    const order = store.orders.find((o) => o.id === orderId)
    if (order) {
      order.status = 'completed'
      order.updated_at = now
    }
    saveFileStore(store)
  }

  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    if (this.usePostgres && pool) {
      try {
        const res = await pool.query(`UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`, [status, orderId])
        return (res.rowCount || 0) > 0
      } catch (err) {
        console.warn('Postgres updateOrderStatus failed, falling back to local store:', (err as Error).message)
      }
    }

    const store = getFileStore()
    const order = store.orders.find((o) => o.id === orderId)
    if (!order) return false
    order.status = status
    order.updated_at = new Date().toISOString()
    saveFileStore(store)
    return true
  }

  async getAdminDashboard(): Promise<{
    totalOrders: number
    totalOpenOrders: number
    totalRevenueCents: number
    orders: Array<{
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
    }>
  }> {
    if (this.usePostgres && pool) {
      try {
        const [summary, orders] = await Promise.all([
          pool.query<{ total_orders: string; total_open_orders: string; revenue_cents: string }>(
            `SELECT
              (SELECT COUNT(*) FROM orders)::text AS total_orders,
              (SELECT COUNT(*) FROM orders WHERE status NOT IN ('completed', 'cancelled', 'failed'))::text AS total_open_orders,
              (SELECT COALESCE(SUM(amount_cents), 0) FROM payments WHERE status = 'paid')::text AS revenue_cents`,
          ),
          pool.query<{
            id: string
            vin: string
            first_name: string | null
            last_name: string | null
            vehicle_type: string | null
            phone: string | null
            email: string | null
            payment_status: string
            report_status: string
            order_status: string
            created_at: Date
            amount_cents: number
          }>(
            `SELECT o.id, o.vin, o.first_name, o.last_name, o.vehicle_type, o.phone, u.email,
                    o.status AS order_status, o.created_at,
                    COALESCE(p.status, 'unpaid') AS payment_status,
                    CASE WHEN r.id IS NULL THEN 'pending' ELSE 'available' END AS report_status,
                    COALESCE(p.amount_cents, 1999) AS amount_cents
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             LEFT JOIN LATERAL (SELECT status, amount_cents FROM payments WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) p ON TRUE
             LEFT JOIN reports r ON r.order_id = o.id
             ORDER BY o.created_at DESC
             LIMIT 100`,
          ),
        ])
        return {
          totalOrders: Number(summary.rows[0].total_orders),
          totalOpenOrders: Number(summary.rows[0].total_open_orders),
          totalRevenueCents: Number(summary.rows[0].revenue_cents),
          orders: orders.rows.map((row) => ({
            id: row.id,
            vin: row.vin,
            firstName: row.first_name,
            lastName: row.last_name,
            vehicleType: row.vehicle_type,
            phone: row.phone,
            customerEmail: row.email,
            paymentStatus: row.payment_status,
            reportStatus: row.report_status,
            orderStatus: row.order_status,
            createdAt: row.created_at.toISOString(),
            amountCents: Number(row.amount_cents),
          })),
        }
      } catch (err) {
        console.warn('Postgres getAdminDashboard failed, falling back to local store:', (err as Error).message)
      }
    }

    const store = getFileStore()
    const totalOrders = store.orders.length
    const totalOpenOrders = store.orders.filter((o) => !['completed', 'cancelled', 'failed'].includes(o.status)).length

    const paidPayments = store.payments.filter((p) => p.status === 'paid')
    const totalRevenueCents = paidPayments.reduce((acc, p) => acc + p.amount_cents, 0)

    const orders = [...store.orders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 100)
      .map((order) => {
        const user = store.users.find((u) => u.id === order.user_id)
        const payment = store.payments
          .filter((p) => p.order_id === order.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        const report = store.reports.find((r) => r.order_id === order.id)

        const paymentStatus = payment?.status === 'paid' || order.status === 'completed' ? 'paid' : 'unpaid'
        const reportStatus = report ? 'available' : 'pending'

        return {
          id: order.id,
          vin: order.vin,
          firstName: order.first_name,
          lastName: order.last_name,
          vehicleType: order.vehicle_type,
          phone: order.phone,
          customerEmail: user?.email || null,
          paymentStatus,
          reportStatus,
          orderStatus: order.status,
          createdAt: order.created_at,
          amountCents: payment?.amount_cents || 1999,
        }
      })

    return {
      totalOrders,
      totalOpenOrders,
      totalRevenueCents,
      orders,
    }
  }
}

export const storage = new StorageService()
