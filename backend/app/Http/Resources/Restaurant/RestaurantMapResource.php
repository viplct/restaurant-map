<?php

namespace App\Http\Resources\Restaurant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Minimal resource for map markers — only fields needed for rendering pins.
 *
 * @mixin \App\Models\Restaurant
 */
class RestaurantMapResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'slug'          => $this->slug,
            'address'       => $this->address,
            'latitude'      => (float) $this->latitude,
            'longitude'     => (float) $this->longitude,
            'price_range'   => $this->price_range,
            'capacity'      => $this->capacity,
            'tables'        => $this->tables,
            'rating'        => (float) $this->rating,
            'rating_count'  => $this->rating_count,
            'is_featured'   => $this->is_featured,
            'category'      => $this->whenLoaded('category', fn () => [
                'id'    => $this->category->id,
                'name'  => $this->category->name,
                'icon'  => $this->category->icon,
                'color' => $this->category->color,
            ]),
            'images'        => $this->whenLoaded('images', fn () =>
                RestaurantImageResource::collection($this->images)
            ),
            'primary_image' => $this->whenLoaded('primaryImage', fn () => $this->primaryImage
                ? ['url' => $this->primaryImage->url]
                : null
            ),
        ];
    }
}
