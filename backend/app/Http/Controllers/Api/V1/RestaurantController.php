<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\Services\RestaurantServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\Restaurant\RestaurantDetailResource;
use App\Http\Resources\Restaurant\RestaurantMapResource;
use App\Http\Resources\Restaurant\RestaurantResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Public restaurant endpoints.
 */
class RestaurantController extends Controller
{
    public function __construct(
        private readonly RestaurantServiceInterface $restaurantService,
    ) {}

    /**
     * GET /api/v1/restaurants
     * Paginated list (for sidebar list view).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $restaurants = $this->restaurantService->paginate(
            perPage: (int) $request->integer('per_page', 15),
            filters: $request->only(['search', 'category_id', 'price_range', 'is_featured']),
        );

        return RestaurantResource::collection($restaurants);
    }

    /**
     * GET /api/v1/restaurants/map
     * Returns lightweight markers for the map (no pagination).
     */
    public function map(Request $request): AnonymousResourceCollection
    {
        $restaurants = $this->restaurantService->getForMap(
            $request->only(['category_id', 'search', 'sw_lat', 'sw_lng', 'ne_lat', 'ne_lng'])
        );

        return RestaurantMapResource::collection($restaurants);
    }

    /**
     * GET /api/v1/restaurants/{slug}
     * Full detail by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $restaurant = $this->restaurantService->findBySlugOrFail($slug);

        return response()->json(new RestaurantDetailResource($restaurant));
    }
}
