<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Restaurant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'address',
        'city',
        'district',
        'latitude',
        'longitude',
        'phone',
        'website',
        'email',
        'opening_hours',
        'price_range',
        'capacity',
        'tables',
        'rating',
        'rating_count',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'latitude'      => 'decimal:8',
        'longitude'     => 'decimal:8',
        'rating'        => 'decimal:2',
        'rating_count'  => 'integer',
        'price_range'   => 'integer',
        'capacity'      => 'integer',
        'tables'        => 'integer',
        'is_active'     => 'boolean',
        'is_featured'   => 'boolean',
    ];

    // -------------------------------------------------------
    // Boot
    // -------------------------------------------------------

    protected static function booted(): void
    {
        static::creating(function (self $restaurant): void {
            if (empty($restaurant->slug)) {
                $restaurant->slug = Str::slug($restaurant->name);
            }
        });
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(RestaurantImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasOne
    {
        return $this->hasOne(RestaurantImage::class)->where('is_primary', true);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    // -------------------------------------------------------
    // Scopes
    // -------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeInBounds($query, float $swLat, float $swLng, float $neLat, float $neLng)
    {
        return $query
            ->whereBetween('latitude', [$swLat, $neLat])
            ->whereBetween('longitude', [$swLng, $neLng]);
    }

    public function scopeByCategory($query, int|array $categoryId)
    {
        return $query->whereIn('category_id', (array) $categoryId);
    }

    // -------------------------------------------------------
    // Accessors
    // -------------------------------------------------------

    public function getPriceRangeLabelAttribute(): string
    {
        return match ($this->price_range) {
            1 => '$',
            2 => '$$',
            3 => '$$$',
            4 => '$$$$',
            default => '$$',
        };
    }
}
