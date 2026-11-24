import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Menu,
  Sparkles,
  X,
  Lock,
} from 'lucide-react'
import { Logo } from './Logo'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header
      className={`site-header sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#060c14]/95 backdrop-blur-xl border-b border-emerald-500/15 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
          : 'bg-[#080e17]/85 backdrop-blur-md border-b border-slate-800/80'
      }`}
    >
      <div className="header-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[74px] flex items-center justify-between">
        {/* Brand Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-[13.5px] font-medium text-slate-300">
          <Link
            to="/raporti/shembull"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all font-semibold shadow-[0_0_12px_rgba(16,185,129,0.15)]"
          >
            <Sparkles size={14} className="text-emerald-400" />
            <span>Raport Shembull</span>
          </Link>

          <a href="/#zbulimi" className="hover:text-emerald-400 transition-colors">
            Çfarë Zbulon
          </a>
          <a href="/#krahasimi" className="hover:text-emerald-400 transition-colors">
            Pse Ne
          </a>
          <a href="/#si-funksionon" className="hover:text-emerald-400 transition-colors">
            Si Funksionon
          </a>
          <a href="/#cmimi" className="hover:text-emerald-400 transition-colors">
            Çmimi (19.99€)
          </a>
          <a href="/#pyetje" className="hover:text-emerald-400 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right side CTAs */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Live Data Badge */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>32 Shtete LIVE</span>
          </div>

          <Link
            to="/admin"
            className="text-slate-400 hover:text-slate-200 text-xs font-medium px-2 py-1 rounded transition-colors flex items-center gap-1"
            title="Paneli i Administratorit"
          >
            <Lock size={13} />
            <span className="hidden md:inline">Admin</span>
          </Link>

          <a
            href="/#kontrollo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
          >
            <span>Kontrollo VIN-in</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors border border-slate-800"
          type="button"
          aria-label={menuOpen ? 'Mbyll menynë' : 'Hap menynë'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#060c14]/98 border-b border-emerald-500/20 px-6 py-6 space-y-4 backdrop-blur-2xl animate-fade-in shadow-2xl">
          <Link
            to="/raporti/shembull"
            onClick={closeMenu}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-semibold text-sm"
          >
            <Sparkles size={16} />
            <span>Shiko Raportin Shembull (BMW 520d)</span>
          </Link>

          <div className="flex flex-col gap-3 pt-2 text-sm font-medium text-slate-200 border-t border-slate-800/80">
            <a href="/#zbulimi" onClick={closeMenu} className="py-1 hover:text-emerald-400 transition-colors">
              Çfarë zbulon raporti
            </a>
            <a href="/#krahasimi" onClick={closeMenu} className="py-1 hover:text-emerald-400 transition-colors">
              Pse të zgjidhni VeturëCheck
            </a>
            <a href="/#si-funksionon" onClick={closeMenu} className="py-1 hover:text-emerald-400 transition-colors">
              Si funksionon kontrolli
            </a>
            <a href="/#cmimi" onClick={closeMenu} className="py-1 hover:text-emerald-400 transition-colors">
              Çmimet dhe Paketat (19.99€)
            </a>
            <a href="/#pyetje" onClick={closeMenu} className="py-1 hover:text-emerald-400 transition-colors">
              Pyetje të shpeshta (FAQ)
            </a>
            <Link to="/admin" onClick={closeMenu} className="py-1 text-slate-400 hover:text-slate-200 flex items-center gap-1.5">
              <Lock size={14} /> Paneli i Administratorit
            </Link>
          </div>

          <div className="pt-2">
            <a
              href="/#kontrollo"
              onClick={closeMenu}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm tracking-wide uppercase shadow-[0_0_20px_rgba(16,185,129,0.35)]"
            >
              <span>Fillo Kontrollin Tani</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
