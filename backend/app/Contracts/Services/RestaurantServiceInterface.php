<?php

namespace App\Contracts\Services;

use App\Models\Restaurant;
use App\Models\RestaurantImage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

interface RestaurantServiceInterface
{
    public function paginate(int $perPage, array $filters): LengthAwarePaginator;

    public function findOrFail(int $id): Restaurant;

    public function findBySlugOrFail(string $slug): Restaurant;

    public function getForMap(array $filters): Collection;

    public function create(array $validated): Restaurant;

    public function update(int $id, array $validated): Restaurant;

    public function delete(int $id): void;

    public function uploadImage(int $restaurantId, UploadedFile $file, bool $isPrimary, ?string $caption): RestaurantImage;

    public function deleteImage(int $restaurantId, int $imageId): void;

    public function reorderImages(int $restaurantId, array $orderedIds): void;
}
