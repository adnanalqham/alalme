<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'clerk' => [
        'publishable_key' => env('CLERK_PUBLISHABLE_KEY', ''),
        'secret_key' => env('CLERK_SECRET_KEY', ''),
        'jwks_url' => env('CLERK_JWKS_URL', ''),
        // Derived from publishable key: pk_test_XXX -> https://XXX.clerk.accounts.dev/.well-known/jwks.json
    ],

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

];
