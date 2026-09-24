// ============================================================================
// mobile/src/components/vehicle/brandSvgData.ts
// Crisp, optimized vector SVG definitions for 32 automotive brands
// License: Public Brand Trademark / Cardog / Wikimedia Commons
// ============================================================================

export const BRAND_SVG_XML: Record<string, string> = {
  toyota: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <ellipse cx="50" cy="50" rx="46" ry="34" fill="none" stroke="#D32F2F" stroke-width="5" />
    <ellipse cx="50" cy="46" rx="16" ry="24" fill="none" stroke="#D32F2F" stroke-width="5" />
    <ellipse cx="50" cy="38" rx="28" ry="12" fill="none" stroke="#D32F2F" stroke-width="5" />
  </svg>`,

  nissan: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="50" r="42" fill="none" stroke="#8A8A96" stroke-width="6" />
    <rect x="8" y="40" width="84" height="20" rx="3" fill="#1C1C28" />
    <text x="50" y="55" font-family="sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">NISSAN</text>
  </svg>`,

  hyundai: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <ellipse cx="50" cy="50" rx="45" ry="32" fill="none" stroke="#002C6C" stroke-width="6" transform="rotate(-6 50 50)" />
    <path d="M34 32 L36 68 M36 50 L64 50 M64 32 L66 68" fill="none" stroke="#002C6C" stroke-width="7" stroke-linecap="round" />
  </svg>`,

  kia: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <rect x="5" y="24" width="90" height="52" rx="10" fill="#05141F" />
    <path d="M18 64 L18 36 M18 50 L32 36 M24 45 L34 64" stroke="#EA0029" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M42 36 L42 64" stroke="#EA0029" stroke-width="4.5" stroke-linecap="round" fill="none" />
    <path d="M52 64 L65 36 L78 64 M58 56 L72 56" stroke="#EA0029" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </svg>`,

  honda: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <path d="M18 20 L82 20 C88 20, 88 28, 86 42 L80 78 C78 84, 72 86, 50 86 C28 86, 22 84, 20 78 L14 42 C12 28, 12 20, 18 20 Z" fill="none" stroke="#CC0000" stroke-width="5" />
    <path d="M30 32 L36 74 M70 32 L64 74 M33 48 L67 48" stroke="#CC0000" stroke-width="6" stroke-linecap="round" fill="none" />
  </svg>`,

  mitsubishi: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <polygon points="50,14 62,35 50,56 38,35" fill="#ED1C24" />
    <polygon points="50,56 74,56 86,77 62,77" fill="#ED1C24" />
    <polygon points="50,56 26,56 14,77 38,77" fill="#ED1C24" />
  </svg>`,

  mazda: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <ellipse cx="50" cy="50" rx="44" ry="34" fill="none" stroke="#101820" stroke-width="5" />
    <path d="M26 44 Q40 58 50 44 Q60 58 74 44 C66 62, 34 62, 26 44 Z" fill="#005B94" stroke="#005B94" stroke-width="2" />
  </svg>`,

  suzuki: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <path d="M72 20 L34 20 L28 44 L66 48 L28 80 L72 80 L76 58 L38 54 Z" fill="#E31837" />
  </svg>`,

  isuzu: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <rect x="22" y="24" width="22" height="52" rx="4" fill="#ED1C24" />
    <rect x="56" y="24" width="22" height="52" rx="4" fill="#ED1C24" />
    <rect x="22" y="44" width="56" height="12" fill="#ED1C24" />
  </svg>`,

  lexus: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <ellipse cx="50" cy="50" rx="44" ry="34" fill="none" stroke="#333333" stroke-width="5" />
    <path d="M38 32 L38 68 L68 68 M38 32 L64 64" fill="none" stroke="#333333" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`,

  bmw: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="50" r="46" fill="#1C1C1C" stroke="#C0C0C0" stroke-width="2" />
    <circle cx="50" cy="50" r="32" fill="#FFFFFF" />
    <path d="M50 18 A32 32 0 0 1 82 50 L50 50 Z" fill="#0066B1" />
    <path d="M50 82 A32 32 0 0 1 18 50 L50 50 Z" fill="#0066B1" />
    <circle cx="50" cy="50" r="32" fill="none" stroke="#C0C0C0" stroke-width="1.5" />
    <text x="50" y="15" font-family="sans-serif" font-weight="bold" font-size="7" fill="#FFFFFF" text-anchor="middle">BMW</text>
  </svg>`,

  'mercedes-benz': `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="50" r="44" fill="none" stroke="#7A8B99" stroke-width="5" />
    <polygon points="50,14 47,48 50,50 53,48" fill="#7A8B99" />
    <polygon points="20,72 48,52 50,50 48,47" fill="#7A8B99" />
    <polygon points="80,72 52,47 50,50 52,52" fill="#7A8B99" />
    <circle cx="50" cy="50" r="4" fill="#7A8B99" />
  </svg>`,

  audi: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="23" cy="50" r="16" fill="none" stroke="#1F1F1F" stroke-width="3.5" />
    <circle cx="41" cy="50" r="16" fill="none" stroke="#1F1F1F" stroke-width="3.5" />
    <circle cx="59" cy="50" r="16" fill="none" stroke="#1F1F1F" stroke-width="3.5" />
    <circle cx="77" cy="50" r="16" fill="none" stroke="#1F1F1F" stroke-width="3.5" />
  </svg>`,

  volkswagen: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="50" r="44" fill="#001E50" stroke="#001E50" stroke-width="2" />
    <circle cx="50" cy="50" r="40" fill="none" stroke="#FFFFFF" stroke-width="3" />
    <path d="M32 30 L45 68 L50 54 L55 68 L68 30 M38 48 L44 30 L50 46 L56 30 L62 48" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`,

  ford: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <ellipse cx="50" cy="50" rx="46" ry="28" fill="#003478" stroke="#FFFFFF" stroke-width="3" />
    <text x="50" y="58" font-family="serif" font-style="italic" font-weight="bold" font-size="28" fill="#FFFFFF" text-anchor="middle">Ford</text>
  </svg>`,

  chevrolet: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <polygon points="12,43 88,43 84,57 8,57" fill="#DAA520" stroke="#B8860B" stroke-width="1.5" />
    <polygon points="36,25 64,25 60,75 32,75" fill="#DAA520" stroke="#B8860B" stroke-width="1.5" />
  </svg>`,

  jeep: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <rect x="8" y="32" width="84" height="36" rx="6" fill="#1C2826" />
    <text x="50" y="58" font-family="sans-serif" font-weight="bold" font-size="26" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">Jeep</text>
  </svg>`,

  'land-rover': `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <ellipse cx="50" cy="50" rx="46" ry="26" fill="#005A2B" stroke="#C0C0C0" stroke-width="2" />
    <text x="50" y="46" font-family="sans-serif" font-weight="900" font-size="9" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">LAND</text>
    <text x="50" y="60" font-family="sans-serif" font-weight="900" font-size="9" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">ROVER</text>
  </svg>`,

  porsche: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <path d="M22 18 L78 18 C78 50, 68 76, 50 86 C32 76, 22 50, 22 18 Z" fill="#D4AF37" stroke="#000000" stroke-width="2" />
    <rect x="26" y="24" width="48" height="10" fill="#000000" />
    <text x="50" y="32" font-family="sans-serif" font-weight="bold" font-size="7" fill="#FFFFFF" text-anchor="middle">PORSCHE</text>
    <path d="M50 34 L50 82 M26 50 L74 50" stroke="#900000" stroke-width="3" />
  </svg>`,

  volvo: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="48" cy="52" r="38" fill="none" stroke="#003057" stroke-width="6" />
    <line x1="72" y1="28" x2="88" y2="12" stroke="#003057" stroke-width="6" stroke-linecap="round" />
    <polygon points="78,12 88,12 88,22" fill="#003057" />
    <rect x="14" y="44" width="68" height="16" fill="#003057" />
    <text x="48" y="56" font-family="sans-serif" font-weight="bold" font-size="11" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">VOLVO</text>
  </svg>`,

  changan: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="50" r="42" fill="none" stroke="#004A99" stroke-width="5" />
    <path d="M28 34 L50 70 L72 34 Q50 48 28 34 Z" fill="#004A99" />
  </svg>`,

  geely: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <path d="M20 22 L80 22 C80 54, 70 76, 50 84 C30 76, 20 54, 20 22 Z" fill="#0A3678" stroke="#A0B0C0" stroke-width="3" />
    <rect x="28" y="32" width="20" height="16" fill="#1856AA" stroke="#A0B0C0" stroke-width="1.5" />
    <rect x="52" y="32" width="20" height="16" fill="#102040" stroke="#A0B0C0" stroke-width="1.5" />
    <rect x="28" y="52" width="20" height="16" fill="#102040" stroke="#A0B0C0" stroke-width="1.5" />
    <rect x="52" y="52" width="20" height="16" fill="#1856AA" stroke="#A0B0C0" stroke-width="1.5" />
  </svg>`,

  gac: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="50" r="42" fill="none" stroke="#C00000" stroke-width="5" />
    <path d="M30 50 A20 20 0 0 1 70 50 L50 50 Z" fill="#C00000" />
    <path d="M32 50 C32 64, 68 64, 68 50" fill="none" stroke="#C00000" stroke-width="5" />
  </svg>`,

  chery: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <ellipse cx="50" cy="50" rx="44" ry="28" fill="none" stroke="#B00000" stroke-width="5" />
    <path d="M34 62 L50 32 L66 62 M40 52 L60 52" stroke="#B00000" stroke-width="5" fill="none" stroke-linecap="round" />
  </svg>`,

  haval: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <rect x="8" y="32" width="84" height="36" rx="4" fill="#C41230" />
    <text x="50" y="57" font-family="sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">HAVAL</text>
  </svg>`,

  jetour: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <rect x="8" y="32" width="84" height="36" rx="5" fill="#182B49" />
    <text x="50" y="56" font-family="sans-serif" font-weight="bold" font-size="14" fill="#E6A15C" text-anchor="middle" letter-spacing="2">JETOUR</text>
  </svg>`,

  mg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <polygon points="32,18 68,18 84,34 84,66 68,82 32,82 16,66 16,34" fill="#CC0000" stroke="#FFFFFF" stroke-width="3" />
    <text x="50" y="60" font-family="sans-serif" font-weight="bold" font-size="34" fill="#FFFFFF" text-anchor="middle">MG</text>
  </svg>`,

  byd: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <ellipse cx="50" cy="50" rx="46" ry="28" fill="none" stroke="#C8102E" stroke-width="5" />
    <text x="50" y="58" font-family="sans-serif" font-weight="900" font-size="20" fill="#C8102E" text-anchor="middle" letter-spacing="1">BYD</text>
  </svg>`,

  dongfeng: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="50" r="42" fill="#D32F2F" />
    <path d="M30 40 Q50 30 50 50 Q50 70 70 60 Q50 75 40 60 Z" fill="#FFFFFF" />
    <path d="M70 60 Q50 70 50 50 Q50 30 30 40 Q50 25 60 40 Z" fill="#FFFFFF" />
  </svg>`,

  dfsk: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <rect x="8" y="32" width="84" height="36" rx="6" fill="#003366" />
    <text x="50" y="56" font-family="sans-serif" font-weight="bold" font-size="15" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">DFSK</text>
  </svg>`,

  faw: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <ellipse cx="50" cy="50" rx="46" ry="32" fill="#003A79" />
    <text x="50" y="60" font-family="sans-serif" font-weight="900" font-size="24" fill="#FFFFFF" text-anchor="middle">1</text>
    <path d="M20 50 L40 50 M60 50 L80 50" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" />
  </svg>`,

  jac: `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <ellipse cx="50" cy="50" rx="46" ry="30" fill="none" stroke="#CC0000" stroke-width="4" />
    <text x="50" y="58" font-family="sans-serif" font-weight="900" font-size="22" fill="#CC0000" text-anchor="middle" letter-spacing="2">JAC</text>
  </svg>`,
};
