<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | supports_credentials MUST be true when the frontend sends cookies
    | (withCredentials: true in Axios).  When credentials are enabled,
    | allowed_origins may NOT be ['*'] — explicit origins are required.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',   // public frontend
        'http://localhost:3001',   // admin frontend
        env('FRONTEND_URL', ''),
        env('ADMIN_URL', ''),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
