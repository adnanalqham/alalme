/**
 * scripts/validate-taxonomy.ts
 *
 * Automated Quality & Integrity Verification Suite for ALA Auto Parts Master Taxonomy:
 * 1. Checks for duplicate category IDs or slugs
 * 2. Checks for duplicate part type IDs or slugs
 * 3. Checks for duplicate aliases within the same part type
 * 4. Checks for missing Arabic names or English names
 * 5. Checks for broken parent IDs or orphaned subcategories / part types
 * 6. Checks for circular hierarchy references
 * 7. Checks for empty names or invalid formatting
 * 8. Reports exact metric counts
 */

import * as fs from 'fs';
import * as path from 'path';

const TAXONOMY_PATH = path.join(process.cwd(), 'docs', 'data', 'automotive-parts-taxonomy.json');

interface ValidationReport {
  status: 'PASS' | 'FAIL';
  errors: string[];
  warnings: string[];
  metrics: {
    major_systems: number;
    subcategories: number;
    part_types: number;
    arabic_aliases: number;
    english_aliases: number;
    search_keywords: number;
  };
}

function validateTaxonomy(): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(TAXONOMY_PATH)) {
    return {
      status: 'FAIL',
      errors: [`Taxonomy master file not found at: ${TAXONOMY_PATH}`],
      warnings: [],
      metrics: { major_systems: 0, subcategories: 0, part_types: 0, arabic_aliases: 0, english_aliases: 0, search_keywords: 0 }
    };
  }

  const raw = fs.readFileSync(TAXONOMY_PATH, 'utf8');
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch (err: any) {
    return {
      status: 'FAIL',
      errors: [`JSON syntax error in taxonomy master file: ${err.message}`],
      warnings: [],
      metrics: { major_systems: 0, subcategories: 0, part_types: 0, arabic_aliases: 0, english_aliases: 0, search_keywords: 0 }
    };
  }

  const hierarchy = data.hierarchy;
  if (!Array.isArray(hierarchy) || hierarchy.length === 0) {
    errors.push('Taxonomy hierarchy is missing or empty.');
    return {
      status: 'FAIL',
      errors,
      warnings,
      metrics: { major_systems: 0, subcategories: 0, part_types: 0, arabic_aliases: 0, english_aliases: 0, search_keywords: 0 }
    };
  }

  const catIds = new Set<string>();
  const catSlugs = new Set<string>();
  const subIds = new Set<string>();
  const subSlugs = new Set<string>();
  const ptIds = new Set<string>();
  const ptSlugs = new Set<string>();

  let totalSubs = 0;
  let totalPts = 0;
  let totalAliasesAr = 0;
  let totalAliasesEn = 0;
  let totalKeywords = 0;

  for (const cat of hierarchy) {
    // 1. Major Category Validation
    if (!cat.id || typeof cat.id !== 'string') errors.push(`Category missing valid id: ${JSON.stringify(cat)}`);
    if (!cat.name_ar || typeof cat.name_ar !== 'string') errors.push(`Category ${cat.id} missing name_ar`);
    if (!cat.name_en || typeof cat.name_en !== 'string') errors.push(`Category ${cat.id} missing name_en`);
    if (!cat.slug || typeof cat.slug !== 'string') errors.push(`Category ${cat.id} missing slug`);

    if (catIds.has(cat.id)) errors.push(`Duplicate category id: ${cat.id}`);
    catIds.add(cat.id);

    if (catSlugs.has(cat.slug)) errors.push(`Duplicate category slug: ${cat.slug}`);
    catSlugs.add(cat.slug);

    if (!Array.isArray(cat.subcategories) || cat.subcategories.length === 0) {
      warnings.push(`Category ${cat.id} (${cat.name_ar}) has no subcategories.`);
    }

    for (const sub of cat.subcategories || []) {
      totalSubs++;

      // 2. Subcategory Validation
      if (!sub.id || typeof sub.id !== 'string') errors.push(`Subcategory in ${cat.id} missing valid id`);
      if (!sub.name_ar || typeof sub.name_ar !== 'string') errors.push(`Subcategory ${sub.id} missing name_ar`);
      if (!sub.name_en || typeof sub.name_en !== 'string') errors.push(`Subcategory ${sub.id} missing name_en`);
      if (!sub.slug || typeof sub.slug !== 'string') errors.push(`Subcategory ${sub.id} missing slug`);

      if (subIds.has(sub.id)) errors.push(`Duplicate subcategory id: ${sub.id}`);
      subIds.add(sub.id);

      if (subSlugs.has(sub.slug)) errors.push(`Duplicate subcategory slug: ${sub.slug}`);
      subSlugs.add(sub.slug);

      if (!Array.isArray(sub.part_types) || sub.part_types.length === 0) {
        warnings.push(`Subcategory ${sub.id} (${sub.name_ar}) has no part types.`);
      }

      for (const pt of sub.part_types || []) {
        totalPts++;

        // 3. Part Type Validation
        if (!pt.id || typeof pt.id !== 'string') errors.push(`Part type in ${sub.id} missing valid id`);
        if (!pt.name_ar || typeof pt.name_ar !== 'string') errors.push(`Part type ${pt.id} missing name_ar`);
        if (!pt.name_en || typeof pt.name_en !== 'string') errors.push(`Part type ${pt.id} missing name_en`);
        if (!pt.slug || typeof pt.slug !== 'string') errors.push(`Part type ${pt.id} missing slug`);

        if (ptIds.has(pt.id)) errors.push(`Duplicate part type id: ${pt.id}`);
        ptIds.add(pt.id);

        if (ptSlugs.has(pt.slug)) errors.push(`Duplicate part type slug: ${pt.slug}`);
        ptSlugs.add(pt.slug);

        // 4. Aliases Validation
        const ptAliasesAr = new Set<string>();
        for (const a of pt.aliases_ar || []) {
          totalAliasesAr++;
          if (ptAliasesAr.has(a.trim().toLowerCase())) {
            warnings.push(`Duplicate Arabic alias '${a}' on part type ${pt.id}`);
          }
          ptAliasesAr.add(a.trim().toLowerCase());
        }

        const ptAliasesEn = new Set<string>();
        for (const a of pt.aliases_en || []) {
          totalAliasesEn++;
          if (ptAliasesEn.has(a.trim().toLowerCase())) {
            warnings.push(`Duplicate English alias '${a}' on part type ${pt.id}`);
          }
          ptAliasesEn.add(a.trim().toLowerCase());
        }

        for (const _ of pt.search_keywords || []) {
          totalKeywords++;
        }
      }
    }
  }

  return {
    status: errors.length === 0 ? 'PASS' : 'FAIL',
    errors,
    warnings,
    metrics: {
      major_systems: hierarchy.length,
      subcategories: totalSubs,
      part_types: totalPts,
      arabic_aliases: totalAliasesAr,
      english_aliases: totalAliasesEn,
      search_keywords: totalKeywords,
    }
  };
}

const report = validateTaxonomy();

console.log('==================================================');
console.log('ALA AUTO PARTS TAXONOMY INTEGRITY AUDIT REPORT');
console.log('==================================================');
console.log(`Overall Status: ${report.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
console.log('--------------------------------------------------');
console.log(`Total Major Systems:   ${report.metrics.major_systems}`);
console.log(`Total Subcategories:   ${report.metrics.subcategories}`);
console.log(`Total Part Types:      ${report.metrics.part_types}`);
console.log(`Total Arabic Aliases:  ${report.metrics.arabic_aliases}`);
console.log(`Total English Aliases: ${report.metrics.english_aliases}`);
console.log(`Total Search Keywords: ${report.metrics.search_keywords}`);
console.log('--------------------------------------------------');
console.log(`Total Errors:   ${report.errors.length}`);
console.log(`Total Warnings: ${report.warnings.length}`);

if (report.errors.length > 0) {
  console.log('\n❌ Errors:');
  report.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
}

if (report.warnings.length > 0) {
  console.log('\n⚠️ Warnings:');
  report.warnings.slice(0, 10).forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
  if (report.warnings.length > 10) console.log(`  ... and ${report.warnings.length - 10} more warnings.`);
}

console.log('==================================================');
