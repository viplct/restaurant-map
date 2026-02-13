<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\Services\CategoryServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\Category\CategoryResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Public read-only category endpoints.
 */
class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryServiceInterface $categoryService,
    ) {}

    /**
     * GET /api/v1/categories
     * Returns all active categories (used for filter chips on the map).
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = $this->categoryService->listActive();

        return CategoryResource::collection($categories);
    }

    /**
     * GET /api/v1/categories/{category}
     */
    public function show(int $category): JsonResponse
    {
        $model = $this->categoryService->findOrFail($category);

        return response()->json(new CategoryResource($model));
    }
}
