<?php

namespace App\Contracts\Repositories;

use App\Models\Restaurant;
use App\Models\RestaurantImage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface RestaurantRepositoryInterface
{
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;

    public function findById(int $id, array $with = []): ?Restaurant;

    public function findBySlug(string $slug, array $with = []): ?Restaurant;

    public function create(array $data): Restaurant;

    public function update(Restaurant $restaurant, array $data): Restaurant;

    public function delete(Restaurant $restaurant): bool;

    public function restore(int $id): bool;

    public function getForMap(array $filters = []): Collection;

    public function addImage(Restaurant $restaurant, array $imageData): RestaurantImage;

    public function deleteImage(RestaurantImage $image): bool;

    public function reorderImages(Restaurant $restaurant, array $orderedIds): void;
}
