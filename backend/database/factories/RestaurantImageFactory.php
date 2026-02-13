<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\RestaurantImage;
use Illuminate\Database\Eloquent\Factories\Factory;

class RestaurantImageFactory extends Factory
{
    protected $model = RestaurantImage::class;

    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'path' => 'restaurants/' . $this->faker->uuid() . '.jpg',
            'disk' => 'public',
            'caption' => $this->faker->optional()->sentence(),
            'is_primary' => false,
            'sort_order' => 0,
        ];
    }

    public function primary(): static
    {
        return $this->state(['is_primary' => true]);
    }
}
