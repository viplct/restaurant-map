<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\Restaurant;
use App\Models\RestaurantImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class RestaurantTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdmin(): self
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        return $this->withHeader('Cookie', "access_token={$token}");
    }

    // ==================== Public Endpoints ====================

    public function test_public_can_get_restaurant_list(): void
    {
        Restaurant::factory()->count(3)->create(['is_active' => true]);

        $response = $this->getJson('/api/v1/restaurants');

        $response->assertOk()
            ->assertJsonStructure(['data', 'links', 'meta'])
            ->assertJsonCount(3, 'data');
    }

    public function test_public_can_filter_restaurants_by_category(): void
    {
        $category1 = Category::factory()->create();
        $category2 = Category::factory()->create();

        Restaurant::factory()->count(2)->create(['category_id' => $category1->id, 'is_active' => true]);
        Restaurant::factory()->count(3)->create(['category_id' => $category2->id, 'is_active' => true]);

        $response = $this->getJson("/api/v1/restaurants?category_id[]={$category1->id}");

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_public_can_get_map_markers(): void
    {
        Restaurant::factory()->count(5)->create(['is_active' => true]);

        $response = $this->getJson('/api/v1/restaurants/map');

        $response->assertOk()
            ->assertJsonCount(5, 'data');

        // Ensure only essential fields are returned for map
        $first = $response->json('data.0');
        $this->assertArrayHasKey('latitude', $first);
        $this->assertArrayHasKey('longitude', $first);
        $this->assertArrayHasKey('id', $first);
        $this->assertArrayHasKey('name', $first);
    }

    public function test_map_markers_can_be_filtered_by_bounds(): void
    {
        // Restaurant inside bounds
        Restaurant::factory()->create([
            'latitude' => 10.7756,
            'longitude' => 106.7019,
            'is_active' => true,
        ]);

        // Restaurant outside bounds
        Restaurant::factory()->create([
            'latitude' => 20.0,
            'longitude' => 120.0,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/restaurants/map?sw_lat=10.7&sw_lng=106.6&ne_lat=10.8&ne_lng=106.8');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_public_can_get_restaurant_detail_by_slug(): void
    {
        $restaurant = Restaurant::factory()->create([
            'name' => 'Test Restaurant',
            'slug' => 'test-restaurant',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/restaurants/test-restaurant');

        $response->assertOk()
            ->assertJsonFragment([
                'id' => $restaurant->id,
                'name' => 'Test Restaurant',
                'slug' => 'test-restaurant',
            ]);

        // Verify essential fields are present
        $data = $response->json('data') ?? $response->json();
        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('name', $data);
        $this->assertArrayHasKey('latitude', $data);
        $this->assertArrayHasKey('longitude', $data);
        $this->assertArrayHasKey('capacity', $data);
        $this->assertArrayHasKey('tables', $data);
    }

    public function test_public_list_includes_both_active_and_inactive(): void
    {
        // Note: Public endpoint currently returns all restaurants (active & inactive)
        // This may need to be changed to filter by is_active=true only
        Restaurant::factory()->count(3)->create(['is_active' => true]);
        Restaurant::factory()->count(2)->create(['is_active' => false]);

        $response = $this->getJson('/api/v1/restaurants?per_page=100');

        $response->assertOk();

        // Verify we get restaurants in the response
        $this->assertGreaterThanOrEqual(5, count($response->json('data')));
    }

    // ==================== Admin CRUD ====================

    public function test_admin_can_create_restaurant(): void
    {
        $category = Category::factory()->create();

        $data = [
            'category_id' => $category->id,
            'name' => 'New Restaurant',
            'address' => '123 Test Street, District 1, Ho Chi Minh City',
            'city' => 'Ho Chi Minh City',
            'district' => 'District 1',
            'latitude' => 10.7756,
            'longitude' => 106.7019,
            'phone' => '028 1234 5678',
            'description' => 'A great new restaurant',
            'price_range' => 2,
            'capacity' => 100,
            'tables' => 25,
            'is_active' => true,
        ];

        $response = $this->actingAsAdmin()
            ->postJson('/api/v1/admin/restaurants', $data);

        $response->assertCreated()
            ->assertJsonFragment(['name' => 'New Restaurant']);

        $this->assertDatabaseHas('restaurants', [
            'name' => 'New Restaurant',
            'slug' => 'new-restaurant',
            'capacity' => 100,
            'tables' => 25,
        ]);
    }

    public function test_admin_can_update_restaurant(): void
    {
        $restaurant = Restaurant::factory()->create(['name' => 'Old Name']);

        $this->actingAsAdmin()
            ->putJson("/api/v1/admin/restaurants/{$restaurant->id}", [
                'category_id' => $restaurant->category_id,
                'name' => 'Updated Name',
                'address' => $restaurant->address,
                'latitude' => $restaurant->latitude,
                'longitude' => $restaurant->longitude,
                'price_range' => 3,
            ])
            ->assertOk()
            ->assertJsonFragment(['name' => 'Updated Name', 'price_range' => 3]);

        $this->assertDatabaseHas('restaurants', ['id' => $restaurant->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_soft_delete_restaurant(): void
    {
        $restaurant = Restaurant::factory()->create();

        $this->actingAsAdmin()
            ->deleteJson("/api/v1/admin/restaurants/{$restaurant->id}")
            ->assertOk()
            ->assertJson(['message' => 'Restaurant deleted.']);

        $this->assertSoftDeleted('restaurants', ['id' => $restaurant->id]);
    }

    public function test_validation_requires_category_exists(): void
    {
        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/restaurants', [
                'category_id' => 99999, // non-existent
                'name' => 'Test',
                'address' => 'Test Address',
                'latitude' => 10.7756,
                'longitude' => 106.7019,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['category_id']);
    }

    public function test_validation_requires_valid_coordinates(): void
    {
        $category = Category::factory()->create();

        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/restaurants', [
                'category_id' => $category->id,
                'name' => 'Test',
                'address' => 'Test Address',
                'latitude' => 200, // invalid
                'longitude' => 300, // invalid
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['latitude', 'longitude']);
    }

    // ==================== Image Management ====================

    public function test_admin_can_upload_restaurant_image(): void
    {
        Storage::fake('public');

        $restaurant = Restaurant::factory()->create();
        // Create a simple file instead of image() since GD library may not be available in container
        $file = UploadedFile::fake()->create('restaurant.jpg', 100, 'image/jpeg');

        $response = $this->actingAsAdmin()
            ->postJson("/api/v1/admin/restaurants/{$restaurant->id}/images", [
                'image' => $file,
                'is_primary' => true,
            ]);

        $response->assertCreated();

        // Check if response has data wrapper or direct response
        $data = $response->json('data') ?? $response->json();
        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('url', $data);

        $this->assertDatabaseHas('restaurant_images', [
            'restaurant_id' => $restaurant->id,
            'is_primary' => true,
        ]);

        // Verify file was stored
        $images = RestaurantImage::where('restaurant_id', $restaurant->id)->get();
        $this->assertCount(1, $images);
    }

    public function test_admin_cannot_upload_non_image_file(): void
    {
        Storage::fake('public');

        $restaurant = Restaurant::factory()->create();
        $file = UploadedFile::fake()->create('document.pdf', 100);

        $this->actingAsAdmin()
            ->postJson("/api/v1/admin/restaurants/{$restaurant->id}/images", [
                'image' => $file,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_admin_can_delete_restaurant_image(): void
    {
        Storage::fake('public');

        $restaurant = Restaurant::factory()->create();
        $image = RestaurantImage::factory()->create([
            'restaurant_id' => $restaurant->id,
            'path' => 'restaurants/test-image.jpg',
            'disk' => 'public',
        ]);

        // Create fake file
        Storage::disk('public')->put('restaurants/test-image.jpg', 'fake-content');

        $this->actingAsAdmin()
            ->deleteJson("/api/v1/admin/restaurants/{$restaurant->id}/images/{$image->id}")
            ->assertOk()
            ->assertJson(['message' => 'Image deleted.']);

        $this->assertDatabaseMissing('restaurant_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing('restaurants/test-image.jpg');
    }

    public function test_admin_can_reorder_images(): void
    {
        $restaurant = Restaurant::factory()->create();
        $image1 = RestaurantImage::factory()->create(['restaurant_id' => $restaurant->id, 'sort_order' => 0]);
        $image2 = RestaurantImage::factory()->create(['restaurant_id' => $restaurant->id, 'sort_order' => 1]);
        $image3 = RestaurantImage::factory()->create(['restaurant_id' => $restaurant->id, 'sort_order' => 2]);

        $this->actingAsAdmin()
            ->patchJson("/api/v1/admin/restaurants/{$restaurant->id}/images/reorder", [
                'image_ids' => [$image3->id, $image1->id, $image2->id],
            ])
            ->assertOk()
            ->assertJson(['message' => 'Images reordered.']);

        $this->assertDatabaseHas('restaurant_images', ['id' => $image3->id, 'sort_order' => 0]);
        $this->assertDatabaseHas('restaurant_images', ['id' => $image1->id, 'sort_order' => 1]);
        $this->assertDatabaseHas('restaurant_images', ['id' => $image2->id, 'sort_order' => 2]);
    }

    public function test_guest_cannot_access_admin_restaurants(): void
    {
        $restaurant = Restaurant::factory()->create();

        $this->postJson('/api/v1/admin/restaurants', [])->assertUnauthorized();
        $this->putJson("/api/v1/admin/restaurants/{$restaurant->id}", [])->assertUnauthorized();
        $this->deleteJson("/api/v1/admin/restaurants/{$restaurant->id}")->assertUnauthorized();
    }
}
