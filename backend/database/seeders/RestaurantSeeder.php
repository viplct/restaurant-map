<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RestaurantSeeder extends Seeder
{
    private const SAMPLE_RESTAURANTS = [
        [
            'name'        => 'Phở Hùng',
            'category'    => 'vietnamese',
            'address'     => '3 Pasteur, Bến Nghé, District 1, Ho Chi Minh City',
            'latitude'    => 10.77564,
            'longitude'   => 106.70508,
            'phone'       => '028 3822 2888',
            'price_range' => 1,
            'rating'      => 4.5,
            'is_featured' => true,
        ],
        [
            'name'        => 'Bún Bò Huế Bà Tuyết',
            'category'    => 'vietnamese',
            'address'     => '234 Điện Biên Phủ, Dakao, District 1, Ho Chi Minh City',
            'latitude'    => 10.78821,
            'longitude'   => 106.69877,
            'phone'       => '028 3910 4455',
            'price_range' => 1,
            'rating'      => 4.3,
            'is_featured' => false,
        ],
        [
            'name'        => 'Sushi Hokkaido Sachi',
            'category'    => 'japanese',
            'address'     => '127 Lê Thánh Tôn, Bến Thành, District 1, Ho Chi Minh City',
            'latitude'    => 10.77204,
            'longitude'   => 106.69893,
            'phone'       => '028 3827 7777',
            'price_range' => 3,
            'rating'      => 4.7,
            'is_featured' => true,
        ],
        [
            'name'        => 'Gogi House Korean BBQ',
            'category'    => 'korean',
            'address'     => '15 Trần Hưng Đạo, Phạm Ngũ Lão, District 1, Ho Chi Minh City',
            'latitude'    => 10.76778,
            'longitude'   => 106.69231,
            'phone'       => '028 3920 5588',
            'price_range' => 2,
            'rating'      => 4.2,
            'is_featured' => false,
        ],
        [
            'name'        => 'Pizza 4P\'s',
            'category'    => 'italian',
            'address'     => '8/15 Lê Thánh Tôn, Bến Nghé, District 1, Ho Chi Minh City',
            'latitude'    => 10.77387,
            'longitude'   => 106.70231,
            'phone'       => '028 3622 0500',
            'price_range' => 2,
            'rating'      => 4.8,
            'is_featured' => true,
        ],
        [
            'name'        => 'The Racha Room',
            'category'    => 'thai',
            'address'     => '107 Trương Định, District 3, Ho Chi Minh City',
            'latitude'    => 10.77901,
            'longitude'   => 106.68541,
            'phone'       => '028 3930 1234',
            'price_range' => 3,
            'rating'      => 4.4,
            'is_featured' => false,
        ],
        [
            'name'        => 'Stoker Woodfired Grill & Bar',
            'category'    => 'american',
            'address'     => '72 Hai Bà Trưng, Bến Nghé, District 1, Ho Chi Minh City',
            'latitude'    => 10.77633,
            'longitude'   => 106.70144,
            'phone'       => '028 3824 3464',
            'price_range' => 3,
            'rating'      => 4.1,
            'is_featured' => false,
        ],
        [
            'name'        => 'Secret Garden Restaurant',
            'category'    => 'vietnamese',
            'address'     => '158/6 Pasteur, Bến Nghé, District 1, Ho Chi Minh City',
            'latitude'    => 10.77401,
            'longitude'   => 106.70338,
            'phone'       => '096 996 9558',
            'price_range' => 2,
            'rating'      => 4.6,
            'is_featured' => true,
        ],
    ];

    public function run(): void
    {
        $categories = Category::all()->keyBy('slug');

        foreach (self::SAMPLE_RESTAURANTS as $data) {
            $category = $categories->get($data['category']);

            if (! $category) {
                continue;
            }

            Restaurant::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'category_id'  => $category->id,
                    'name'         => $data['name'],
                    'slug'         => Str::slug($data['name']),
                    'description'  => 'A beloved local eatery known for its authentic flavors and warm atmosphere.',
                    'address'      => $data['address'],
                    'city'         => 'Ho Chi Minh City',
                    'latitude'     => $data['latitude'],
                    'longitude'    => $data['longitude'],
                    'phone'        => $data['phone'],
                    'opening_hours' => [
                        'mon' => '07:00-22:00',
                        'tue' => '07:00-22:00',
                        'wed' => '07:00-22:00',
                        'thu' => '07:00-22:00',
                        'fri' => '07:00-23:00',
                        'sat' => '07:00-23:00',
                        'sun' => '08:00-22:00',
                    ],
                    'price_range'  => $data['price_range'],
                    'capacity'     => rand(30, 150),
                    'tables'       => rand(10, 40),
                    'rating'       => $data['rating'],
                    'rating_count' => rand(50, 1500),
                    'is_active'    => true,
                    'is_featured'  => $data['is_featured'],
                ]
            );
        }
    }
}
