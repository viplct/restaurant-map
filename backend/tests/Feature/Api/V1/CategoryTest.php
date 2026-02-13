<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdmin(): self
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        return $this->withHeader('Cookie', "access_token={$token}");
    }

    // ==================== Public Endpoints ====================

    public function test_public_can_list_active_categories(): void
    {
        Category::factory()->count(3)->create(['is_active' => true]);
        Category::factory()->count(2)->inactive()->create();

        $response = $this->getJson('/api/v1/categories');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'icon', 'color', 'is_active']
                ]
            ]);
    }

    public function test_public_can_get_single_category(): void
    {
        $category = Category::factory()->create();

        $this->getJson("/api/v1/categories/{$category->id}")
            ->assertOk()
            ->assertJsonFragment([
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ]);
    }

    public function test_inactive_categories_not_shown_in_list(): void
    {
        Category::factory()->count(3)->create(['is_active' => true]);
        Category::factory()->count(2)->inactive()->create();

        $response = $this->getJson('/api/v1/categories');

        // Should only return active categories
        $response->assertOk()
            ->assertJsonCount(3, 'data');

        // Verify all returned categories are active
        foreach ($response->json('data') as $category) {
            $this->assertTrue($category['is_active']);
        }
    }

    // ==================== Admin CRUD ====================

    public function test_admin_can_paginate_categories(): void
    {
        Category::factory()->count(20)->create();

        $this->actingAsAdmin()
            ->getJson('/api/v1/admin/categories?per_page=10')
            ->assertOk()
            ->assertJsonStructure(['data', 'links', 'meta'])
            ->assertJsonPath('meta.per_page', 10);
    }

    public function test_admin_can_create_category(): void
    {
        $data = [
            'name' => 'Mediterranean',
            'icon' => '🫒',
            'color' => '#38A169',
            'description' => 'Fresh Mediterranean cuisine',
            'sort_order' => 5,
            'is_active' => true,
        ];

        $response = $this->actingAsAdmin()
            ->postJson('/api/v1/admin/categories', $data);

        $response->assertCreated()
            ->assertJsonFragment(['name' => 'Mediterranean', 'slug' => 'mediterranean']);

        $this->assertDatabaseHas('categories', ['name' => 'Mediterranean']);
    }

    public function test_admin_cannot_create_duplicate_category_name(): void
    {
        $existing = Category::factory()->create(['name' => 'Vietnamese']);

        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/categories', [
                'name' => 'Vietnamese',
                'icon' => '🍜',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_admin_can_update_category(): void
    {
        $category = Category::factory()->create(['name' => 'Old Name']);

        $this->actingAsAdmin()
            ->putJson("/api/v1/admin/categories/{$category->id}", [
                'name' => 'New Name',
                'icon' => '🆕',
            ])
            ->assertOk()
            ->assertJsonFragment(['name' => 'New Name']);

        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'New Name']);
    }

    public function test_admin_can_delete_category_without_restaurants(): void
    {
        $category = Category::factory()->create();

        $this->actingAsAdmin()
            ->deleteJson("/api/v1/admin/categories/{$category->id}")
            ->assertOk()
            ->assertJson(['message' => 'Category deleted.']);

        $this->assertSoftDeleted('categories', ['id' => $category->id]);
    }

    public function test_admin_cannot_delete_category_with_restaurants(): void
    {
        $category = Category::factory()->create();
        Restaurant::factory()->create(['category_id' => $category->id]);

        $this->actingAsAdmin()
            ->deleteJson("/api/v1/admin/categories/{$category->id}")
            ->assertStatus(422);

        $this->assertDatabaseHas('categories', ['id' => $category->id, 'deleted_at' => null]);
    }

    public function test_guest_cannot_access_admin_categories(): void
    {
        $category = Category::factory()->create();

        $this->getJson('/api/v1/admin/categories')->assertUnauthorized();
        $this->postJson('/api/v1/admin/categories', [])->assertUnauthorized();
        $this->putJson("/api/v1/admin/categories/{$category->id}", [])->assertUnauthorized();
        $this->deleteJson("/api/v1/admin/categories/{$category->id}")->assertUnauthorized();
    }

    public function test_category_requires_name(): void
    {
        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/categories', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }
}
