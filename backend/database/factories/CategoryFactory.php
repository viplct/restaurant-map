<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $categories = [
            'Vietnamese', 'Japanese', 'Korean', 'Chinese', 'Italian',
            'American', 'Thai', 'Indian', 'French', 'Mexican',
            'Mediterranean', 'Greek', 'Spanish', 'Brazilian', 'Turkish',
            'Lebanese', 'Malaysian', 'Indonesian', 'Filipino', 'Singaporean',
        ];

        $name = $this->faker->unique()->randomElement($categories);

        return [
            'name'        => $name,
            'slug'        => Str::slug($name),
            'icon'        => $this->faker->randomElement(['🍜', '🍣', '🍕', '🌮', '🍛', '🥗', '🍖', '🍱', '🥘', '🍝']),
            'color'       => $this->faker->hexColor(),
            'description' => $this->faker->sentence(),
            'sort_order'  => $this->faker->numberBetween(0, 100),
            'is_active'   => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
