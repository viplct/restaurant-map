<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Reads the JWT from the HTTP-only cookie and puts it into the
 * Authorization header so tymon/jwt-auth can pick it up normally.
 *
 * Flow: Cookie(access_token) → Authorization: Bearer <token>
 */
class JwtFromCookie
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->hasHeader('Authorization')) {
            $token = $this->extractFromCookieHeader($request, 'access_token');

            if ($token) {
                $request->headers->set('Authorization', "Bearer {$token}");
            }
        }

        return $next($request);
    }

    private function extractFromCookieHeader(Request $request, string $name): ?string
    {
        $header = $request->header('Cookie', '');
        $found = null;

        // Get the LAST occurrence (newest cookie) if there are duplicates
        foreach (explode(';', $header) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, null);

            if (trim($key) === $name && $value !== null) {
                $found = urldecode(trim($value));
            }
        }

        return $found;
    }
}
