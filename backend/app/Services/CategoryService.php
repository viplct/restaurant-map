<?php

namespace App\Services;

use App\Contracts\Repositories\CategoryRepositoryInterface;
use App\Contracts\Services\CategoryServiceInterface;
use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CategoryService implements CategoryServiceInterface
{
    public function __construct(
        private readonly CategoryRepositoryInterface $categoryRepository,
    ) {}

    public function listActive(): Collection
    {
        return $this->categoryRepository->all(activeOnly: true);
    }

    public function paginate(int $perPage, array $filters): LengthAwarePaginator
    {
        return $this->categoryRepository->paginate($perPage, $filters);
    }

    public function findOrFail(int $id): Category
    {
        return $this->categoryRepository->findById($id)
            ?? throw new ModelNotFoundException("Category [{$id}] not found.");
    }

    public function create(array $validated): Category
    {
        return $this->categoryRepository->create($validated);
    }

    public function update(int $id, array $validated): Category
    {
        $category = $this->findOrFail($id);

        return $this->categoryRepository->update($category, $validated);
    }

    public function delete(int $id): void
    {
        $category = $this->findOrFail($id);

        if ($category->restaurants()->exists()) {
            throw new \DomainException('Cannot delete a category that has restaurants assigned to it.');
        }

        $this->categoryRepository->delete($category);
    }
}
