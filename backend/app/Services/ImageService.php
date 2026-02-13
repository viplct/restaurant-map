<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageService
{
    private const DISK          = 'public';
    private const MAX_WIDTH     = 1200;
    private const THUMB_WIDTH   = 400;
    private const QUALITY       = 85;

    /**
     * Store an uploaded image and return its relative path.
     */
    public function store(UploadedFile $file, string $directory = 'restaurants'): string
    {
        $filename  = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path      = "{$directory}/{$filename}";

        Storage::disk(self::DISK)->put($path, file_get_contents($file->getRealPath()));

        return $path;
    }

    /**
     * Delete an image from storage.
     */
    public function delete(string $path, string $disk = self::DISK): void
    {
        if (Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
    }

    public function getDisk(): string
    {
        return self::DISK;
    }
}
