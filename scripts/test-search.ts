import { searchTaxonomy } from '../services/taxonomySearch.ts';

const queries = [
  'تيل بريك',
  'مساعدات',
  'دركسون',
  'دينمو',
  'سلف',
  'بوجي',
  'Brake Pad',
  'Alternator',
  'هوبات',
  'سيفون',
  'طرمبة بنزين',
  'كمبروسر',
  'رديتر',
  'كلتش',
  'عكس'
];

console.log('--- Testing Master Taxonomy Search ---');
let passed = 0;
for (const q of queries) {
  const res = searchTaxonomy(q, 3);
  if (res.length > 0) {
    passed++;
    console.log(`[PASS] "${q}" -> ${res[0].partType.nameAr} (${res[0].partType.nameEn}) [Matched: ${res[0].matchedOn} = "${res[0].matchValue}", Score: ${res[0].score}]`);
  } else {
    console.log(`[FAIL] "${q}" -> No match found`);
  }
}

console.log(`\nResults: ${passed}/${queries.length} queries matched successfully!`);
