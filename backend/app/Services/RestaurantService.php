<?php

namespace App\Services;

use App\Contracts\Repositories\RestaurantRepositoryInterface;
use App\Contracts\Services\RestaurantServiceInterface;
use App\Models\Restaurant;
use App\Models\RestaurantImage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;

class RestaurantService implements RestaurantServiceInterface
{
    public function __construct(
        private readonly RestaurantRepositoryInterface $restaurantRepository,
        private readonly ImageService                  $imageService,
    ) {}

    public function paginate(int $perPage, array $filters): LengthAwarePaginator
    {
        return $this->restaurantRepository->paginate($perPage, $filters);
    }

    public function findOrFail(int $id): Restaurant
    {
        return $this->restaurantRepository->findById($id, ['category', 'images'])
            ?? throw new ModelNotFoundException("Restaurant [{$id}] not found.");
    }

    public function findBySlugOrFail(string $slug): Restaurant
    {
        return $this->restaurantRepository->findBySlug($slug, ['category', 'images'])
            ?? throw new ModelNotFoundException("Restaurant [{$slug}] not found.");
    }

    public function getForMap(array $filters): Collection
    {
        return $this->restaurantRepository->getForMap($filters);
    }

    public function create(array $validated): Restaurant
    {
        return $this->restaurantRepository->create($validated);
    }

    public function update(int $id, array $validated): Restaurant
    {
        $restaurant = $this->findOrFail($id);

        return $this->restaurantRepository->update($restaurant, $validated);
    }

    public function delete(int $id): void
    {
        $restaurant = $this->findOrFail($id);

        // Cleanup images from storage before soft-deleting
        foreach ($restaurant->images as $image) {
            $this->imageService->delete($image->path, $image->disk);
        }

        $this->restaurantRepository->delete($restaurant);
    }

    public function uploadImage(int $restaurantId, UploadedFile $file, bool $isPrimary, ?string $caption): RestaurantImage
    {
        $restaurant = $this->findOrFail($restaurantId);

        $path = $this->imageService->store($file, 'restaurants');

        return $this->restaurantRepository->addImage($restaurant, [
            'path'       => $path,
            'disk'       => $this->imageService->getDisk(),
            'caption'    => $caption,
            'is_primary' => $isPrimary || ! $restaurant->images()->exists(),
        ]);
    }

    public function deleteImage(int $restaurantId, int $imageId): void
    {
        $restaurant = $this->findOrFail($restaurantId);
        $image      = $restaurant->images()->findOrFail($imageId);

        $this->imageService->delete($image->path, $image->disk);
        $this->restaurantRepository->deleteImage($image);

        // If deleted image was primary, promote the next image
        if ($image->is_primary) {
            $next = $restaurant->images()->orderBy('sort_order')->first();
            $next?->update(['is_primary' => true]);
        }
    }

    public function reorderImages(int $restaurantId, array $orderedIds): void
    {
        $restaurant = $this->findOrFail($restaurantId);

        $this->restaurantRepository->reorderImages($restaurant, $orderedIds);
    }
}
