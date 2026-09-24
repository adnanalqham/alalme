<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleAlias extends Model
{
    protected $table = 'vehicle_aliases';

    public $timestamps = false;

    protected $fillable = [
        'entity_type',
        'entity_id',
        'language',
        'alias',
        'normalized_alias',
        'created_at',
    ];

    public static function normalize(string $text): string
    {
        // Lowercase, remove special characters and diacritics
        $t = mb_strtolower(trim($text), 'UTF-8');
        // Remove Arabic diacritics
        $t = preg_replace('/[\x{064B}-\x{065F}\x{0670}]/u', '', $t);
        // Normalize Arabic letters
        $t = str_replace(['أ', 'إ', 'آ', 'ٱ'], 'ا', $t);
        $t = str_replace(['ى'], 'ي', $t);
        $t = str_replace(['ة'], 'ه', $t);
        // Remove symbols
        $t = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $t);
        return trim(preg_replace('/\s+/', ' ', $t));
    }
}
