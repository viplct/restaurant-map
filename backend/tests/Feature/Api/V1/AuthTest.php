<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_and_receives_http_only_cookie(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password123')]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'user'])
            ->assertCookie('access_token');

        // Token must NOT be in the response body (security)
        $this->assertArrayNotHasKey('token', $response->json());
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create();

        $this->postJson('/api/v1/auth/login', [
            'email'    => 'wrong@example.com',
            'password' => 'wrongpass',
        ])->assertStatus(401);
    }

    public function test_login_requires_email_and_password(): void
    {
        $this->postJson('/api/v1/auth/login', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_authenticated_user_can_logout_and_cookie_is_cleared(): void
    {
        $user  = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $response = $this->withHeader('Cookie', "access_token={$token}")
            ->postJson('/api/v1/admin/auth/logout');

        $response->assertOk()
            ->assertJson(['message' => 'Logged out successfully.']);

        // Cookie should be cleared
        $cookie = $response->getCookie('access_token', decrypt: false);
        $this->assertTrue($cookie === null || $cookie->getValue() === '');
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user  = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $this->withHeader('Cookie', "access_token={$token}")
            ->getJson('/api/v1/admin/auth/me')
            ->assertOk()
            ->assertJsonFragment(['email' => $user->email, 'name' => $user->name]);
    }

    public function test_refresh_issues_new_token_cookie(): void
    {
        $user  = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $response = $this->withHeader('Cookie', "access_token={$token}")
            ->postJson('/api/v1/admin/auth/refresh');

        $response->assertOk()
            ->assertCookie('access_token');

        // New token should be different from old one
        $newToken = $response->getCookie('access_token', decrypt: false)?->getValue();
        $this->assertNotNull($newToken);
        $this->assertNotEquals($token, $newToken);
    }

    public function test_protected_routes_require_authentication(): void
    {
        $this->getJson('/api/v1/admin/dashboard')->assertUnauthorized();
        $this->getJson('/api/v1/admin/auth/me')->assertUnauthorized();
        $this->postJson('/api/v1/admin/auth/logout')->assertUnauthorized();
    }

    public function test_invalid_token_returns_401(): void
    {
        $this->withHeader('Cookie', 'access_token=invalid-token-string')
            ->getJson('/api/v1/admin/auth/me')
            ->assertUnauthorized();
    }
}
