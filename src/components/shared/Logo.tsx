interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { icon: 28, text: 'text-base', sub: 'text-[8px]', gap: 'gap-2' },
  md: { icon: 38, text: 'text-xl', sub: 'text-[9px]', gap: 'gap-2.5' },
  lg: { icon: 52, text: 'text-3xl', sub: 'text-xs', gap: 'gap-3' },
  xl: { icon: 72, text: 'text-4xl', sub: 'text-sm', gap: 'gap-4' },
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const s = sizes[size]

  return (
    <div className={`flex items-center ${s.gap} ${className ?? ''}`}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Glow de fundo */}
        <defs>
          <radialGradient id="pawGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pawGrad" x1="20" y1="10" x2="80" y2="90">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="circuitGrad" x1="30" y1="50" x2="70" y2="80">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Glow circle */}
        <circle cx="50" cy="55" r="40" fill="url(#pawGlow)" />

        {/* Pad principal - maior e mais expressivo */}
        <ellipse cx="50" cy="62" rx="22" ry="18" fill="url(#pawGrad)" />

        {/* 4 dedos com gradiente */}
        <ellipse cx="24" cy="32" rx="10" ry="13" fill="url(#pawGrad)" />
        <ellipse cx="42" cy="22" rx="10" ry="13" fill="url(#pawGrad)" />
        <ellipse cx="58" cy="22" rx="10" ry="13" fill="url(#pawGrad)" />
        <ellipse cx="76" cy="32" rx="10" ry="13" fill="url(#pawGrad)" />

        {/* === CIRCUITOS TECH === */}

        {/* Nó central do chip */}
        <rect x="44" y="56" width="12" height="12" rx="2" fill="url(#circuitGrad)" opacity="0.85" />

        {/* Nós nas extremidades */}
        <circle cx="35" cy="56" r="3" fill="url(#circuitGrad)" opacity="0.85" />
        <circle cx="65" cy="56" r="3" fill="url(#circuitGrad)" opacity="0.85" />
        <circle cx="50" cy="74" r="3" fill="url(#circuitGrad)" opacity="0.85" />

        {/* Linhas de circuito - horizontais */}
        <line x1="38" y1="56" x2="44" y2="62" stroke="white" strokeWidth="1.5" opacity="0.7" />
        <line x1="56" y1="62" x2="62" y2="56" stroke="white" strokeWidth="1.5" opacity="0.7" />

        {/* Linhas de circuito - verticais */}
        <line x1="50" y1="68" x2="50" y2="71" stroke="white" strokeWidth="1.5" opacity="0.7" />

        {/* Traces dos dedos ao pad - linhas pontilhadas tech */}
        <line x1="24" y1="42" x2="38" y2="54" stroke="white" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />
        <line x1="42" y1="33" x2="46" y2="54" stroke="white" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />
        <line x1="58" y1="33" x2="54" y2="54" stroke="white" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />
        <line x1="76" y1="42" x2="62" y2="54" stroke="white" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />

        {/* Micro nós nos dedos (LED indicators) */}
        <circle cx="24" cy="29" r="2.5" fill="white" opacity="0.9" />
        <circle cx="42" cy="19" r="2.5" fill="white" opacity="0.9" />
        <circle cx="58" cy="19" r="2.5" fill="white" opacity="0.9" />
        <circle cx="76" cy="29" r="2.5" fill="white" opacity="0.9" />

        {/* Reflexo de brilho no pad */}
        <ellipse cx="44" cy="56" rx="8" ry="4" fill="white" opacity="0.08" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${s.text} font-extrabold tracking-tight text-foreground`}>
            Pet<span className="text-accent">Core</span>
          </span>
          <span className={`${s.sub} uppercase tracking-[0.25em] text-muted-foreground mt-0.5`}>
            Vet System
          </span>
        </div>
      )}
    </div>
  )
}
