<?php

namespace App\Http\Requests\Restaurant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReorderImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image_ids'   => ['required', 'array', 'min:1'],
            'image_ids.*' => ['required', 'integer', Rule::exists('restaurant_images', 'id')],
        ];
    }
}
