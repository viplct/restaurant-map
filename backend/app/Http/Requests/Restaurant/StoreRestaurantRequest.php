<?php

namespace App\Http\Requests\Restaurant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRestaurantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id'           => ['required', 'integer', Rule::exists('categories', 'id')],
            'name'                  => ['required', 'string', 'max:200'],
            'slug'                  => ['nullable', 'string', 'max:220', Rule::unique('restaurants', 'slug')],
            'description'           => ['nullable', 'string', 'max:5000'],
            'address'               => ['required', 'string', 'max:500'],
            'city'                  => ['nullable', 'string', 'max:100'],
            'district'              => ['nullable', 'string', 'max:100'],
            'latitude'              => ['required', 'numeric', 'between:-90,90'],
            'longitude'             => ['required', 'numeric', 'between:-180,180'],
            'phone'                 => ['nullable', 'string', 'max:30'],
            'website'               => ['nullable', 'url', 'max:300'],
            'email'                 => ['nullable', 'email', 'max:200'],
            'opening_hours'         => ['nullable', 'array'],
            'opening_hours.*'       => ['nullable', 'string', 'max:50'],
            'price_range'           => ['nullable', 'integer', 'between:1,4'],
            'capacity'              => ['nullable', 'integer', 'min:1', 'max:10000'],
            'tables'                => ['nullable', 'integer', 'min:1', 'max:1000'],
            'is_active'             => ['boolean'],
            'is_featured'           => ['boolean'],
        ];
    }
}
