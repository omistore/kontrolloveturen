import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link className="brand group flex items-center gap-2.5" to="/" aria-label="VeturëCheck — Faqja kryesore">
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-transparent border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:border-emerald-400/60 transition-all duration-300">
        <svg
          className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Shield contour */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          {/* Checkmark inside */}
          <path d="m9 12 2 2 4-4" stroke="#10b981" strokeWidth="2.5" />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <div className="flex items-center tracking-tight">
          <span className="text-[19px] font-extrabold text-white tracking-[-0.03em]">VETURË</span>
          <span className="text-[19px] font-black text-emerald-400 ml-0.5 tracking-[-0.03em]">CHECK</span>
        </div>
        <span className="text-[9.5px] uppercase font-semibold tracking-[0.18em] text-slate-400 -mt-1">
          HISTORIKU ZYRTAR
        </span>
      </div>
    </Link>
  )
}
