<?php

use App\Http\Middleware\JwtFromCookie;
use App\Providers\RepositoryServiceProvider;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withProviders([
        RepositoryServiceProvider::class,
    ])
    ->withMiddleware(function (Middleware $middleware): void {
        // Decrypt cookies so the JwtFromCookie middleware can read them
        $middleware->encryptCookies(except: ['access_token']);

        // Apply JwtFromCookie to all API routes
        $middleware->appendToGroup('api', JwtFromCookie::class);

        // JwtFromCookie MUST run before Authenticate (auth:api) so that it can
        // inject the Authorization header before the guard checks for it.
        $middleware->prependToPriorityList(
            JwtFromCookie::class,
            \Illuminate\Auth\Middleware\Authenticate::class,
        );

        // Register named middleware alias
        $middleware->alias([
            'jwt.cookie' => JwtFromCookie::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Resource not found.'], 404);
            }
        });

        $exceptions->render(function (\DomainException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => $e->getMessage()], 422);
            }
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Resource not found.'], 404);
            }
        });

        $exceptions->render(function (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()
                    ->json(['message' => 'Token has expired.'], 401)
                    ->withCookie(cookie()->forget('access_token'));
            }
        });

        $exceptions->render(function (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()
                    ->json(['message' => 'Token is invalid.'], 401)
                    ->withCookie(cookie()->forget('access_token'));
            }
        });

        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()
                    ->json(['message' => 'Unauthenticated.'], 401)
                    ->withCookie(cookie()->forget('access_token'));
            }
        });
    })->create();
