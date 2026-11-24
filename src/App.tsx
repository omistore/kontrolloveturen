import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  Eye,
  FileSearch,
  Gauge,
  HelpCircle,
  History,
  Lock,
  LockKeyhole,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
  Wrench,
  XCircle,
} from 'lucide-react'
import { createOrder, decodeVin, describeVehicle, type DecodedVin } from './api'
import { Header } from './shared/Header'
import { Footer } from './shared/Footer'

// Sample VIN presets so users can test with 1 click
const SAMPLE_VINS = [
  { label: 'BMW 520d (2021)', vin: 'WBA3A5C50DF123456', desc: 'Gjermani • Dizell' },
  { label: 'Audi A6 40 TDI (2020)', vin: 'WAUZZZF20LN123456', desc: 'Gjermani • Quattro' },
  { label: 'VW Golf 7 GTD (2018)', vin: 'WVWZZZAUZJP123456', desc: 'Gjermani • 2.0 TDI' },
  { label: 'Mercedes E-Class (2019)', vin: 'WDD2130041A123456', desc: 'Gjermani • 9G-Tronic' },
]

const services = [
  {
    icon: Gauge,
    title: 'Kontrolli i Kilometrave (Odometri)',
    desc: 'Zbuloni me saktësi nëse kilometrat janë kthyer mbrapa përmes historikut kronologjik nga kontrollet teknike dhe servisimet e autorizuara.',
    badge: 'Më e rëndësishmja',
  },
  {
    icon: ShieldAlert,
    title: 'Aksidente dhe Dëmtime Strukturore',
    desc: 'Verifikoni nëse mjeti ka pësuar goditje të forta, dëmtime të shasisë, hapje të airbag-eve apo riparime të maskuara para shitjes.',
    badge: 'Siguri maksimale',
  },
  {
    icon: FileSearch,
    title: 'Fotografi nga Arkivat & Ankandet',
    desc: 'Shikoni fotografitë autentike të automjetit të marra nga ankandet europiane dhe amerikane para se të importohej dhe lahej.',
    badge: 'Transparencë vizuale',
  },
  {
    icon: ClipboardCheck,
    title: 'Verifikim Vjedhjeje (Interpol DB)',
    desc: 'Skanim i menjëhershëm në bazat policore ndërkombëtare (Interpol, Europol, Schengen) për të evituar bllokimin e automjetit në kufi.',
    badge: 'Mbrojtje ligjore',
  },
  {
    icon: History,
    title: 'Historiku i Regjistrimeve & Pronësisë',
    desc: 'Mësoni numrin e pronarëve të mëparshëm, shtetin e origjinës dhe nëse mjeti është përdorur si taksi, rent-a-car apo veturë private.',
    badge: 'E kaluara reale',
  },
  {
    icon: Wrench,
    title: 'Pajisjet e Fabrikës & Specifikimet',
    desc: 'Dekodoni listën e plotë të pajisjeve me të cilat ka dalë nga fabrika: motori, lloji i transmisionit, pakot sportive dhe opsionet luksoze.',
    badge: 'Specifikim origjinal',
  },
]

const faqs = [
  {
    question: 'Çfarë është numri VIN dhe ku mund ta gjej?',
    answer:
      'Numri VIN (Vehicle Identification Number) është kodi unik i identifikimit të automjetit me 17 karaktere. Mund ta gjeni në librezën e qarkullimit (Rubrika E), në këndin e poshtëm të majtë të xhamit të përparmë, ose në etiketën metalike në shtyllën e derës së shoferit.',
  },
  {
    question: 'Pse ia vlen të paguaj 19.99€ para blerjes së veturës?',
    answer:
      'Një kontroll prej 19.99€ mund t’ju kursejë mijëra euro! Kthimi i kilometrazhit (odometrit) është një mashtrim i zakonshëm që ul artificialisht moshën e veturës dhe fsheh defekte madhore në motor dhe transmision. Po ashtu, dëmtimet e fshehura të shasisë ulin sigurinë tuaj dhe të familjes në rrugë.',
  },
  {
    question: 'Si realizohet pagesa dhe sa kohë duhet të pres për raportin?',
    answer:
      'Pagesa realizohet online në mënyrë 100% të sigurt me kartelë bankare (Visa, Mastercard, Maestro). Sapo autorizohet pagesa, raporti gjenerohet në çast (brenda 5-10 sekondave) dhe shfaqet menjëherë në ekranin tuaj, me mundësi shkarkimi në format PDF.',
  },
  {
    question: 'Nga cilat shtete dhe baza të dhënash merren informacionet?',
    answer:
      'Të dhënat tona integrohen nga mbi 32 shtete europiane dhe SHBA, përfshirë regjistrat shtetërorë të kontrolleve teknike (si TÜV dhe DEKRA në Gjermani), kompanitë e sigurimeve, bazën ndërkombëtare të të dhënave të policisë (Interpol) dhe arkivat e ankandeve të mëdha europiane.',
  },
  {
    question: 'A mund të shoh një raport shembull para se të porosis?',
    answer:
      'Po, patjetër! Ju mund të klikoni butonin "Raport Shembull" në krye të faqes ose në fund të seksionit të kërkimit për të eksploruar një raport të plotë demonstrativ për një BMW Seria 5.',
  },
  {
    question: 'A zëvendëson ky raport kontrollin fizik te mekaniku?',
    answer:
      'Raporti ynë dhe kontrolli i mekanikut plotësojnë njëri-tjetrin. Raporti zbulon të kaluarën e fshehur që mekaniku nuk mund ta shohë me sy (kilometrat e kaluara, regjistrimet e vjedhjes, aksidentet jashtë vendit), ndërsa mekaniku vlerëson konsumimin aktual mekanik.',
  },
]

const reviews = [
  {
    name: 'Arben Krasniqi',
    location: 'Prishtinë',
    car: 'BMW 520d xDrive (2020)',
    rating: 5,
    text: 'Shitësi pretendonte se vetura kishte vetëm 142,000 km. Pasi vendosa VIN-in këtu, raporti zbuloi se në vitin 2023 në Gjermani kishte pasur 285,000 km në kontrollin teknik të fundit! Më shpëtoi nga një mashtrim mbi 3,500€.',
    date: 'Para 3 ditësh',
  },
  {
    name: 'Besnik Murati',
    location: 'Tiranë',
    car: 'Audi A6 40 TDI (2019)',
    rating: 5,
    text: 'Raporti doli brenda 10 sekondash. Kishte fotografi të qarta nga ankandi në Belgjikë ku vetura kishte pasur vetëm një gërvishtje në parakolp. Shasia dhe airbag-ët ishin të pastër. E bleva veturën me qetësi të plotë mendore!',
    date: 'Para 1 jave',
  },
  {
    name: 'Dardan Salihu',
    location: 'Prizren',
    car: 'Volkswagen Golf 7 (2018)',
    rating: 5,
    text: 'I tregova shitësit raportin zyrtar ku shfaqej një dëmtim i mëparshëm i parakolpit që ai e kishte fshehur. Për shkak të këtij raporti prej 19.99€, arrita të negocioj dhe ia zbrita çmimin e shitjes për plot 1,200€!',
    date: 'Para 2 javësh',
  },
]

function Hero() {
  const navigate = useNavigate()
  const [vin, setVin] = useState('')
  const [firstName, setFirstName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [decoded, setDecoded] = useState<DecodedVin | null>(null)
  const [step, setStep] = useState<1 | 2>(1)

  const handleVinChange = async (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17)
    setVin(clean)
    setError('')

    if (clean.length === 17) {
      try {
        const res = await decodeVin(clean)
        if (res.success && res.data) {
          setDecoded(res.data)
        }
      } catch {
        // Fallback
      }
    } else {
      setDecoded(null)
    }
  }

  const handleSelectSample = (sampleVin: string) => {
    handleVinChange(sampleVin)
  }

  const handleStep1Continue = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (vin.length !== 17) {
      setError('Ju lutemi shkruani një numër VIN të vlefshëm me saktësisht 17 karaktere.')
      return
    }

    setLoading(true)
    try {
      const res = await decodeVin(vin)
      if (res.success && res.data) {
        setDecoded(res.data)
      }
      setStep(2)
    } catch {
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Ju lutemi vendosni një adresë email të vlefshme ku do t’ju dërgohet raporti.')
      return
    }

    setLoading(true)
    try {
      const vehicleDesc = decoded ? describeVehicle(decoded) : ''
      const order = await createOrder({
        vin,
        firstName,
        lastName: '',
        vehicleType: vehicleDesc,
        phone,
        email,
      })
      navigate(`/raporti/${order.id}?checkout=active`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ndodhi një gabim gjatë hapjes së arkës. Ju lutemi provoni përsëri.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-[680px] pt-12 pb-20 overflow-hidden bg-[#070e17]" id="kontrollo">
      {/* Background radial gradient highlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-[-10%] w-[500px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Subtle grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d08_1px,transparent_1px),linear-gradient(to_bottom,#1f293d08_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SISTEMI ZYRTAR I VERIFIKIMIT TË HISTORIKUT ME NUMËR VIN</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
            Mos e bli veturën me sy mbyllur.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Zbardh historikun e vërtetë.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Mbrohuni nga mashtrimet me kilometra të kthyera, aksidente të maskuara dhe vetura në kërkim nga policia. Merrni raportin zyrtar të menjëhershëm për vetëm <strong className="text-emerald-400 font-bold">19.99€</strong>.
          </p>

          {/* Search Box / Interactive VIN Form */}
          <div className="mt-8 max-w-2xl mx-auto text-left">
            {step === 1 ? (
              <form onSubmit={handleStep1Continue} className="space-y-4">
                <div className="relative p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all focus-within:border-emerald-400/80 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1 flex items-center pl-3 pr-2">
                      <Search className="text-slate-400 shrink-0 mr-3" size={22} />
                      <input
                        type="text"
                        autoComplete="off"
                        maxLength={17}
                        placeholder="Shkruaj numrin VIN me 17 karaktere (p.sh. WBA3...)"
                        value={vin}
                        onChange={(e) => handleVinChange(e.target.value)}
                        className="w-full bg-transparent border-0 text-white placeholder-slate-500 font-mono text-base sm:text-lg tracking-wider font-semibold focus:outline-none py-3"
                      />
                      <span className="text-xs font-mono font-bold text-slate-500 px-2 shrink-0">
                        {vin.length}/17
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || vin.length < 17}
                      className="px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Duke kontrolluar…</span>
                        </>
                      ) : (
                        <>
                          <span>Kontrollo Tani</span>
                          <ArrowRight size={17} strokeWidth={2.5} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Instant Live Vehicle Specs Preview Badge */}
                {decoded && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm animate-fade-in shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white">Automjeti u gjet me sukses: </span>
                      {[describeVehicle(decoded), decoded.fuelType, decoded.country && `Origjina: ${decoded.country}`].filter(Boolean).join(' • ')}
                    </div>
                  </div>
                )}

                {/* Validation error display */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                    <CircleHelp size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Interactive Sample Chips */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles size={13} className="text-emerald-400" />
                      Ose testo me një klik (VIN Shembuj):
                    </span>
                    <Link to="/raporti/shembull" className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
                      <span>Shiko raport të plotë demonstrativ</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_VINS.map((item) => (
                      <button
                        key={item.vin}
                        type="button"
                        onClick={() => handleSelectSample(item.vin)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left flex items-center gap-2 ${
                          vin === item.vin
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                        }`}
                      >
                        <Car size={13} className="text-emerald-400 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              /* Step 2 Form (Order & Instant Checkout Trigger) */
              <form onSubmit={handleFinalSubmit} className="p-6 rounded-2xl bg-slate-900/95 border border-emerald-500/30 shadow-2xl backdrop-blur-2xl space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Hapi 2 nga 2</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">Përfundoni porosinë e raportit</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-400 hover:text-white underline transition-colors"
                  >
                    Ndrysho VIN
                  </button>
                </div>

                {/* Car summary card */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Car size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {describeVehicle(decoded)}
                      </div>
                      <div className="text-xs font-mono text-slate-400">{vin}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 line-through">29.99€</div>
                    <div className="text-xl font-black text-emerald-400">19.99€</div>
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email ku do të pranoni raportin &amp; faturën *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="p.sh. emri@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Emri juaj (Opsionale)
                      </label>
                      <input
                        type="text"
                        placeholder="Emri Mbiemri"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Numri i telefonit (Opsionale)
                      </label>
                      <input
                        type="tel"
                        placeholder="+383 49 XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Duke hapur arkën e sigurt…</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      <span>Vazhdo te Pagesa 19.99€ &amp; Hap Raportin</span>
                      <ArrowRight size={17} strokeWidth={2.5} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                  <Lock size={13} className="text-emerald-400" />
                  <span>Pagesë e sigurt online. Raporti hapet menjëherë pas pagesës.</span>
                </div>
              </form>
            )}
          </div>

          {/* Social Proof & Counter */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[10px] border border-slate-900">✓</span>
                <span className="w-6 h-6 rounded-full bg-teal-400 text-slate-950 font-bold flex items-center justify-center text-[10px] border border-slate-900">★</span>
                <span className="w-6 h-6 rounded-full bg-emerald-300 text-slate-950 font-bold flex items-center justify-center text-[10px] border border-slate-900">EU</span>
              </div>
              <span className="font-semibold text-slate-300">Mbi 42,000+ automjete të skanuara</span>
            </div>

            <span className="hidden sm:inline text-slate-700">•</span>

            <div className="flex items-center gap-1 text-amber-400">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <span className="font-bold text-white ml-1">4.9/5</span>
              <span className="text-slate-400">(3,400+ vlerësime)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function OfficialRegistries() {
  const registries = [
    { name: 'TÜV SÜD Gjermani', type: 'Inspektime Teknike' },
    { name: 'Interpol Police DB', type: 'Statusi i Vjedhjes' },
    { name: 'Regjistri i Sigurimeve', type: 'Dëmtimet & Aksidentet' },
    { name: 'Arkivat e Ankandeve', type: 'Copart & IAAI' },
    { name: 'DEKRA Inspection', type: 'Kilometrat Zyrtare' },
    { name: 'Rrjeti i Koncesionarëve', type: 'Servisimet Zyrtare' },
  ]

  return (
    <div className="border-y border-slate-800/80 bg-[#060b13] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-xs uppercase font-extrabold text-slate-400 tracking-wider shrink-0">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span>Burimet zyrtare të të dhënave:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full md:w-auto">
            {registries.map((r) => (
              <div key={r.name} className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-center">
                <div className="text-xs font-bold text-slate-200">{r.name}</div>
                <div className="text-[10px] text-emerald-400 font-medium">{r.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* Interactive Showcase Component (Shows sample report tabs directly on homepage) */
function ReportShowcase() {
  const [activeTab, setActiveTab] = useState<'mileage' | 'damages' | 'photos' | 'interpol'>('mileage')

  return (
    <section className="py-24 bg-[#080f1a] relative" id="zbulimi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Eye size={14} />
            <span>Transparencë e Plotë</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Çfarë zbulon raporti brenda 10 sekondave?
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Eksploroni demonstrimin e mëposhtëm interaktiv për të parë nivelin e lartë të detajeve që përmban çdo raport i VeturëCheck.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('mileage')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'mileage'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Gauge size={16} />
            <span>Historiku i Kilometrave</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('damages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'damages'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ShieldAlert size={16} />
            <span>Dëmtimet &amp; Aksidentet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'photos'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <FileSearch size={16} />
            <span>Fotot nga Arkivat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('interpol')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'interpol'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <LockKeyhole size={16} />
            <span>Statusi Interpol</span>
          </button>
        </div>

        {/* Showcase Container Window */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-slate-950 border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Header of the mock window */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono font-semibold text-slate-400 ml-2">
                Raporti: BMW 520d (VIN: WBA3A5C50DF123456)
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={13} /> Verifikuar
            </span>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'mileage' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-white font-bold text-sm">Statusi i Kilometrazhit: I Rregullt</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Nuk është gjetur asnjë devijim apo kthim mbrapa i odometrit. Progresion normal vjetor.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 block">Leximi i fundit:</span>
                    <span className="text-lg font-black text-white">134,200 km</span>
                  </div>
                </div>

                {/* Timeline display */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    <div className="text-xs font-bold text-emerald-400">14 Tetor 2024 • Gjermani</div>
                    <div className="text-sm font-bold text-white mt-0.5">134,200 km — Kontroll teknik periodik (TÜV SÜD)</div>
                    <div className="text-xs text-slate-400">Emetimet e gazrave brenda normave Euro 6. Frenat dhe amortizatorët në rregull.</div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-600 border-2 border-slate-950" />
                    <div className="text-xs font-bold text-slate-400">22 Qershor 2023 • Gjermani</div>
                    <div className="text-sm font-bold text-white mt-0.5">102,400 km — Servisim i autorizuar zyrtar BMW</div>
                    <div className="text-xs text-slate-400">Ndërrim vaji, filtra origjinalë, diagnostikim elektronik pa gabime.</div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-600 border-2 border-slate-950" />
                    <div className="text-xs font-bold text-slate-400">18 Mars 2022 • Gjermani</div>
                    <div className="text-sm font-bold text-white mt-0.5">64,100 km — Kontrolli i rregullt i sigurisë rrugore</div>
                    <div className="text-xs text-slate-400">Kontrolli i sistemit të frenimit dhe transmisionit Steptronic.</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'damages' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <ShieldCheck size={26} className="text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold text-sm">Vlerësimi Strukturor i Karrocerisë</h4>
                    <p className="text-xs text-slate-400">
                      Shasia kryesore, shtyllat mbrojtëse dhe pjesa mbajtëse e motorit janë të paprekura.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Shasia &amp; Shtyllat A, B, C</div>
                      <div className="text-[11px] text-slate-400">Gjeometri e rregullt fabrike</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">E Paprekur</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Airbag-ët (Frontalë &amp; Anësorë)</div>
                      <div className="text-[11px] text-slate-400">Asnjë aktivizim në historik</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">Funksionalë</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Parakolpi i Përparmë</div>
                      <div className="text-[11px] text-slate-400">Riparim i lehtë kozmetik në servis zyrtar</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold">Riparuar</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Dëmtim nga Uji / Përmbytja</div>
                      <div className="text-[11px] text-slate-400">Asnjë shenjë lagështie në dysheme</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">Pastër</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Fotografitë origjinale të arkivuara para transportit dhe importimit:
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                    3 Fotografi në Arkivë
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative rounded-xl overflow-hidden group border border-slate-800 aspect-video">
                    <img
                      src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"
                      alt="Pamje ballore"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur">
                      Pamje Ballore
                    </span>
                  </div>

                  <div className="relative rounded-xl overflow-hidden group border border-slate-800 aspect-video">
                    <img
                      src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
                      alt="Pamje anësore"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur">
                      Profil &amp; Shasi
                    </span>
                  </div>

                  <div className="relative rounded-xl overflow-hidden group border border-slate-800 aspect-video">
                    <img
                      src="https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=800&q=80"
                      alt="Pamje e brendshme"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur">
                      Interieri &amp; Kilometrat
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'interpol' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-4 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Certifikatë Pastërtie</span>
                    <h4 className="text-white font-bold text-base">Jo e Raportuar e Vjedhur (Pastër)</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Automjeti nuk figuron në bazën e të dhënave të automjeteve të vjedhura të Interpol, Europol apo zonës Schengen.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Interpol DB</div>
                    <div className="text-emerald-400 font-bold mt-1">✓ E Pastër</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Europol SIS II</div>
                    <div className="text-emerald-400 font-bold mt-1">✓ E Pastër</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Barra Ligjore / Peng</div>
                    <div className="text-emerald-400 font-bold mt-1">✓ Nuk Ka</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Leje Eksporti</div>
                    <div className="text-emerald-400 font-bold mt-1">✓ E Rregullt</div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom CTA to see full sample */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400 text-center sm:text-left">
                Këto janë vetëm një pjesë e të dhënave që gjenerohen për çdo veturë.
              </span>
              <Link
                to="/raporti/shembull"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <span>Hap Raportin e Plotë Shembull</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Alarming Market Reality Statistics Section */
function MarketReality() {
  const stats = [
    {
      figure: '62%',
      label: 'e veturave të importuara',
      text: 'kanë të paktën 1 ndërhyrje në odometër ose dëmtim të fshehur që nuk i tregohet blerësit.',
      icon: TrendingDown,
      color: 'text-amber-400',
    },
    {
      figure: '2,800€',
      label: 'humbje mesatare në vlerë',
      text: 'pëson blerësi në çastin kur merr një veturë me 100,000 km më shumë sesa tregon paneli.',
      icon: AlertTriangle,
      color: 'text-red-400',
    },
    {
      figure: '1,850€',
      label: 'riparime të papritura',
      text: 'harxhohen mesatarisht në 6 muajt e parë për shkak të konsumimit të fshehur mekanik.',
      icon: Wrench,
      color: 'text-amber-400',
    },
    {
      figure: '19.99€',
      label: 'kosto e një kontrolli',
      text: 'investimi i vetëm që ju jep fuqi negociuese dhe siguri të plotë para se të ndani paratë.',
      icon: ShieldCheck,
      color: 'text-emerald-400',
    },
  ]

  return (
    <section className="py-20 bg-[#060b13] border-t border-slate-800/80" id="krahasimi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle size={14} />
            <span>Realiteti i Tregut të Veturave të Përdorura</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pse kontrolli me sy nuk mjafton më?
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Sot mashtrimet janë bërë profesionale: kilometrat fshihen nga bordi me kompjuter dhe pjesët e aksidentuara mbulohen me bojë të re.
          </p>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.figure} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-4xl font-black ${s.color}`}>{s.figure}</span>
                  <s.icon className={`${s.color} shrink-0`} size={24} />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{s.label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Side by side comparison table */}
        <div className="mt-16 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-sm font-bold text-white">
            Krahasimi: Kontrolli me Sy vs. Raporti Zyrtar VeturëCheck
          </div>
          <div className="divide-y divide-slate-800/80 text-xs sm:text-sm">
            <div className="grid grid-cols-3 p-4 items-center">
              <span className="font-semibold text-slate-300">Kilometrat e Kthyera</span>
              <span className="text-red-400 flex items-center gap-1.5"><XCircle size={15} /> E pamundur të dallohet</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5"><CheckCircle2 size={15} /> Zbulim 100% kronologjik</span>
            </div>
            <div className="grid grid-cols-3 p-4 items-center bg-slate-900/30">
              <span className="font-semibold text-slate-300">Aksidentet e Fshehura</span>
              <span className="text-red-400 flex items-center gap-1.5"><XCircle size={15} /> Shihet vetëm boja e jashtme</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5"><CheckCircle2 size={15} /> Raport sigurimesh &amp; shasie</span>
            </div>
            <div className="grid grid-cols-3 p-4 items-center">
              <span className="font-semibold text-slate-300">Vetura të Vjedhura (Interpol)</span>
              <span className="text-red-400 flex items-center gap-1.5"><XCircle size={15} /> Rrezik konfiskimi në kufi</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5"><CheckCircle2 size={15} /> Verifikim i menjëhershëm policor</span>
            </div>
            <div className="grid grid-cols-3 p-4 items-center bg-slate-900/30">
              <span className="font-semibold text-slate-300">Fotot nga Ankandet Jashtë</span>
              <span className="text-red-400 flex items-center gap-1.5"><XCircle size={15} /> Nuk keni asnjë qasje</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5"><CheckCircle2 size={15} /> Arkivë vizuale me fotografi</span>
            </div>
            <div className="grid grid-cols-3 p-4 items-center">
              <span className="font-semibold text-slate-300">Rreziku Financiar</span>
              <span className="text-red-400 font-bold">Deri në 4,000€ humbje</span>
              <span className="text-emerald-400 font-extrabold">I eliminuar për 19.99€</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Services Grid */
function Services() {
  return (
    <section className="py-24 bg-[#070e18]" id="sherbimet">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Mbrojtje e Plotë Para Blerjes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Çdo detaj që ju duhet, në një vend të vetëm.
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Sistemi ynë lidhet me qindra baza të dhënash për të mbledhur të kaluarën e automjetit tuaj të ardhshëm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  <item.icon size={24} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* Where to Find VIN Visual Guide */
function VinLocationGuide() {
  const locations = [
    {
      step: '01',
      title: 'Xhami i Përparmë',
      desc: 'Në këndin e poshtëm të majtë të xhamit të përparmë (shikohet nga jashtë veturës, ana e shoferit).',
    },
    {
      step: '02',
      title: 'Shtylla e Derës së Shoferit',
      desc: 'Në pllakëzën metalike ose afishen e prodhuesit kur hapni derën e shoferit (B-pillar).',
    },
    {
      step: '03',
      title: 'Libreza e Qarkullimit',
      desc: 'Në dokumentin zyrtar të automjetit (Libreza e regjistrimit), në Rubrikën "E" me 17 karaktere.',
    },
  ]

  return (
    <section className="py-20 bg-[#060c14] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ku ta gjeni numrin VIN me 17 karaktere?
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Kodi VIN është unik për çdo automjet në botë dhe gjendet me lehtësi në tre vende kryesore:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div key={loc.step} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <span className="text-4xl font-black text-slate-800 absolute top-4 right-4">{loc.step}</span>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-sm mb-4">
                {loc.step}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{loc.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{loc.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* Pricing Section */
function Pricing() {
  return (
    <section className="py-24 bg-[#070e17] relative" id="cmimi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CreditCard size={14} />
            <span>Çmime të Qarta pa Abonime të Fshehura</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Një pagesë e vetme. Siguri e përjetshme.
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Pa kontrata mujore apo tarifa shtesë. Paguani vetëm për raportet që ju nevojiten me kartelë bankare.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Card 1: Single Report */}
          <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Për 1 Automjet</div>
              <h3 className="text-xl font-bold text-white mb-1">Raport Individual</h3>
              <p className="text-xs text-slate-400 mb-6">Për blerësit që kanë përzgjedhur tashmë një veturë specifike.</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">19.99</span>
                <span className="text-xl font-bold text-emerald-400">€</span>
                <span className="text-xs text-slate-500 ml-2">pagesë e vetme</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 mb-8 border-t border-slate-800 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>1x Raport i plotë me numër VIN</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Historiku kronologjik i kilometrave</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Aksidentet dhe dëmtimet strukturore</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Fotografitë e arkivave të ankandeve</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Verifikim policor Interpol DB</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Shkarkim në PDF &amp; Qasje 30 ditë</span>
                </li>
              </ul>
            </div>

            <a
              href="/#kontrollo"
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors text-center"
            >
              <span>Zgjidh 1 Raport</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Card 2: 2 Reports (Featured / Popular) */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-[#0a181e] border-2 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)] flex flex-col justify-between relative transform md:-translate-y-2">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
              Më e Kërkuara • Kurseni 18%
            </span>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Krahasim Optimal</div>
              <h3 className="text-xl font-bold text-white mb-1">Paketa 2 Raporte</h3>
              <p className="text-xs text-slate-400 mb-6">Ideale për të krahasuar dy vetura para se të merrni vendimin.</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">32.99</span>
                <span className="text-xl font-bold text-emerald-400">€</span>
                <span className="text-xs text-slate-400 line-through ml-2">39.98€</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-200 mb-8 border-t border-slate-800 pt-6">
                <li className="flex items-center gap-2.5 font-semibold text-white">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>2x Raporte të plota VIN (16.50€ për raport)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Krahasim i drejtpërdrejtë i 2 makinave</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Verifikim kilometrash &amp; aksidentesh</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Fotografitë e të dyja veturave nga arkivat</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Shkarkim në PDF &amp; Qasje pa afat</span>
                </li>
              </ul>
            </div>

            <a
              href="/#kontrollo"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] text-center"
            >
              <span>Zgjidh 2 Raporte (32.99€)</span>
              <ArrowRight size={15} />
            </a>
          </div>

          {/* Card 3: 3 Reports (Pro / Dealers) */}
          <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Blerës Aktivë</div>
              <h3 className="text-xl font-bold text-white mb-1">Paketa 3 Raporte</h3>
              <p className="text-xs text-slate-400 mb-6">Për ata që kontrollojnë disa alternativa ose tregtarë automjetesh.</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">44.99</span>
                <span className="text-xl font-bold text-emerald-400">€</span>
                <span className="text-xs text-slate-400 line-through ml-2">59.97€</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 mb-8 border-t border-slate-800 pt-6">
                <li className="flex items-center gap-2.5 font-semibold text-white">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>3x Raporte të plota (Vetëm 14.99€/raport)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Kurseni plot 25% nga çmimi bazë</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Kreditet e papërdorura mbeten aktive</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>Mbështetje prioritare në WhatsApp</span>
                </li>
              </ul>
            </div>

            <a
              href="/#kontrollo"
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors text-center"
            >
              <span>Zgjidh 3 Raporte</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Customer Reviews */
function Testimonials() {
  return (
    <section className="py-24 bg-[#060b13] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Star size={14} />
            <span>Përvoja të Vërteta të Blerësve</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Mbi 3,400+ klientë kanë shmangur mashtrimet.
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Lexoni se si shoferët në Kosovë dhe Shqipëri kursyen mijëra euro duke marrë raportin para se të blinin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500">{r.date}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 italic">
                  "{r.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{r.name}</h4>
                  <p className="text-xs text-slate-400">{r.location}</p>
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-1 rounded bg-slate-800 text-slate-300">
                  {r.car}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* FAQ Accordion */
function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 bg-[#080e18]" id="pyetje">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle size={14} />
            <span>Përgjigje të Drejtpërdrejta</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pyetje të shpeshta (FAQ)
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            Gjithçka që duhet të dini rreth numrit VIN, sigurisë së pagesës dhe të dhënave të raportit.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={faq.question}
              className={`rounded-2xl border transition-all ${
                openIndex === idx
                  ? 'bg-slate-900 border-emerald-500/40 shadow-lg'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 font-semibold text-sm sm:text-base text-white"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-emerald-400 transition-transform duration-200 shrink-0 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070e17] text-[#eef2f6]">
      <Header />
      <main>
        <Hero />
        <OfficialRegistries />
        <ReportShowcase />
        <MarketReality />
        <Services />
        <VinLocationGuide />
        <Pricing />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}
