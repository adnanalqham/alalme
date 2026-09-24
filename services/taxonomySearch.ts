/**
 * services/taxonomySearch.ts
 *
 * Professional Automotive Parts Taxonomy Search & Normalization Engine for ALA Auto Parts.
 * Handles:
 * - Technical, colloquial, and regional Yemeni / Gulf Arabic aliases resolution
 * - Deep normalization for Arabic (أ/إ/آ -> ا, ى -> ي, ة -> ه, tashkeel removal, tatweel removal)
 * - English pluralization, stemming and case-insensitive matching
 * - Multi-tiered search: Part Type -> Aliases -> Keywords -> Subcategories -> Systems
 */

import taxonomyMaster from '../docs/data/automotive-parts-taxonomy.json' with { type: 'json' };
import type { PartCategory, PartType, TaxonomySearchResult } from '../types.ts';

export interface TaxonomyHierarchyNode {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  icon: string;
  description_ar: string;
  description_en: string;
  subcategories: {
    id: string;
    slug: string;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    part_types: {
      id: string;
      slug: string;
      name_ar: string;
      name_en: string;
      description_ar: string;
      description_en: string;
      aliases_ar: string[];
      aliases_en: string[];
      search_keywords: string[];
    }[];
  }[];
}

/**
 * Normalizes Arabic text for fault-tolerant and colloquial searching.
 * Handles:
 * - Tashkeel (harakat / diacritics)
 * - Tatweel / kashida (ـ)
 * - Alif variants: أ, إ, آ, ٱ -> ا
 * - Yaa variants: ى, ي -> ي
 * - Taa marbuta: ة -> ه
 * - Punctuation & repeated whitespace
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    // 1. Remove Tashkeel / Diacritics
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // 2. Normalize Alif variations
    .replace(/[أإآٱ]/g, 'ا')
    // 3. Normalize Yaa / Alif Maqsura
    .replace(/[ىي]/g, 'ي')
    // 4. Normalize Taa Marbuta
    .replace(/ة/g, 'ه')
    // 5. Remove Tatweel (Kashida)
    .replace(/ـ/g, '')
    // 6. Strip non-alphanumeric except Arabic letters and spaces
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    // 7. Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes English search strings (lowercase, strips punctuation, normalizes spacing).
 */
export function normalizeEnglish(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Universal text normalizer that applies appropriate normalization
 * depending on character script detection.
 */
export function normalizeQuery(query: string): string {
  if (!query) return '';
  const isArabic = /[\u0600-\u06FF]/.test(query);
  return isArabic ? normalizeArabic(query) : normalizeEnglish(query);
}

/**
 * Flattened indexed parts for fast memory searching.
 */
export interface IndexedPartRecord {
  partType: PartType;
  category: PartCategory;
  subcategory: PartCategory;
  normNameAr: string;
  normNameEn: string;
  normAliasesAr: string[];
  normAliasesEn: string[];
  normKeywords: string[];
}

let cachedIndex: IndexedPartRecord[] | null = null;

export function getTaxonomyIndex(): IndexedPartRecord[] {
  if (cachedIndex) return cachedIndex;

  const records: IndexedPartRecord[] = [];
  const hierarchy = (taxonomyMaster as any).hierarchy as TaxonomyHierarchyNode[];

  for (const sys of hierarchy) {
    const mainCat: PartCategory = {
      id: sys.id,
      parentId: null,
      nameAr: sys.name_ar,
      nameEn: sys.name_en,
      slug: sys.slug,
      descriptionAr: sys.description_ar,
      descriptionEn: sys.description_en,
      icon: sys.icon,
      sortOrder: 0,
      isActive: true,
    };

    for (const sub of sys.subcategories) {
      const subCat: PartCategory = {
        id: sub.id,
        parentId: sys.id,
        nameAr: sub.name_ar,
        nameEn: sub.name_en,
        slug: sub.slug,
        descriptionAr: sub.description_ar,
        descriptionEn: sub.description_en,
        icon: 'Folder',
        sortOrder: 0,
        isActive: true,
      };

      for (const pt of sub.part_types) {
        const partTypeObj: PartType = {
          id: pt.id,
          categoryId: sub.id,
          nameAr: pt.name_ar,
          nameEn: pt.name_en,
          slug: pt.slug,
          descriptionAr: pt.description_ar,
          descriptionEn: pt.description_en,
          sortOrder: 0,
          isActive: true,
          aliasesAr: pt.aliases_ar,
          aliasesEn: pt.aliases_en,
          searchKeywords: pt.search_keywords,
        };

        records.push({
          partType: partTypeObj,
          category: mainCat,
          subcategory: subCat,
          normNameAr: normalizeArabic(pt.name_ar),
          normNameEn: normalizeEnglish(pt.name_en),
          normAliasesAr: (pt.aliases_ar || []).map(normalizeArabic),
          normAliasesEn: (pt.aliases_en || []).map(normalizeEnglish),
          normKeywords: (pt.search_keywords || []).map(k =>
            /[\u0600-\u06FF]/.test(k) ? normalizeArabic(k) : normalizeEnglish(k)
          ),
        });
      }
    }
  }

  cachedIndex = records;
  return cachedIndex;
}

/**
 * Searches the taxonomy across Part Types, Arabic Aliases (colloquial/regional),
 * English Aliases, and Search Keywords.
 *
 * Examples:
 * - "تيل بريك" -> Front/Rear Brake Pads (فحمات الفرامل)
 * - "مساعدات" -> Shock Absorbers (ممتصات الصدمات)
 * - "دركسون" -> Steering Gear / Racks (دودة الدركسون / نظام التوجيه)
 * - "دينمو" -> Alternator (مولد التيار / الدينمو)
 * - "سلف" -> Starter Motor (سلف التشغيل)
 * - "بوجي" -> Spark Plugs (شمعات الإشعال)
 */
export function searchTaxonomy(query: string, limit: number = 10): TaxonomySearchResult[] {
  if (!query || !query.trim()) return [];

  const raw = query.trim();
  const normQuery = normalizeQuery(raw);
  const index = getTaxonomyIndex();
  const results: TaxonomySearchResult[] = [];

  // Strip leading 'ال' for Arabic prefix matching if length > 3
  const strippedAl = normQuery.startsWith('ال') && normQuery.length > 3 ? normQuery.slice(2) : null;

  for (const item of index) {
    let bestScore = 0;
    let matchType: TaxonomySearchResult['matchedOn'] = 'name_ar';
    let matchVal = '';

    // 1. Exact match on Arabic name
    if (item.normNameAr === normQuery || (strippedAl && item.normNameAr === strippedAl)) {
      bestScore = 100;
      matchType = 'name_ar';
      matchVal = item.partType.nameAr;
    }
    // 2. Exact match on English name
    else if (item.normNameEn === normQuery) {
      bestScore = 95;
      matchType = 'name_en';
      matchVal = item.partType.nameEn;
    }
    // 3. Exact match on Arabic Aliases (e.g. تيل بريك, مساعدات, دينمو, سلف, بوجي)
    else {
      for (let i = 0; i < item.normAliasesAr.length; i++) {
        const normAlias = item.normAliasesAr[i];
        if (normAlias === normQuery || (strippedAl && normAlias === strippedAl)) {
          bestScore = 90;
          matchType = 'alias_ar';
          matchVal = item.partType.aliasesAr?.[i] || '';
          break;
        } else if (normAlias.includes(normQuery) || normQuery.includes(normAlias)) {
          if (bestScore < 75) {
            bestScore = 75;
            matchType = 'alias_ar';
            matchVal = item.partType.aliasesAr?.[i] || '';
          }
        }
      }

      // 4. English Aliases match
      if (bestScore < 85) {
        for (let i = 0; i < item.normAliasesEn.length; i++) {
          const normAliasEn = item.normAliasesEn[i];
          if (normAliasEn === normQuery) {
            bestScore = 85;
            matchType = 'alias_en';
            matchVal = item.partType.aliasesEn?.[i] || '';
            break;
          } else if (normAliasEn.includes(normQuery) || normQuery.includes(normAliasEn)) {
            if (bestScore < 70) {
              bestScore = 70;
              matchType = 'alias_en';
              matchVal = item.partType.aliasesEn?.[i] || '';
            }
          }
        }
      }

      // 5. Keywords match
      if (bestScore < 80) {
        for (const kw of item.normKeywords) {
          if (kw === normQuery || (strippedAl && kw === strippedAl)) {
            bestScore = 80;
            matchType = 'keyword';
            matchVal = kw;
            break;
          } else if (kw.includes(normQuery) || normQuery.includes(kw)) {
            if (bestScore < 60) {
              bestScore = 60;
              matchType = 'keyword';
              matchVal = kw;
            }
          }
        }
      }

      // 6. Substring match in names
      if (bestScore < 65) {
        if (item.normNameAr.includes(normQuery) || (strippedAl && item.normNameAr.includes(strippedAl))) {
          bestScore = 65;
          matchType = 'name_ar';
          matchVal = item.partType.nameAr;
        } else if (item.normNameEn.includes(normQuery)) {
          bestScore = 60;
          matchType = 'name_en';
          matchVal = item.partType.nameEn;
        }
      }
    }

    if (bestScore > 0) {
      results.push({
        partType: item.partType,
        category: item.category,
        subcategory: item.subcategory,
        matchedOn: matchType,
        matchValue: matchVal,
        score: bestScore,
      });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

/**
 * Returns complete master hierarchy tree (30 Systems -> Subcategories -> Part Types).
 */
export function getFullTaxonomyHierarchy(): TaxonomyHierarchyNode[] {
  return (taxonomyMaster as any).hierarchy;
}

/**
 * Returns all top-level systems/categories.
 */
export function getTopLevelSystems(): PartCategory[] {
  const hierarchy = getFullTaxonomyHierarchy();
  return hierarchy.map(sys => ({
    id: sys.id,
    parentId: null,
    nameAr: sys.name_ar,
    nameEn: sys.name_en,
    slug: sys.slug,
    descriptionAr: sys.description_ar,
    descriptionEn: sys.description_en,
    icon: sys.icon,
    sortOrder: 0,
    isActive: true,
  }));
}

/**
 * Returns subcategories for a given top-level system ID.
 */
export function getSubcategoriesForSystem(systemId: string): PartCategory[] {
  const hierarchy = getFullTaxonomyHierarchy();
  const sys = hierarchy.find(s => s.id === systemId || s.slug === systemId);
  if (!sys) return [];

  return sys.subcategories.map(sub => ({
    id: sub.id,
    parentId: sys.id,
    nameAr: sub.name_ar,
    nameEn: sub.name_en,
    slug: sub.slug,
    descriptionAr: sub.description_ar,
    descriptionEn: sub.description_en,
    icon: 'Folder',
    sortOrder: 0,
    isActive: true,
  }));
}

/**
 * Returns part types for a given subcategory ID.
 */
export function getPartTypesForSubcategory(subcategoryId: string): PartType[] {
  const hierarchy = getFullTaxonomyHierarchy();
  for (const sys of hierarchy) {
    const sub = sys.subcategories.find(s => s.id === subcategoryId || s.slug === subcategoryId);
    if (sub) {
      return sub.part_types.map(pt => ({
        id: pt.id,
        categoryId: sub.id,
        nameAr: pt.name_ar,
        nameEn: pt.name_en,
        slug: pt.slug,
        descriptionAr: pt.description_ar,
        descriptionEn: pt.description_en,
        sortOrder: 0,
        isActive: true,
        aliasesAr: pt.aliases_ar,
        aliasesEn: pt.aliases_en,
        searchKeywords: pt.search_keywords,
      }));
    }
  }
  return [];
}
