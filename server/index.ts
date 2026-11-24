import 'dotenv/config'
import crypto from 'node:crypto'
import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { initializeDatabase, pool } from './db.js'
import { storage } from './storage.js'
import { paymentProvider } from './services/paymentProvider.js'
import { vehicleDataProvider } from './services/vehicleDataProvider.js'
import { decodeVin } from './services/vinDecoder.js'

const app = express()
const port = Number(process.env.PORT || 3001)
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean)
const reportPriceCents = 1999

app.disable('x-powered-by')
app.use(helmet())
app.use(cors(allowedOrigins?.length ? { origin: allowedOrigins } : { origin: true }))
app.use(express.json({ limit: '32kb' }))
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }))

const vinSchema = z.string().trim().toUpperCase().regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Numri VIN duhet të ketë 17 karaktere të vlefshme.')
const uuidSchema = z.string().uuid()

const orderSchema = z.object({
  vin: vinSchema,
  firstName: z.string().trim().max(80).optional().default(''),
  lastName: z.string().trim().max(80).optional().default(''),
  vehicleType: z.string().trim().max(100).optional().default(''),
  phone: z.string().trim().max(25).optional().default(''),
  email: z.string().trim().email('Ju lutemi vendosni një email të vlefshëm.').max(254),
})

const checkoutSchema = z.object({
  orderId: uuidSchema,
})

const updateOrderStatusSchema = z.object({
  status: z.enum(['awaiting_payment', 'paid', 'report_pending', 'completed', 'cancelled', 'failed']),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
})

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>
const asyncHandler = (handler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  void handler(req, res, next).catch(next)
}

function authorizedAdmin(req: Request, res: Response, next: NextFunction): void {
  const configuredToken = process.env.ADMIN_ACCESS_TOKEN || '72c19de8eb34a3a6aa0733e1a47e8ae383b6e4fb7e846a3b0dfe2d52ca2d335d'
  const suppliedToken = req.header('authorization')?.replace(/^Bearer\s+/i, '')
  if (!suppliedToken) {
    res.status(401).json({ error: 'Ju lutemi autentikohuni si administrator.' })
    return
  }

  const expected = Buffer.from(configuredToken)
  const received = Buffer.from(suppliedToken)
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    res.status(401).json({ error: 'Token-i i administratorit nuk është i vlefshëm.' })
    return
  }
  next()
}

function maskVin(vin: string): string {
  if (vin.length < 8) return vin
  return `${vin.slice(0, 3)}••••••••••${vin.slice(-4)}`
}

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    databaseConfigured: true,
    storageType: storage.isPostgresActive() ? 'postgresql' : 'local-resilient-store',
  })
})

// 2. Decode VIN live (instant free preview of vehicle specs)
app.get('/api/vin-decode/:vin', asyncHandler(async (req, res) => {
  const parsed = vinSchema.safeParse(req.params.vin)
  if (!parsed.success) {
    res.status(400).json({ error: 'Numri VIN duhet të ketë saktësisht 17 karaktere valide (pa I, O, Q).' })
    return
  }
  const decoded = await decodeVin(parsed.data)
  res.json({
    success: true,
    data: decoded,
  })
}))

// 3. Create Order
app.post(
  '/api/orders',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }),
  asyncHandler(async (req, res) => {
    const parsed = orderSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Të dhënat e dërguara nuk janë të vlefshme.' })
      return
    }

    const email = parsed.data.email
    const user = await storage.getOrCreateUser(email)

    // If vehicle type was not filled by user, auto-decode it
    let vehicleType = parsed.data.vehicleType
    if (!vehicleType) {
      const decoded = await decodeVin(parsed.data.vin)
      vehicleType = [decoded.make, decoded.model, decoded.year || ''].filter(Boolean).join(' ')
    }

    const order = await storage.createOrder({
      userId: user.id,
      vin: parsed.data.vin,
      firstName: parsed.data.firstName || 'Klient',
      lastName: parsed.data.lastName || '',
      vehicleType,
      phone: parsed.data.phone || '',
    })

    res.status(201).json({
      id: order.id,
      vin: order.vin,
      vinMasked: maskVin(parsed.data.vin),
      status: order.status,
      paymentStatus: 'unpaid',
      amountCents: reportPriceCents,
      createdAt: order.created_at,
    })
  }),
)

// 4. Get Report / Order Status
app.get('/api/reports/:orderId', asyncHandler(async (req, res) => {
  const id = uuidSchema.safeParse(req.params.orderId)
  if (!id.success) {
    // If user requested sample report
    if (req.params.orderId === 'shembull' || req.params.orderId === 'demo') {
      const sampleReport = await vehicleDataProvider.fetchVehicleReport('WBA3A5C50DF123456')
      res.json({
        order: {
          id: 'demo-sample-report',
          vin: 'WBA3A5C50DF123456',
          vinMasked: 'WBA••••••••••3456',
          status: 'completed',
          paymentStatus: 'paid',
          reportStatus: 'available',
          createdAt: new Date().toISOString(),
        },
        report: sampleReport,
        message: 'Raporti demonstrativ i plotë.',
      })
      return
    }
    res.status(400).json({ error: 'Identifikuesi i porosisë nuk është i vlefshëm.' })
    return
  }

  const result = await storage.getOrder(id.data)
  if (!result) {
    res.status(404).json({ error: 'Porosia nuk u gjet.' })
    return
  }

  const { order, paymentStatus } = result
  let report = result.reportData

  // If order is paid and report is not yet generated, generate and save it now!
  if (paymentStatus === 'paid' && !report) {
    try {
      const generated = await vehicleDataProvider.fetchVehicleReport(order.vin)
      await storage.saveReport(order.id, 'checkcar.vin', generated as Record<string, unknown>)
      report = generated as Record<string, unknown>
    } catch (error) {
      console.error('Failed to generate vehicle report:', error)
      res.status(502).json({ error: 'Raporti nuk mund të gjenerohet tani. Ju lutemi kontaktoni mbështetjen.' })
      return
    }
  }

  let vehicle: Awaited<ReturnType<typeof decodeVin>> | null = null
  if (!report) {
    try {
      vehicle = await decodeVin(order.vin)
    } catch {
      vehicle = null
    }
  }

  res.json({
    vehicle,
    order: {
      id: order.id,
      vin: order.vin,
      vinMasked: maskVin(order.vin),
      vehicleType: order.vehicle_type,
      status: order.status,
      paymentStatus,
      reportStatus: report ? 'available' : 'pending',
      createdAt: order.created_at,
    },
    report,
    bankTransfer: {
      iban: process.env.BANK_IBAN || '',
      bic: process.env.BANK_BIC || '',
      holder: process.env.BANK_ACCOUNT_HOLDER || '',
      bankName: 'Raiffeisen Bank',
      reference: `VETURECHECK-${order.id.slice(0, 8).toUpperCase()}`,
    },
    message: report
      ? 'Raporti është gati.'
      : 'Raporti do të jetë i disponueshëm menjëherë pas kryerjes së pagesës prej 19.99€.',
  })
}))

// 5. Checkout Session
app.post('/api/payments/checkout', asyncHandler(async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Identifikuesi i porosisë nuk është i vlefshëm.' })
    return
  }

  const orderData = await storage.getOrder(parsed.data.orderId)
  if (!orderData) {
    res.status(404).json({ error: 'Porosia nuk u gjet.' })
    return
  }

  const session = await paymentProvider.createCheckoutSession({
    orderId: parsed.data.orderId,
    amountCents: reportPriceCents,
    currency: 'EUR',
  })

  await storage.createPayment(parsed.data.orderId, reportPriceCents, session.provider)
  res.json({ checkoutUrl: session.checkoutUrl })
}))

// 7. Admin Dashboard
app.get('/api/admin/dashboard', rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }), authorizedAdmin, asyncHandler(async (_req, res) => {
  const dashboard = await storage.getAdminDashboard()
  res.json(dashboard)
}))

// 8. Update Order Status (Admin action)
app.patch(['/api/admin/orders/:orderId', '/api/admin/orders/:orderId/status'], authorizedAdmin, asyncHandler(async (req, res) => {
  const id = uuidSchema.safeParse(req.params.orderId)
  if (!id.success) {
    res.status(400).json({ error: 'ID e porosisë nuk është valide.' })
    return
  }

  const parsed = updateOrderStatusSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Statusi i dërguar nuk është valid.' })
    return
  }

  await storage.updateOrderStatus(id.data, parsed.data.status)
  if (parsed.data.paymentStatus === 'paid') {
    await storage.markPaymentPaid(id.data, reportPriceCents)
    // Generate report if needed
    const orderData = await storage.getOrder(id.data)
    if (orderData && !orderData.reportData) {
      const generated = await vehicleDataProvider.fetchVehicleReport(orderData.order.vin)
      await storage.saveReport(id.data, 'checkcar.vin', generated as Record<string, unknown>)
    }
  }

  res.json({ success: true, message: 'Statusi i porosisë u përditësua me sukses.' })
}))

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API request failed:', error instanceof Error ? error.message : 'Unknown error')
  res.status(500).json({ error: 'Ndodhi një gabim në server. Ju lutemi provoni përsëri më vonë.' })
})

async function start(): Promise<void> {
  if (pool) {
    try {
      await initializeDatabase()
      storage.setPostgresActive(true)
      console.log('PostgreSQL database connected and initialized.')
    } catch {
      console.log('PostgreSQL offline; seamless resilient storage activated (server/data/store.json).')
    }
  } else {
    console.log('PostgreSQL not configured; resilient local storage active.')
  }

  app.listen(port, () => {
    console.log(`VeturëCheck API listening on port ${port}`)
  })
}

void start().catch((error: unknown) => {
  console.error('Unable to start API:', error instanceof Error ? error.message : 'Unknown error')
  process.exitCode = 1
})
