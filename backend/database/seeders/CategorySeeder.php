<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    private const CATEGORIES = [
        ['name' => 'Vietnamese',  'icon' => '🍜', 'color' => '#E53E3E'],
        ['name' => 'Japanese',    'icon' => '🍣', 'color' => '#DD6B20'],
        ['name' => 'Korean',      'icon' => '🥩', 'color' => '#D69E2E'],
        ['name' => 'Chinese',     'icon' => '🥟', 'color' => '#38A169'],
        ['name' => 'Italian',     'icon' => '🍕', 'color' => '#319795'],
        ['name' => 'American',    'icon' => '🍔', 'color' => '#3182CE'],
        ['name' => 'Thai',        'icon' => '🌶️', 'color' => '#805AD5'],
        ['name' => 'Indian',      'icon' => '🍛', 'color' => '#D53F8C'],
        ['name' => 'Seafood',     'icon' => '🦞', 'color' => '#00B5D8'],
        ['name' => 'Café & Drinks', 'icon' => '☕', 'color' => '#718096'],
    ];

    public function run(): void
    {
        foreach (self::CATEGORIES as $order => $data) {
            Category::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'name'       => $data['name'],
                    'slug'       => Str::slug($data['name']),
                    'icon'       => $data['icon'],
                    'color'      => $data['color'],
                    'sort_order' => $order,
                    'is_active'  => true,
                ]
            );
        }
    }
}
