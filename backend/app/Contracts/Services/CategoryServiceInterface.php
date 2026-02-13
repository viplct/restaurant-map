<?php

namespace App\Contracts\Services;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface CategoryServiceInterface
{
    public function listActive(): Collection;

    public function paginate(int $perPage, array $filters): LengthAwarePaginator;

    public function findOrFail(int $id): Category;

    public function create(array $validated): Category;

    public function update(int $id, array $validated): Category;

    public function delete(int $id): void;
}
