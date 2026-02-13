<?php

namespace App\Http\Resources\Restaurant;

use App\Http\Resources\Category\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Lightweight resource for list/map views.
 *
 * @mixin \App\Models\Restaurant
 */
class RestaurantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'slug'               => $this->slug,
            'address'            => $this->address,
            'city'               => $this->city,
            'district'           => $this->district,
            'latitude'           => (float) $this->latitude,
            'longitude'          => (float) $this->longitude,
            'phone'              => $this->phone,
            'price_range'        => $this->price_range,
            'price_range_label'  => $this->price_range_label,
            'rating'             => (float) $this->rating,
            'rating_count'       => $this->rating_count,
            'is_featured'        => $this->is_featured,
            'is_active'          => $this->is_active,
            'category'           => new CategoryResource($this->whenLoaded('category')),
            'primary_image'      => $this->whenLoaded('primaryImage', fn () => $this->primaryImage
                ? new RestaurantImageResource($this->primaryImage)
                : null
            ),
        ];
    }
}
