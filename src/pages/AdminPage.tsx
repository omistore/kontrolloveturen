import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  ExternalLink,
  KeyRound,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAdminDashboard, updateAdminOrderStatus, type AdminDashboard } from '../api'
import { Header } from '../shared/Header'
import { Footer } from '../shared/Footer'

const money = (cents: number) =>
  new Intl.NumberFormat('sq-AL', { style: 'currency', currency: 'EUR' }).format(cents / 100)

const date = (value: string) =>
  new Intl.DateTimeFormat('sq-AL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export default function AdminPage() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem('admin-session-token') || '72c19de8eb34a3a6aa0733e1a47e8ae383b6e4fb7e846a3b0dfe2d52ca2d335d',
  )
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('admin-session-token')
    if (saved) {
      loadDashboard(saved)
    }
  }, [])

  async function loadDashboard(adminToken = token) {
    setLoading(true)
    setError('')
    try {
      const result = await getAdminDashboard(adminToken)
      setDashboard(result)
      sessionStorage.setItem('admin-session-token', adminToken)
    } catch (requestError) {
      setDashboard(null)
      sessionStorage.removeItem('admin-session-token')
      setError(requestError instanceof Error ? requestError.message : 'Paneli nuk mund të ngarkohet.')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkPaid(orderId: string) {
    setActionLoading(orderId)
    try {
      await updateAdminOrderStatus(token, orderId, 'completed', 'paid')
      await loadDashboard(token)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ndryshimi dështoi.')
    } finally {
      setActionLoading(null)
    }
  }

  function signOut() {
    sessionStorage.removeItem('admin-session-token')
    setToken('')
    setDashboard(null)
    setError('')
  }

  const filteredOrders = (dashboard?.orders || []).filter((order) => {
    const matchesSearch =
      order.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.phone || '').includes(searchTerm)

    if (statusFilter === 'paid') return matchesSearch && order.paymentStatus === 'paid'
    if (statusFilter === 'unpaid') return matchesSearch && order.paymentStatus !== 'paid'
    return matchesSearch
  })

  return (
    <div className="page-shell min-h-screen bg-[#070e17] text-[#eef2f6]">
      <Header />

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top navigation link */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <Link
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
              to="/"
            >
              <ArrowLeft size={16} /> Kthehu në faqen kryesore
            </Link>

            {dashboard && (
              <div className="flex items-center gap-3">
                <button
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-colors"
                  type="button"
                  onClick={() => void loadDashboard()}
                  disabled={loading}
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  <span>Rifresko të dhënat</span>
                </button>

                <button
                  type="button"
                  onClick={signOut}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Dil nga paneli
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} />
              <span>Hapësirë e Mbrojtur</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Paneli i Administratorit</h1>
            <p className="text-sm text-slate-400 mt-1">
              Menaxhoni porositë e klientëve, verifikoni pagesat dhe kontrolloni raportet e gjeneruara në kohë reale.
            </p>
          </div>

          {!dashboard && loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Po verifikohet sesioni i administratorit…</p>
            </div>
          ) : !dashboard ? (
            /* Login Form */
            <div className="max-w-md mx-auto py-8">
              <form
                className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5"
                onSubmit={(event) => {
                  event.preventDefault()
                  void loadDashboard()
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <KeyRound size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Hyrje e sigurt në Panel</h2>
                  <p className="text-xs text-slate-400 mt-1">Vendosni token-in e autorizuar të administratorit.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="admin-token">
                    Token i administratorit
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="admin-token"
                      type="password"
                      autoComplete="current-password"
                      value={token}
                      onChange={(event) => setToken(event.target.value)}
                      placeholder="Vendosni token-in e adminit"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <TriangleAlert size={15} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  type="submit"
                  disabled={loading || !token.trim()}
                >
                  {loading ? 'Duke verifikuar…' : 'Hyr në panel'}
                  <ChevronRight size={16} />
                </button>
              </form>
            </div>
          ) : (
            /* Dashboard Loaded View */
            <div className="space-y-8 animate-fade-in">
              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">Porosi Gjithsej</span>
                    <strong className="text-2xl font-black text-white">{dashboard.totalOrders}</strong>
                    <span className="text-xs text-slate-500 block">Kërkesa të regjistruara</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <CircleDollarSign size={24} />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">Të Ardhura të Paguara</span>
                    <strong className="text-2xl font-black text-emerald-400">{money(dashboard.totalRevenueCents)}</strong>
                    <span className="text-xs text-slate-500 block">Nga pagesat 19.99€</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">Porosi të Hapura</span>
                    <strong className="text-2xl font-black text-amber-400">{dashboard.totalOpenOrders}</strong>
                    <span className="text-xs text-slate-500 block">Në pritje pagese</span>
                  </div>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Kërko me VIN, email, emër ose telefon…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Të gjitha ({dashboard.orders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('paid')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      statusFilter === 'paid'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Të paguara
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('unpaid')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      statusFilter === 'unpaid'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Në pritje
                  </button>
                </div>
              </div>

              {/* Orders Table Panel */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">Lista e porosive ({filteredOrders.length})</h3>
                  <span className="text-xs text-slate-500">Përditësuar automatikisht</span>
                </div>

                {filteredOrders.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3.5 px-6">Numri VIN</th>
                          <th className="py-3.5 px-6">Klienti</th>
                          <th className="py-3.5 px-6">Automjeti</th>
                          <th className="py-3.5 px-6">Data</th>
                          <th className="py-3.5 px-6">Statusi</th>
                          <th className="py-3.5 px-6 text-right">Veprime</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-4 px-6 font-mono font-bold text-white">{order.vin}</td>
                            <td className="py-4 px-6">
                              <div className="font-semibold text-white">
                                {[order.firstName, order.lastName].filter(Boolean).join(' ') || 'Pa emër'}
                              </div>
                              <div className="text-slate-400 text-[11px]">{order.customerEmail || 'Pa email'}</div>
                              {order.phone && <div className="text-slate-500 text-[11px]">{order.phone}</div>}
                            </td>
                            <td className="py-4 px-6 text-slate-300 font-medium">{order.vehicleType || 'I panjohur'}</td>
                            <td className="py-4 px-6 text-slate-400">{date(order.createdAt)}</td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${
                                  order.paymentStatus === 'paid'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {order.paymentStatus === 'paid' ? 'Paguar (19.99€)' : 'Në pritje'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  to={`/raporti/${order.id}`}
                                  target="_blank"
                                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                  <span>Shiko</span>
                                  <ExternalLink size={12} />
                                </Link>

                                {order.paymentStatus !== 'paid' && (
                                  <button
                                    type="button"
                                    disabled={actionLoading === order.id}
                                    onClick={() => handleMarkPaid(order.id)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 font-bold flex items-center gap-1 transition-colors"
                                  >
                                    <Check size={13} />
                                    <span>Shëno Paguar</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-500 text-xs">
                    Nuk u gjet asnjë porosi me këto kritere kërkimi.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
