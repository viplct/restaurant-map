<?php

namespace App\Http\Resources\Restaurant;

use App\Http\Resources\Category\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full detail resource — used for single-restaurant view and admin form.
 *
 * @mixin \App\Models\Restaurant
 */
class RestaurantDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'slug'               => $this->slug,
            'description'        => $this->description,
            'address'            => $this->address,
            'city'               => $this->city,
            'district'           => $this->district,
            'latitude'           => (float) $this->latitude,
            'longitude'          => (float) $this->longitude,
            'phone'              => $this->phone,
            'website'            => $this->website,
            'email'              => $this->email,
            'opening_hours'      => $this->opening_hours,
            'price_range'        => $this->price_range,
            'price_range_label'  => $this->price_range_label,
            'capacity'           => $this->capacity,
            'tables'             => $this->tables,
            'rating'             => (float) $this->rating,
            'rating_count'       => $this->rating_count,
            'is_featured'        => $this->is_featured,
            'is_active'          => $this->is_active,
            'category'           => new CategoryResource($this->whenLoaded('category')),
            'images'             => RestaurantImageResource::collection($this->whenLoaded('images')),
            'created_at'         => $this->created_at?->toIso8601String(),
            'updated_at'         => $this->updated_at?->toIso8601String(),
        ];
    }
}
