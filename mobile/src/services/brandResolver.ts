// ============================================================================
// mobile/src/services/brandResolver.ts
// Client-side Brand Logo Normalizer and Metadata Registry for ALA Mobile
// ============================================================================

export interface BrandMeta {
  slug: string;
  nameEn: string;
  nameAr: string;
  country: string;
  accentColor: string;
  license: string;
  isAvailable: boolean;
}

export const BRAND_LICENSE_INFO = 'Public Brand Trademark / Cardog / Wikimedia Commons';

export const BRANDS_REGISTRY: Record<string, BrandMeta> = {
  toyota: { slug: 'toyota', nameEn: 'Toyota', nameAr: 'تويوتا', country: 'Japan', accentColor: '#D32F2F', license: BRAND_LICENSE_INFO, isAvailable: true },
  nissan: { slug: 'nissan', nameEn: 'Nissan', nameAr: 'نيسان', country: 'Japan', accentColor: '#C0C0C8', license: BRAND_LICENSE_INFO, isAvailable: true },
  hyundai: { slug: 'hyundai', nameEn: 'Hyundai', nameAr: 'هيونداي', country: 'South Korea', accentColor: '#002C6C', license: BRAND_LICENSE_INFO, isAvailable: true },
  kia: { slug: 'kia', nameEn: 'Kia', nameAr: 'كيا', country: 'South Korea', accentColor: '#EA0029', license: BRAND_LICENSE_INFO, isAvailable: true },
  honda: { slug: 'honda', nameEn: 'Honda', nameAr: 'هوندا', country: 'Japan', accentColor: '#CC0000', license: BRAND_LICENSE_INFO, isAvailable: true },
  mitsubishi: { slug: 'mitsubishi', nameEn: 'Mitsubishi', nameAr: 'ميتسوبيشي', country: 'Japan', accentColor: '#ED1C24', license: BRAND_LICENSE_INFO, isAvailable: true },
  mazda: { slug: 'mazda', nameEn: 'Mazda', nameAr: 'مازدا', country: 'Japan', accentColor: '#005B94', license: BRAND_LICENSE_INFO, isAvailable: true },
  suzuki: { slug: 'suzuki', nameEn: 'Suzuki', nameAr: 'سوزوكي', country: 'Japan', accentColor: '#E31837', license: BRAND_LICENSE_INFO, isAvailable: true },
  isuzu: { slug: 'isuzu', nameEn: 'Isuzu', nameAr: 'إيسوزو', country: 'Japan', accentColor: '#ED1C24', license: BRAND_LICENSE_INFO, isAvailable: true },
  lexus: { slug: 'lexus', nameEn: 'Lexus', nameAr: 'لكزس', country: 'Japan', accentColor: '#2B2B2B', license: BRAND_LICENSE_INFO, isAvailable: true },
  bmw: { slug: 'bmw', nameEn: 'BMW', nameAr: 'بي إم دبليو', country: 'Germany', accentColor: '#0066B1', license: BRAND_LICENSE_INFO, isAvailable: true },
  'mercedes-benz': { slug: 'mercedes-benz', nameEn: 'Mercedes-Benz', nameAr: 'مرسيدس بنز', country: 'Germany', accentColor: '#7A8B99', license: BRAND_LICENSE_INFO, isAvailable: true },
  audi: { slug: 'audi', nameEn: 'Audi', nameAr: 'أودي', country: 'Germany', accentColor: '#1F1F1F', license: BRAND_LICENSE_INFO, isAvailable: true },
  volkswagen: { slug: 'volkswagen', nameEn: 'Volkswagen', nameAr: 'فولكس فاجن', country: 'Germany', accentColor: '#001E50', license: BRAND_LICENSE_INFO, isAvailable: true },
  ford: { slug: 'ford', nameEn: 'Ford', nameAr: 'فورد', country: 'USA', accentColor: '#003478', license: BRAND_LICENSE_INFO, isAvailable: true },
  chevrolet: { slug: 'chevrolet', nameEn: 'Chevrolet', nameAr: 'شفروليه', country: 'USA', accentColor: '#DAA520', license: BRAND_LICENSE_INFO, isAvailable: true },
  jeep: { slug: 'jeep', nameEn: 'Jeep', nameAr: 'جيب', country: 'USA', accentColor: '#1C2826', license: BRAND_LICENSE_INFO, isAvailable: true },
  'land-rover': { slug: 'land-rover', nameEn: 'Land Rover', nameAr: 'لاند روفر', country: 'UK', accentColor: '#005A2B', license: BRAND_LICENSE_INFO, isAvailable: true },
  porsche: { slug: 'porsche', nameEn: 'Porsche', nameAr: 'بورشه', country: 'Germany', accentColor: '#D4AF37', license: BRAND_LICENSE_INFO, isAvailable: true },
  volvo: { slug: 'volvo', nameEn: 'Volvo', nameAr: 'فولفو', country: 'Sweden', accentColor: '#003057', license: BRAND_LICENSE_INFO, isAvailable: true },
  changan: { slug: 'changan', nameEn: 'Changan', nameAr: 'شانجان', country: 'China', accentColor: '#004A99', license: BRAND_LICENSE_INFO, isAvailable: true },
  geely: { slug: 'geely', nameEn: 'Geely', nameAr: 'جيلي', country: 'China', accentColor: '#0A3678', license: BRAND_LICENSE_INFO, isAvailable: true },
  gac: { slug: 'gac', nameEn: 'GAC', nameAr: 'جي أيه سي', country: 'China', accentColor: '#C00000', license: BRAND_LICENSE_INFO, isAvailable: true },
  chery: { slug: 'chery', nameEn: 'Chery', nameAr: 'شيري', country: 'China', accentColor: '#B00000', license: BRAND_LICENSE_INFO, isAvailable: true },
  haval: { slug: 'haval', nameEn: 'Haval', nameAr: 'هافال', country: 'China', accentColor: '#C41230', license: BRAND_LICENSE_INFO, isAvailable: true },
  jetour: { slug: 'jetour', nameEn: 'Jetour', nameAr: 'جيتور', country: 'China', accentColor: '#182B49', license: BRAND_LICENSE_INFO, isAvailable: true },
  mg: { slug: 'mg', nameEn: 'MG', nameAr: 'إم جي', country: 'UK / China', accentColor: '#CC0000', license: BRAND_LICENSE_INFO, isAvailable: true },
  byd: { slug: 'byd', nameEn: 'BYD', nameAr: 'بي واي دي', country: 'China', accentColor: '#C8102E', license: BRAND_LICENSE_INFO, isAvailable: true },
  dongfeng: { slug: 'dongfeng', nameEn: 'Dongfeng', nameAr: 'دونغ فنغ', country: 'China', accentColor: '#D32F2F', license: BRAND_LICENSE_INFO, isAvailable: true },
  dfsk: { slug: 'dfsk', nameEn: 'DFSK', nameAr: 'دي إف إس كيه', country: 'China', accentColor: '#003366', license: BRAND_LICENSE_INFO, isAvailable: true },
  faw: { slug: 'faw', nameEn: 'FAW', nameAr: 'فاو', country: 'China', accentColor: '#003A79', license: BRAND_LICENSE_INFO, isAvailable: true },
  jac: { slug: 'jac', nameEn: 'JAC', nameAr: 'جاك', country: 'China', accentColor: '#CC0000', license: BRAND_LICENSE_INFO, isAvailable: true },
};

const BRAND_ALIASES: Record<string, string> = {
  // English variations
  'toyota motor corporation': 'toyota',
  'toyota motor': 'toyota',
  'nissan motor co ltd': 'nissan',
  'nissan motor': 'nissan',
  'hyundai motor company': 'hyundai',
  'hyundai motor': 'hyundai',
  'kia motors corporation': 'kia',
  'kia motor': 'kia',
  'kia motors': 'kia',
  'honda motor co ltd': 'honda',
  'honda motor': 'honda',
  'mitsubishi motors': 'mitsubishi',
  'mazda motor corporation': 'mazda',
  'suzuki motor': 'suzuki',
  'isuzu motors': 'isuzu',
  'bmw ag': 'bmw',
  'bayerische motoren werke': 'bmw',
  'mercedes benz ag': 'mercedes-benz',
  'mercedes benz': 'mercedes-benz',
  'mercedes': 'mercedes-benz',
  'daimler ag': 'mercedes-benz',
  'audi ag': 'audi',
  'volkswagen ag': 'volkswagen',
  'vw': 'volkswagen',
  'ford motor company': 'ford',
  'general motors': 'chevrolet',
  'chevy': 'chevrolet',
  'fca us llc': 'jeep',
  'jaguar land rover': 'land-rover',
  'land rover': 'land-rover',
  'porsche ag': 'porsche',
  'volvo car corporation': 'volvo',
  'chongqing changan': 'changan',
  'zhejiang geely': 'geely',
  'guangzhou automobile': 'gac',
  'chery automobile': 'chery',
  'great wall motor': 'haval',
  'jetour auto': 'jetour',
  'saic motor': 'mg',
  'byd company': 'byd',
  'byd auto': 'byd',

  // Arabic variations
  'تويوتا': 'toyota',
  'نيسان': 'nissan',
  'هيونداي': 'hyundai',
  'هونداي': 'hyundai',
  'كيا': 'kia',
  'هوندا': 'honda',
  'ميتسوبيشي': 'mitsubishi',
  'مازدا': 'mazda',
  'سوزوكي': 'suzuki',
  'إيسوزو': 'isuzu',
  'ايسوزو': 'isuzu',
  'لكزس': 'lexus',
  'بي إم دبليو': 'bmw',
  'بي ام دبليو': 'bmw',
  'مرسيدس': 'mercedes-benz',
  'مرسيدس بنز': 'mercedes-benz',
  'أودي': 'audi',
  'فولكس فاجن': 'volkswagen',
  'فولكسواجن': 'volkswagen',
  'فورد': 'ford',
  'شفروليه': 'chevrolet',
  'شيفروليه': 'chevrolet',
  'جيب': 'jeep',
  'لاند روفر': 'land-rover',
  'رنج روفر': 'land-rover',
  'بورشه': 'porsche',
  'بورش': 'porsche',
  'فولفو': 'volvo',
  'شانجان': 'changan',
  'جيلي': 'geely',
  'جي أيه سي': 'gac',
  'شيري': 'chery',
  'هافال': 'haval',
  'جيتور': 'jetour',
  'إم جي': 'mg',
  'ام جي': 'mg',
  'بي واي دي': 'byd',
  'دونغ فنغ': 'dongfeng',
  'دي إف إس كيه': 'dfsk',
  'فاو': 'faw',
  'جاك': 'jac',
};

/**
 * Normalizes input brand name into a standardized key slug
 */
export function normalizeBrandKey(name: string): string {
  if (!name) return '';
  const str = name.trim().toLowerCase();

  // Direct alias check
  if (BRAND_ALIASES[str]) {
    return BRAND_ALIASES[str];
  }

  // Strip common corporate suffixes
  const cleaned = str
    .replace(/\b(motor corporation|motors corporation|automobile co|motor co|holding group|holdings|company|corp|ltd|inc|llc|ag|gmbh|sa)\b/g, '')
    .replace(/[.,\-_()&]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (BRAND_ALIASES[cleaned]) {
    return BRAND_ALIASES[cleaned];
  }

  const slug = cleaned.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (BRANDS_REGISTRY[slug]) {
    return slug;
  }

  // Substring match against known keys
  for (const key of Object.keys(BRANDS_REGISTRY)) {
    if (cleaned.includes(key.replace('-', ' ')) || slug.includes(key)) {
      return key;
    }
  }

  return slug;
}

/**
 * Resolves brand metadata and availability for a make
 */
export function resolveBrand(nameEn: string, nameAr?: string): BrandMeta {
  const slug = normalizeBrandKey(nameEn) || (nameAr ? normalizeBrandKey(nameAr) : '');
  const found = BRANDS_REGISTRY[slug];

  if (found) {
    return found;
  }

  return {
    slug: slug || 'unknown',
    nameEn: nameEn,
    nameAr: nameAr || nameEn,
    country: 'Global',
    accentColor: '#4A5568',
    license: BRAND_LICENSE_INFO,
    isAvailable: false,
  };
}
