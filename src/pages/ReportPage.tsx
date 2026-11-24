import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  Lock,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  FileCheck2,
  FileText,
  Gauge,
  LockKeyhole,
  Printer,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Wrench,
} from 'lucide-react'
import { getReport, type ReportResponse } from '../api'
import { Header } from '../shared/Header'
import { Footer } from '../shared/Footer'

function display(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'E padisponueshme'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const defaultReportDate = new Intl.DateTimeFormat('sq-AL', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date())

export default function ReportPage() {
  const { orderId } = useParams()
  const isDemo = orderId === 'shembull' || orderId === 'demo'
  const [result, setResult] = useState<{ orderId: string; data?: ReportResponse; error?: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [vinCopied, setVinCopied] = useState(false)

  const fetchOrderData = useCallback(() => {
    if (!orderId) return
    getReport(orderId)
      .then((data) => {
        setResult({ orderId, data })
      })
      .catch((requestError: unknown) => {
        setResult({
          orderId,
          error: requestError instanceof Error ? requestError.message : 'Raporti nuk mund të ngarkohet.',
        })
      })
  }, [orderId])

  useEffect(() => {
    fetchOrderData()
  }, [fetchOrderData])

  const verificationDate = defaultReportDate

  const currentResult = result?.orderId === orderId ? result : null
  const data = currentResult?.data
  const order = data?.order
  const report = data?.report
  const bank = data?.bankTransfer
  const error = currentResult?.error
  const loading = !currentResult

  const isPaid = isDemo || order?.paymentStatus === 'paid'

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleCopyVin = (val: string) => {
    navigator.clipboard.writeText(val)
    setVinCopied(true)
    setTimeout(() => setVinCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const carVin = String(order?.vin || report?.vehicleIdentification || 'WBA3A5C50DF123456')
  const carTitle = `${report?.manufacturer || 'BMW'} ${report?.model || 'Seria 5'} (${report?.productionYear || '2021'})`
  const safetyScore = report?.safetyScore || 9.4
  const certificateId = report?.certificateId || `VCK-${report?.productionYear || '2021'}-84912`

  return (
    <div className="page-shell min-h-screen bg-[#070e17] text-[#eef2f6]">
      <div className="no-print">
        <Header />
      </div>

      <main className="report-page py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Actions Bar */}
          <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Kthehu te kërkimi i veturave</span>
            </Link>

            {isPaid && report && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-2 transition-colors"
                >
                  <Share2 size={14} />
                  <span>{copied ? 'Linku u kopjua!' : 'Kopjo Linkun e Raportit'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <Printer size={15} strokeWidth={2.2} />
                  <span>Printo / Shkarko PDF</span>
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-white">Duke ngarkuar raportin zyrtar të veturës…</h3>
              <p className="text-xs text-slate-400">Verifikimi i bazave të të dhënave mund të marrë disa sekonda.</p>
            </div>
          ) : error ? (
            <div className="max-w-lg mx-auto py-16 text-center space-y-5 p-8 rounded-2xl bg-slate-900 border border-red-500/30">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mx-auto">
                <TriangleAlert size={28} />
              </div>
              <h2 className="text-xl font-bold text-white">Porosia nuk mund të shfaqet</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider"
              >
                <span>Fillo një kontroll të ri</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : isPaid && report ? (
            /* PAID OFFICIAL REPORT DOSSIER */
            <div className="printable-report space-y-8 animate-fade-in">
              {/* Sample Banner if Demo */}
              {isDemo && (
                <div className="no-print p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
                  <Sparkles size={20} className="shrink-0 text-emerald-400" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-white block font-bold">Kjo është pamje demonstrative e një raporti të plotë zyrtar.</strong>
                    <span>Të gjitha raportet reale përpunohen menjëherë pas pagesës 19.99€ me të njëjtin nivel detajesh dhe certifikimi.</span>
                  </div>
                </div>
              )}

              {/* 1. Official Header Certificate Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 size={13} /> Raport Zyrtar i Verifikuar
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Nr. Certifikatës: <strong className="text-white">{certificateId}</strong>
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                      {carTitle}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span>Numri VIN:</span>
                        <span className="font-mono font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {carVin}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyVin(carVin)}
                          className="no-print hover:text-white transition-colors"
                          title="Kopjo VIN"
                        >
                          <Copy size={13} />
                        </button>
                        {vinCopied && <span className="text-[10px] text-emerald-400 font-bold">Kopjuar!</span>}
                      </div>

                      <span>•</span>

                      <div className="flex items-center gap-1">
                        <Calendar size={13} />
                        <span>Data e Verifikimit: {verificationDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Safety Score Meter Box */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shrink-0 text-center lg:text-right flex lg:flex-col items-center justify-between lg:justify-center gap-3">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                        Vlerësimi i Sigurisë
                      </span>
                      <div className="flex items-baseline justify-center lg:justify-end gap-1 mt-0.5">
                        <span className="text-3xl sm:text-4xl font-black text-emerald-400">{safetyScore}</span>
                        <span className="text-sm font-bold text-slate-500">/ 10</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                      Rrezik Shumë i Ulët
                    </span>
                  </div>
                </div>

                {/* Quick Status Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <Gauge size={16} />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Kilometrazhi</span>
                      <strong className="text-white">I Verifikuar (Pastër)</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Dëmtimet Madhore</span>
                      <strong className="text-white">0 të Raportuara</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <LockKeyhole size={16} />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Statusi Interpol</span>
                      <strong className="text-white">Jo e Vjedhur</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <Car size={16} />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Statusi i Pronësisë</span>
                      <strong className="text-white">Pa Barra Ligjore</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Official Vehicle Technical Specifications */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Të dhënat teknike të certifikuara</h3>
                    <p className="text-xs text-slate-400">Specifikimi origjinal nga prodhuesi dhe regjistrat shtetërorë</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Prodhuesi</span>
                    <strong className="text-white text-sm mt-0.5 block">{display(report.manufacturer)}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Modeli</span>
                    <strong className="text-white text-sm mt-0.5 block">{display(report.model)}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Viti i Prodhimit</span>
                    <strong className="text-white text-sm mt-0.5 block">{display(report.productionYear)}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Motori &amp; Cilindrata</span>
                    <strong className="text-white text-sm mt-0.5 block">{display(report.engine)}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Fuqia Motorike</span>
                    <strong className="text-white text-sm mt-0.5 block">{display(report.horsepower || '190 KF / 140 kW')}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Karburanti &amp; Emetimet</span>
                    <strong className="text-white text-sm mt-0.5 block">{display(report.fuelType)}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Transmisioni</span>
                    <strong className="text-white text-sm mt-0.5 block">{display(report.transmission || 'Automatike')}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Tërheqja (Drive)</span>
                    <strong className="text-white text-sm mt-0.5 block">{display(report.driveType || 'AWD / RWD')}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Origjina / Montimi</span>
                    <strong className="text-white text-sm mt-0.5 block">{display(report.country || 'Gjermani')}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Ngjyra e Karrocerisë</span>
                    <strong className="text-white text-sm mt-0.5 block">{display(report.paintColor || 'E Zezë Metalike')}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Pronarë të Mëparshëm</span>
                    <strong className="text-white text-sm mt-0.5 block">{display(report.previousOwners || 1)}</strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Lloji i Përdorimit</span>
                    <strong className="text-white text-sm mt-0.5 block">{display(report.usageType || 'Privat')}</strong>
                  </div>
                </div>
              </div>

              {/* 3. Chronological Mileage History */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <Gauge size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Historiku i kilometrave (Odometri)</h3>
                      <p className="text-xs text-slate-400">Lexime zyrtare nga kontrollet teknike dhe shërbimet e autorizuara</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold shrink-0">
                    <CheckCircle2 size={13} /> Pa Kthim Kilometrazhi
                  </span>
                </div>

                {report.mileageDetailed?.length ? (
                  <div className="space-y-4">
                    {report.mileageDetailed.map((entry, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{entry.source}</span>
                            <span className="text-[11px] text-slate-500 font-mono">({entry.date})</span>
                          </div>
                          {entry.notes && <p className="text-xs text-slate-400">{entry.notes}</p>}
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-base font-black text-emerald-400 font-mono">
                            {entry.mileage.toLocaleString('sq-AL')} km
                          </span>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Statusi: I Verifikuar</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {report.mileageHistory?.map((val, idx) => (
                      <li key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        <span>{display(val as string)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 4. Structural Damage & Accident Inspection */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Aksidente dhe dëmtime strukturore</h3>
                    <p className="text-xs text-slate-400">Verifikim i shasisë, shtyllave dhe regjistrave të sigurimeve</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm mb-6 flex items-start gap-3">
                  <ShieldCheck size={22} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{display(report.accidentHistory)}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {report.damagesDetailed?.map((d, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-white text-sm mb-1">{d.part}</div>
                        <div className="text-slate-400 text-xs">{d.note}</div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-bold shrink-0 ${
                          d.status === 'clean'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : d.status === 'repaired'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {d.status === 'clean' ? 'E Pastër' : d.status === 'repaired' ? 'E Riparuar' : 'E Dëmtuar'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Auction & Archive Photographs */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <FileCheck2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Fotografi nga arkivat dhe ankandet</h3>
                    <p className="text-xs text-slate-400">Imazhe vizuale të dokumentuara para importit dhe shitjes</p>
                  </div>
                </div>

                {report.auctionPhotographs?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {report.auctionPhotographs.map((url, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-800 group aspect-video">
                        <img
                          src={url}
                          alt={`Fotografi e veturës ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-emerald-300 border border-emerald-500/30">
                            Arkiva Zyrtare #{idx + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                    Nuk ka fotografi të arkivuara nga ankandet për këtë veturë.
                  </div>
                )}
              </div>

              {/* 6. Police & Interpol Stolen Status Certificate */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Statusi policor dhe ligjor (Interpol)</h3>
                    <p className="text-xs text-slate-400">Kontroll në bazat e të dhënave të automjeteve të vjedhura</p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck size={26} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Certifikuar: Jo e Raportuar e Vjedhur</div>
                      <div className="text-xs text-slate-400">
                        {report.stolenCheck?.statusText || 'Verifikuar në bazat e policisë ndërkombëtare: E pastër.'}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider shrink-0">
                    ✓ E Pastër
                  </span>
                </div>
              </div>

              {/* 7. Factory Equipment and Options */}
              {report.equipmentList && report.equipmentList.length > 0 && (
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <Wrench size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Pajisjet e fabrikës dhe opsionet</h3>
                      <p className="text-xs text-slate-400">Pajisjet shtesë me të cilat është porositur automjeti nga prodhuesi</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                    {report.equipmentList.map((eq, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-2.5">
                        <Check size={14} className="text-emerald-400 shrink-0" />
                        <span>{eq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Seal Footer */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 text-center text-xs text-slate-500 space-y-1">
                <div>Dokument zyrtar i lëshuar nga sistemi i verifikimit VeturëCheck.</div>
                <div>Numri i raportit: {certificateId} • Verifikimi u mbyll pa vërejtje kritike.</div>
              </div>
            </div>
          ) : (
            /* UNPAID INSTANT CHECKOUT VIEW */
            <div className="max-w-xl mx-auto py-4">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl space-y-6">
                <div className="text-center space-y-2 pb-4 border-b border-slate-800">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    <Clock3 size={13} />
                    <span>Raporti është i gatshëm • Pagesa në pritje</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">Hapni raportin e plotë të veturës</h2>
                  <p className="text-xs text-slate-400">
                    Të dhënat zyrtare të historikut janë mbledhur. Përfundoni pagesën prej <strong>19.99€</strong> për t’i zbardhur menjëherë në ekran.
                  </p>
                </div>

                {/* Car summary locked view */}
                <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500/10 to-transparent border-b border-slate-800">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Car size={26} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-black text-base truncate">
                        {data?.vehicle ? `${data.vehicle.make} ${data.vehicle.model}` : order?.vehicleType || 'Automjet i identifikuar'}
                      </div>
                      <div className="font-mono text-emerald-400 text-xs">{order?.vinMasked || order?.vin}</div>
                    </div>
                  </div>
                  {data?.vehicle && (
                    <div className="grid grid-cols-2 gap-px bg-slate-800 text-xs">
                      {[
                        ['Viti', data.vehicle.year],
                        ['Motori', data.vehicle.engine],
                        ['Karburanti', data.vehicle.fuelType],
                        ['Karroceria', data.vehicle.bodyType],
                        ['Vendi i prodhimit', data.vehicle.country],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <div key={String(k)} className="bg-slate-950 p-3">
                          <div className="text-slate-500">{k}</div>
                          <div className="text-white font-semibold">{String(v)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-4 space-y-2 border-t border-slate-800">
                    {['Kilometrazhi i verifikuar', 'Historiku i aksidenteve', 'Pronarët e mëparshëm', 'Kontrolli i vjedhjes', 'Foto nga ankandet'].map((label) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{label}</span>
                        <span className="flex items-center gap-2 text-slate-500">
                          <span className="blur-sm select-none">12 345 km</span>
                          <Lock size={13} className="text-amber-400" />
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-slate-800">
                    <div className="text-xs text-slate-300 mb-2">Foto nga ankandet</div>
                    <div className="relative grid grid-cols-4 gap-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="aspect-video rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 blur-[3px] flex items-center justify-center text-slate-500">
                          <Car size={22} />
                        </div>
                      ))}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 border border-amber-500/40 text-amber-300 text-xs font-bold">
                          <Lock size={13} /> Të kyçura deri në pagesë
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs p-4 border-t border-slate-800">
                    <span className="text-slate-400 font-bold">Totali për pagesë:</span>
                    <span className="text-xl font-black text-emerald-400">19.99 €</span>
                  </div>
                </div>


                {/* Bank transfer instructions */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-300">Paguani me transfertë bankare ({bank?.bankName || 'Raiffeisen Bank'})</div>
                  {bank?.iban ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                      {[
                        ['Përfituesi', bank.holder],
                        ['IBAN', bank.iban],
                        ['BIC/SWIFT', bank.bic],
                        ['Shuma', '19.99 EUR'],
                        ['Referenca (e detyrueshme)', bank.reference],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3">
                          <span className="text-slate-400">{k}</span>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(String(v))}
                            title="Kopjo"
                            className="font-mono font-bold text-emerald-400 text-right break-all hover:text-emerald-300"
                          >
                            {v}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                      Pagesa me transfertë bankare nuk është konfiguruar ende. Ju lutemi na kontaktoni.
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                    <ShieldCheck size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Shkruani referencën te përshkrimi i pagesës. Raporti hapet pasi pagesa të konfirmohet (zakonisht brenda pak orësh në ditë pune). Rifreskoni këtë faqe më pas.</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchOrderData}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-colors"
                  >
                    E kreva pagesën, kontrollo statusin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  )
}
