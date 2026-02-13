<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Contracts\Services\CategoryServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\Category\CategoryResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminCategoryController extends Controller
{
    public function __construct(
        private readonly CategoryServiceInterface $categoryService,
    ) {}

    /**
     * GET /api/v1/admin/categories
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $categories = $this->categoryService->paginate(
            perPage: (int) $request->integer('per_page', 15),
            filters: $request->only(['search', 'is_active']),
        );

        return CategoryResource::collection($categories);
    }

    /**
     * POST /api/v1/admin/categories
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->create($request->validated());

        return response()->json(new CategoryResource($category), 201);
    }

    /**
     * GET /api/v1/admin/categories/{category}
     */
    public function show(int $category): JsonResponse
    {
        $model = $this->categoryService->findOrFail($category);

        return response()->json(new CategoryResource($model));
    }

    /**
     * PUT /api/v1/admin/categories/{category}
     */
    public function update(UpdateCategoryRequest $request, int $category): JsonResponse
    {
        $model = $this->categoryService->update($category, $request->validated());

        return response()->json(new CategoryResource($model));
    }

    /**
     * DELETE /api/v1/admin/categories/{category}
     */
    public function destroy(int $category): JsonResponse
    {
        $this->categoryService->delete($category);

        return response()->json(['message' => 'Category deleted.'], 200);
    }
}
