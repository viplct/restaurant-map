<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('name', 200);
            $table->string('slug', 220)->unique();
            $table->text('description')->nullable();
            $table->string('address', 500);
            $table->string('city', 100)->nullable();
            $table->string('district', 100)->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('phone', 30)->nullable();
            $table->string('website', 300)->nullable();
            $table->string('email', 200)->nullable();
            $table->json('opening_hours')->nullable()->comment('{"mon":"08:00-22:00","tue":"08:00-22:00",...}');
            $table->unsignedTinyInteger('price_range')->default(2)->comment('1=budget, 2=mid, 3=fine-dining, 4=luxury');
            $table->unsignedInteger('capacity')->nullable()->comment('Total seating capacity');
            $table->unsignedInteger('tables')->nullable()->comment('Number of tables');
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->unsignedInteger('rating_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'is_active']);
            $table->index(['latitude', 'longitude']);
            $table->index(['is_active', 'is_featured']);
            $table->fullText(['name', 'address', 'description'], 'restaurants_search');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
