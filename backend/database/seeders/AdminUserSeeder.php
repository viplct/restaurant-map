<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@restaurant-map.com'],
            [
                'name'     => 'Super Admin',
                'email'    => 'admin@restaurant-map.com',
                'password' => Hash::make('password'),
            ]
        );
    }
}
