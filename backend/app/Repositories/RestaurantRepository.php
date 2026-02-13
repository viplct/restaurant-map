<?php

namespace App\Repositories;

use App\Contracts\Repositories\RestaurantRepositoryInterface;
use App\Models\Restaurant;
use App\Models\RestaurantImage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class RestaurantRepository implements RestaurantRepositoryInterface
{
    public function __construct(
        private readonly Restaurant $model,
    ) {}

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return $this->model
            ->with(['category', 'primaryImage'])
            ->withTrashed(isset($filters['with_trashed']))
            ->when(
                isset($filters['search']),
                fn ($q) => $q->whereFullText(['name', 'address', 'description'], $filters['search'])
            )
            ->when(
                isset($filters['category_id']),
                fn ($q) => $q->byCategory((array) $filters['category_id'])
            )
            ->when(
                isset($filters['is_active']),
                fn ($q) => $q->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN))
            )
            ->when(
                isset($filters['is_featured']),
                fn ($q) => $q->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOLEAN))
            )
            ->when(
                isset($filters['price_range']),
                fn ($q) => $q->whereIn('price_range', (array) $filters['price_range'])
            )
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id, array $with = []): ?Restaurant
    {
        return $this->model->with($with)->find($id);
    }

    public function findBySlug(string $slug, array $with = []): ?Restaurant
    {
        return $this->model->with($with)->where('slug', $slug)->first();
    }

    public function create(array $data): Restaurant
    {
        $data['slug'] ??= Str::slug($data['name']);

        return $this->model->create($data);
    }

    public function update(Restaurant $restaurant, array $data): Restaurant
    {
        $restaurant->update($data);

        return $restaurant->fresh(['category', 'images']);
    }

    public function delete(Restaurant $restaurant): bool
    {
        return $restaurant->delete();
    }

    public function restore(int $id): bool
    {
        return (bool) $this->model->withTrashed()->findOrFail($id)->restore();
    }

    public function getForMap(array $filters = []): Collection
    {
        return $this->model
            ->select(['id', 'category_id', 'name', 'slug', 'address', 'latitude', 'longitude', 'price_range', 'capacity', 'tables', 'rating', 'rating_count', 'is_featured'])
            ->with(['category:id,name,slug,icon,color', 'images:id,restaurant_id,path,disk,sort_order,is_primary', 'primaryImage:id,restaurant_id,path,disk'])
            ->active()
            ->when(
                isset($filters['category_id']),
                fn ($q) => $q->byCategory((array) $filters['category_id'])
            )
            ->when(
                isset($filters['sw_lat'], $filters['sw_lng'], $filters['ne_lat'], $filters['ne_lng']),
                fn ($q) => $q->inBounds(
                    (float) $filters['sw_lat'],
                    (float) $filters['sw_lng'],
                    (float) $filters['ne_lat'],
                    (float) $filters['ne_lng'],
                )
            )
            ->when(
                isset($filters['search']),
                fn ($q) => $q->where('name', 'like', "%{$filters['search']}%")
            )
            ->get();
    }

    public function addImage(Restaurant $restaurant, array $imageData): RestaurantImage
    {
        if ($imageData['is_primary'] ?? false) {
            $restaurant->images()->update(['is_primary' => false]);
        }

        return $restaurant->images()->create($imageData);
    }

    public function deleteImage(RestaurantImage $image): bool
    {
        return $image->delete();
    }

    public function reorderImages(Restaurant $restaurant, array $orderedIds): void
    {
        foreach ($orderedIds as $order => $imageId) {
            $restaurant->images()->where('id', $imageId)->update(['sort_order' => $order]);
        }
    }
}
