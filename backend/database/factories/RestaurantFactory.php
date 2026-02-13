<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class RestaurantFactory extends Factory
{
    protected $model = Restaurant::class;

    // Ho Chi Minh City bounding box
    private const LAT_MIN = 10.6500;
    private const LAT_MAX = 10.8900;
    private const LNG_MIN = 106.6000;
    private const LNG_MAX = 106.8500;

    public function definition(): array
    {
        $name = $this->faker->company() . ' ' . $this->faker->randomElement(['Restaurant', 'Kitchen', 'Eatery', 'Bistro', 'Café']);

        return [
            'category_id'   => Category::factory(),
            'name'          => $name,
            'slug'          => Str::slug($name) . '-' . $this->faker->unique()->numberBetween(1, 9999),
            'description'   => $this->faker->paragraph(3),
            'address'       => $this->faker->streetAddress() . ', ' . $this->faker->randomElement(['District 1', 'District 2', 'District 3', 'Binh Thanh', 'Thu Duc']) . ', Ho Chi Minh City',
            'city'          => 'Ho Chi Minh City',
            'district'      => $this->faker->randomElement(['District 1', 'District 2', 'District 3', 'Binh Thanh', 'Thu Duc']),
            'latitude'      => $this->faker->randomFloat(8, self::LAT_MIN, self::LAT_MAX),
            'longitude'     => $this->faker->randomFloat(8, self::LNG_MIN, self::LNG_MAX),
            'phone'         => $this->faker->phoneNumber(),
            'website'       => $this->faker->optional()->url(),
            'email'         => $this->faker->optional()->safeEmail(),
            'opening_hours' => [
                'mon' => '08:00-22:00',
                'tue' => '08:00-22:00',
                'wed' => '08:00-22:00',
                'thu' => '08:00-22:00',
                'fri' => '08:00-23:00',
                'sat' => '09:00-23:00',
                'sun' => '09:00-22:00',
            ],
            'price_range'   => $this->faker->numberBetween(1, 4),
            'capacity'      => $this->faker->numberBetween(30, 150),
            'tables'        => $this->faker->numberBetween(10, 40),
            'rating'        => $this->faker->randomFloat(2, 3.0, 5.0),
            'rating_count'  => $this->faker->numberBetween(0, 2000),
            'is_active'     => true,
            'is_featured'   => false,
        ];
    }

    public function featured(): static
    {
        return $this->state(['is_featured' => true]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
