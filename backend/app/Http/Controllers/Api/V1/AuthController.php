<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    private const COOKIE_NAME    = 'access_token';
    private const COOKIE_MINUTES = 60 * 24; // 24 hours — matches JWT TTL

    // -------------------------------------------------------
    // Public
    // -------------------------------------------------------

    /**
     * POST /api/v1/auth/login
     * Authenticates the admin, issues a JWT, and sets it in an
     * HTTP-only cookie.  The token is NEVER returned in the body.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! $token = JWTAuth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        return $this->respondWithCookie($token);
    }

    // -------------------------------------------------------
    // Protected (require valid JWT cookie)
    // -------------------------------------------------------

    /**
     * POST /api/v1/admin/auth/logout
     * Invalidates the JWT on the server and clears the cookie.
     */
    public function logout(): JsonResponse
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()
            ->json(['message' => 'Logged out successfully.'])
            ->withCookie($this->expiredCookie());
    }

    /**
     * POST /api/v1/admin/auth/refresh
     * Issues a new JWT (rotation) and resets the cookie TTL.
     */
    public function refresh(): JsonResponse
    {
        $newToken = JWTAuth::refresh(JWTAuth::getToken());

        return $this->respondWithCookie($newToken);
    }

    /**
     * GET /api/v1/admin/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
        ]);
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    private function respondWithCookie(string $token): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user   = JWTAuth::setToken($token)->toUser();
        $cookie = $this->buildCookie($token);

        return response()
            ->json([
                'message' => 'Authenticated.',
                'user'    => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                ],
            ])
            ->withCookie($cookie);
    }

    private function buildCookie(string $token): Cookie
    {
        // In dev (localhost HTTP), we cannot use SameSite=None (requires Secure=true + HTTPS)
        // So we use SameSite=Lax + domain=localhost to work cross-port (3001 → 8000)
        // In production (HTTPS), use SameSite=Lax + Secure=true
        $isDev = !app()->isProduction();

        return cookie(
            name:     self::COOKIE_NAME,
            value:    $token,
            minutes:  self::COOKIE_MINUTES,
            path:     '/',
            domain:   $isDev ? 'localhost' : null,  // 'localhost' allows cross-port sharing
            secure:   !$isDev,  // false in dev (HTTP), true in prod (HTTPS)
            httpOnly: true,
            raw:      false,
            sameSite: 'Lax',
        );
    }

    private function expiredCookie(): Cookie
    {
        $isDev = !app()->isProduction();

        return cookie(
            name:     self::COOKIE_NAME,
            value:    '',
            minutes:  -1,
            path:     '/',
            domain:   $isDev ? 'localhost' : null,
            secure:   !$isDev,
            httpOnly: true,
            raw:      false,
            sameSite: 'Lax',
        );
    }
}
