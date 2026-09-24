<?php

return [
    /*
    |--------------------------------------------------------------------------
    | NHTSA vPIC API Configuration
    |--------------------------------------------------------------------------
    */
    'nhtsa' => [
        'base_url' => env('NHTSA_VPIC_URL', 'https://vpic.nhtsa.dot.gov/api'),
        'timeout' => env('NHTSA_TIMEOUT', 10), // seconds
        'retry_attempts' => 2,
        'retry_sleep' => 500, // milliseconds
        'rate_limit_per_minute' => 60,
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Settings (Configurable TTL in seconds)
    |--------------------------------------------------------------------------
    | Default: 7 days (604800 seconds) for catalog reference data
    */
    'cache' => [
        'makes_ttl' => env('VEHICLE_CACHE_MAKES_TTL', 604800),
        'models_ttl' => env('VEHICLE_CACHE_MODELS_TTL', 604800),
        'years_ttl' => env('VEHICLE_CACHE_YEARS_TTL', 604800),
        'specs_ttl' => env('VEHICLE_CACHE_SPECS_TTL', 604800),
        'search_ttl' => env('VEHICLE_CACHE_SEARCH_TTL', 86400),
    ],

    /*
    |--------------------------------------------------------------------------
    | Fallback & Defaults
    |--------------------------------------------------------------------------
    */
    'enable_database_first' => true,
    'allow_manual_vehicles' => true,
    'default_country' => 'YE',
];
