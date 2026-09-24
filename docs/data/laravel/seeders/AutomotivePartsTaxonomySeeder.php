<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class AutomotivePartsTaxonomySeeder extends Seeder
{
    /**
     * Run the automotive parts taxonomy database seeds.
     * Idempotent and safe to execute repeatedly without duplicating records.
     */
    public function run(): void
    {
        $jsonPath = base_path('docs/data/automotive-parts-taxonomy.json');
        if (!File::exists($jsonPath)) {
            // Fallback check in current directory
            $jsonPath = __DIR__ . '/../../automotive-parts-taxonomy.json';
        }

        if (!File::exists($jsonPath)) {
            $this->command?->error("Taxonomy master JSON not found at: {$jsonPath}");
            return;
        }

        $content = File::get($jsonPath);
        $data = json_decode($content, true);

        if (!isset($data['hierarchy']) || !is_array($data['hierarchy'])) {
            $this->command?->error("Invalid taxonomy JSON structure.");
            return;
        }

        DB::beginTransaction();
        try {
            $catOrder = 1;
            foreach ($data['hierarchy'] as $system) {
                // 1. Insert or update top-level system category
                DB::table('part_categories')->updateOrInsert(
                    ['id' => $system['id']],
                    [
                        'parent_id' => null,
                        'name_ar' => $system['name_ar'],
                        'name_en' => $system['name_en'],
                        'slug' => $system['slug'],
                        'description_ar' => $system['description_ar'] ?? null,
                        'description_en' => $system['description_en'] ?? null,
                        'icon' => $system['icon'] ?? 'Package',
                        'sort_order' => $catOrder++,
                        'is_active' => true,
                        'updated_at' => now(),
                    ]
                );

                // 2. Subcategories
                $subOrder = 1;
                foreach ($system['subcategories'] as $sub) {
                    DB::table('part_categories')->updateOrInsert(
                        ['id' => $sub['id']],
                        [
                            'parent_id' => $system['id'],
                            'name_ar' => $sub['name_ar'],
                            'name_en' => $sub['name_en'],
                            'slug' => $sub['slug'],
                            'description_ar' => $sub['description_ar'] ?? null,
                            'description_en' => $sub['description_en'] ?? null,
                            'icon' => 'Folder',
                            'sort_order' => $subOrder++,
                            'is_active' => true,
                            'updated_at' => now(),
                        ]
                    );

                    // 3. Part Types
                    $ptOrder = 1;
                    foreach ($sub['part_types'] as $pt) {
                        DB::table('part_types')->updateOrInsert(
                            ['id' => $pt['id']],
                            [
                                'category_id' => $sub['id'],
                                'name_ar' => $pt['name_ar'],
                                'name_en' => $pt['name_en'],
                                'slug' => $pt['slug'],
                                'description_ar' => $pt['description_ar'] ?? null,
                                'description_en' => $pt['description_en'] ?? null,
                                'sort_order' => $ptOrder++,
                                'is_active' => true,
                                'updated_at' => now(),
                            ]
                        );

                        // Clear existing aliases and keywords to prevent duplication on rerun
                        DB::table('part_aliases')->where('part_type_id', $pt['id'])->delete();
                        DB::table('part_search_keywords')->where('part_type_id', $pt['id'])->delete();

                        // 4. Arabic Aliases
                        if (!empty($pt['aliases_ar'])) {
                            $aliasRows = [];
                            foreach ($pt['aliases_ar'] as $idx => $alias) {
                                $aliasRows[] = [
                                    'id' => "{$pt['id']}-ar-{$idx}",
                                    'part_type_id' => $pt['id'],
                                    'language' => 'ar',
                                    'alias' => $alias,
                                    'normalized_alias' => $this->normalizeArabic($alias),
                                    'created_at' => now(),
                                ];
                            }
                            DB::table('part_aliases')->insert($aliasRows);
                        }

                        // 5. English Aliases
                        if (!empty($pt['aliases_en'])) {
                            $aliasRowsEn = [];
                            foreach ($pt['aliases_en'] as $idx => $alias) {
                                $aliasRowsEn[] = [
                                    'id' => "{$pt['id']}-en-{$idx}",
                                    'part_type_id' => $pt['id'],
                                    'language' => 'en',
                                    'alias' => $alias,
                                    'normalized_alias' => strtolower(trim($alias)),
                                    'created_at' => now(),
                                ];
                            }
                            DB::table('part_aliases')->insert($aliasRowsEn);
                        }

                        // 6. Keywords
                        if (!empty($pt['search_keywords'])) {
                            $kwRows = [];
                            foreach ($pt['search_keywords'] as $idx => $kw) {
                                $kwRows[] = [
                                    'id' => "{$pt['id']}-kw-{$idx}",
                                    'part_type_id' => $pt['id'],
                                    'keyword' => $kw,
                                    'normalized_keyword' => $this->normalizeArabic($kw),
                                    'language' => preg_match('/[\x{0600}-\x{06FF}]/u', $kw) ? 'ar' : 'en',
                                    'created_at' => now(),
                                ];
                            }
                            DB::table('part_search_keywords')->insert($kwRows);
                        }
                    }
                }
            }

            DB::commit();
            $this->command?->info("Automotive parts taxonomy seeded successfully!");
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->command?->error("Failed to seed taxonomy: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Arabic string normalization matching ALA standard rules.
     */
    protected function normalizeArabic(string $text): string
    {
        $text = trim(mb_strtolower($text, 'UTF-8'));
        // Remove diacritics
        $text = preg_replace('/[\x{064B}-\x{065F}\x{0670}]/u', '', $text);
        // Normalize alifs
        $text = preg_replace('/[أإآٱ]/u', 'ا', $text);
        // Normalize yaa
        $text = preg_replace('/[ىي]/u', 'ي', $text);
        // Normalize taa marbuta
        $text = preg_replace('/ة/u', 'ه', $text);
        // Remove tatweel
        $text = preg_replace('/ـ/u', '', $text);
        // Remove extra symbols and spaces
        $text = preg_replace('/[^\w\s\x{0600}-\x{06FF}]/u', ' ', $text);
        $text = preg_replace('/\s+/u', ' ', $text);
        return trim($text);
    }
}
