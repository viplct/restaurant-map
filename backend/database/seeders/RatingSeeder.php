<?php

namespace Database\Seeders;

use App\Models\Rating;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class RatingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $restaurants = Restaurant::all();

        foreach ($restaurants as $restaurant) {
            // Generate random number of ratings (5-50)
            $count = rand(5, 50);

            for ($i = 0; $i < $count; $i++) {
                Rating::create([
                    'restaurant_id' => $restaurant->id,
                    'user_id'       => null, // anonymous
                    'user_name'     => fake()->name(),
                    'user_email'    => fake()->safeEmail(),
                    'rating'        => rand(3, 5), // Most ratings are positive
                    'comment'       => rand(0, 1) ? fake()->sentence(rand(10, 20)) : null,
                    'ip_address'    => fake()->ipv4(),
                    'created_at'    => now()->subDays(rand(0, 365)),
                ]);
            }

            // Update restaurant's rating and rating_count
            $avgRating = $restaurant->ratings()->avg('rating');
            $ratingCount = $restaurant->ratings()->count();

            $restaurant->update([
                'rating'       => round($avgRating, 1),
                'rating_count' => $ratingCount,
            ]);
        }

        $this->command->info('Created ratings for all restaurants and updated aggregates');
    }
}
