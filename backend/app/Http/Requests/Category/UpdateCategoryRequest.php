<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('category');

        return [
            'name'        => ['sometimes', 'string', 'max:100', Rule::unique('categories', 'name')->ignore($id)],
            'slug'        => ['sometimes', 'string', 'max:120', Rule::unique('categories', 'slug')->ignore($id)],
            'icon'        => ['nullable', 'string', 'max:50'],
            'color'       => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6})$/'],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order'  => ['sometimes', 'integer', 'min:0'],
            'is_active'   => ['sometimes', 'boolean'],
        ];
    }
}
