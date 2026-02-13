<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Restaurant;
use App\Models\RestaurantImage;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'total_restaurants' => Restaurant::count(),
                'active_restaurants'=> Restaurant::active()->count(),
                'featured_restaurants' => Restaurant::featured()->count(),
                'total_categories'  => Category::count(),
                'total_images'      => RestaurantImage::count(),
            ],
            'recent_restaurants' => Restaurant::with('category')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($r) => [
                    'id'         => $r->id,
                    'name'       => $r->name,
                    'category'   => $r->category?->name,
                    'is_active'  => $r->is_active,
                    'created_at' => $r->created_at->toIso8601String(),
                ]),
        ]);
    }
}
