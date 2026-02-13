<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Contracts\Services\RestaurantServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\ReorderImagesRequest;
use App\Http\Requests\Restaurant\StoreRestaurantRequest;
use App\Http\Requests\Restaurant\UpdateRestaurantRequest;
use App\Http\Requests\Restaurant\UploadImageRequest;
use App\Http\Resources\Restaurant\RestaurantDetailResource;
use App\Http\Resources\Restaurant\RestaurantImageResource;
use App\Http\Resources\Restaurant\RestaurantResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminRestaurantController extends Controller
{
    public function __construct(
        private readonly RestaurantServiceInterface $restaurantService,
    ) {}

    /**
     * GET /api/v1/admin/restaurants
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $restaurants = $this->restaurantService->paginate(
            perPage: (int) $request->integer('per_page', 15),
            filters: $request->only(['search', 'category_id', 'is_active', 'is_featured', 'price_range']),
        );

        return RestaurantResource::collection($restaurants);
    }

    /**
     * POST /api/v1/admin/restaurants
     */
    public function store(StoreRestaurantRequest $request): JsonResponse
    {
        $restaurant = $this->restaurantService->create($request->validated());

        return response()->json(new RestaurantDetailResource($restaurant), 201);
    }

    /**
     * GET /api/v1/admin/restaurants/{restaurant}
     */
    public function show(int $restaurant): JsonResponse
    {
        $model = $this->restaurantService->findOrFail($restaurant);

        return response()->json(new RestaurantDetailResource($model));
    }

    /**
     * PUT /api/v1/admin/restaurants/{restaurant}
     */
    public function update(UpdateRestaurantRequest $request, int $restaurant): JsonResponse
    {
        $model = $this->restaurantService->update($restaurant, $request->validated());

        return response()->json(new RestaurantDetailResource($model));
    }

    /**
     * DELETE /api/v1/admin/restaurants/{restaurant}
     */
    public function destroy(int $restaurant): JsonResponse
    {
        $this->restaurantService->delete($restaurant);

        return response()->json(['message' => 'Restaurant deleted.'], 200);
    }

    // -------------------------------------------------------
    // Image management
    // -------------------------------------------------------

    /**
     * POST /api/v1/admin/restaurants/{restaurant}/images
     */
    public function uploadImage(UploadImageRequest $request, int $restaurant): JsonResponse
    {
        $image = $this->restaurantService->uploadImage(
            restaurantId: $restaurant,
            file:         $request->file('image'),
            isPrimary:    (bool) $request->boolean('is_primary', false),
            caption:      $request->input('caption'),
        );

        return response()->json(new RestaurantImageResource($image), 201);
    }

    /**
     * DELETE /api/v1/admin/restaurants/{restaurant}/images/{image}
     */
    public function deleteImage(int $restaurant, int $image): JsonResponse
    {
        $this->restaurantService->deleteImage($restaurant, $image);

        return response()->json(['message' => 'Image deleted.'], 200);
    }

    /**
     * PATCH /api/v1/admin/restaurants/{restaurant}/images/reorder
     */
    public function reorderImages(ReorderImagesRequest $request, int $restaurant): JsonResponse
    {
        $this->restaurantService->reorderImages($restaurant, $request->validated('image_ids'));

        return response()->json(['message' => 'Images reordered.']);
    }
}
