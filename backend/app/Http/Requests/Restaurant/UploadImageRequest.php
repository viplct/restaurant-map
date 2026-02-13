<?php

namespace App\Http\Requests\Restaurant;

use Illuminate\Foundation\Http\FormRequest;

class UploadImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image'      => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // 5 MB
            'is_primary' => ['boolean'],
            'caption'    => ['nullable', 'string', 'max:300'],
        ];
    }
}
