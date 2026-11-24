import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Lock,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { Logo } from './Logo'

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="site-footer bg-[#04080e] border-t border-slate-800/90 text-slate-400 text-sm">
      {/* Top Pre-footer Guarantee Banner */}
      <div className="border-b border-slate-800/60 bg-[#070f1a]/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Verifikim i Pavarur dhe Zyrtar</h4>
                <p className="text-xs text-slate-400 mt-0.5">Të dhëna të certifikuara nga 32 shtete europiane dhe SHBA.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Pagesë e Sigurt 256-bit SSL</h4>
                <p className="text-xs text-slate-400 mt-0.5">Transaksione të mbrojtura me teknologjinë më të lartë bankare.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <FileCheck size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Gjenerim i Menjëhershëm</h4>
                <p className="text-xs text-slate-400 mt-0.5">Raporti hapet automatikisht brenda pak sekondave dhe ruhet në PDF.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo />
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm mt-3">
              VeturëCheck është platforma lider për kontrollin dhe verifikimin e historikut të automjeteve të përdorura në Kosovë, Shqipëri dhe rajon. Mbroni investimin tuaj duke zbuluar kilometrat reale, aksidentet dhe dëmtimet e fshehura para blerjes.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
                <CheckCircle2 size={12} className="text-emerald-400" /> Baza të Dhënave të Autorizuara
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
                <CheckCircle2 size={12} className="text-emerald-400" /> Interpol DB Verified
              </span>
            </div>
          </div>

          {/* Column 2: Navigimi */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Navigimi</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="/#kontrollo" className="hover:text-emerald-400 transition-colors">
                  Kontrollo Numrin VIN
                </a>
              </li>
              <li>
                <Link to="/raporti/shembull" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>Shiko Raport Shembull</span>
                  <ExternalLink size={11} className="text-emerald-400" />
                </Link>
              </li>
              <li>
                <a href="/#zbulimi" className="hover:text-emerald-400 transition-colors">
                  Çfarë Zbulon Raporti
                </a>
              </li>
              <li>
                <a href="/#krahasimi" className="hover:text-emerald-400 transition-colors">
                  Krahasimi me Kontrollin me Sy
                </a>
              </li>
              <li>
                <a href="/#cmimi" className="hover:text-emerald-400 transition-colors">
                  Çmimi &amp; Paketat (19.99€)
                </a>
              </li>
              <li>
                <a href="/#si-funksionon" className="hover:text-emerald-400 transition-colors">
                  Si Funksionon Shërbimi
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Burimet e të Dhënave */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Burimet Zyrtare</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>TÜV SÜD &amp; DEKRA Gjermani</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Regjistri i Sigurimeve Europiane</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Baza Ndërkombëtare e Interpol-it</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Arkivat e Ankandeve (Copart / IAAI)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Koncesionarët Zyrtarë të Prodhuesve</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Ndihma & Kontakti */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Ndihmë &amp; Mbështetje</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="/#pyetje" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-emerald-400" />
                  <span>Pyetje të Shpeshta (FAQ)</span>
                </a>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Lock size={13} className="text-slate-500" />
                  <span>Hyrje Administratori</span>
                </Link>
              </li>
              <li className="pt-2 text-slate-400">
                <span className="block font-semibold text-white mb-0.5">Mbështetje për Klientët:</span>
                <span className="text-[11px] block">E hënë - E diel (24/7 Shërbim i automatizuar)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods and Disclaimer Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Mënyrat e Pagesës:</span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-bold text-slate-300">VISA</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-bold text-slate-300">Mastercard</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-bold text-slate-300">Apple Pay</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-bold text-slate-300">Google Pay</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-right">
            Enkriptim 256-bit SSL • Raporti ruhet dhe qaset në çdo kohë
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {currentYear} VeturëCheck. Të gjitha të drejtat e rezervuara.
          </div>
          <div className="text-center sm:text-right text-slate-400 max-w-xl">
            Vërejtje ligjore: Ky raport ofron të dhëna historike të dokumentuara nga regjistrat shtetërorë dhe privatë. Gjithmonë rekomandohet edhe një kontroll fizik nga një mekanik i autorizuar para blerjes përfundimtare.
          </div>
        </div>
      </div>
    </footer>
  )
}
