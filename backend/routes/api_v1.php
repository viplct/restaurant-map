<?php

use App\Http\Controllers\Api\V1\Admin\AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\AdminRestaurantController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\RestaurantController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::post('auth/login', [AuthController::class, 'login'])->name('api.v1.auth.login');

Route::get('categories', [CategoryController::class, 'index'])->name('api.v1.categories.index');
Route::get('categories/{category}', [CategoryController::class, 'show'])->name('api.v1.categories.show');

Route::get('restaurants/map', [RestaurantController::class, 'map'])->name('api.v1.restaurants.map');
Route::get('restaurants', [RestaurantController::class, 'index'])->name('api.v1.restaurants.index');
Route::get('restaurants/{slug}', [RestaurantController::class, 'show'])->name('api.v1.restaurants.show');

/*
|--------------------------------------------------------------------------
| Protected admin routes
| JWT is read from HTTP-only cookie via JwtFromCookie middleware,
| then validated by auth:api (jwt guard).
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->prefix('admin')->name('api.v1.admin.')->group(function () {

    Route::post('auth/logout',  [AuthController::class, 'logout'])->name('auth.logout');
    Route::post('auth/refresh', [AuthController::class, 'refresh'])->name('auth.refresh');
    Route::get('auth/me',       [AuthController::class, 'me'])->name('auth.me');

    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Category CRUD
    Route::apiResource('categories', AdminCategoryController::class);

    // Restaurant CRUD
    Route::apiResource('restaurants', AdminRestaurantController::class);

    // Restaurant image management
    Route::prefix('restaurants/{restaurant}/images')->name('restaurants.images.')->group(function () {
        Route::post('/',           [AdminRestaurantController::class, 'uploadImage'])->name('upload');
        Route::delete('{image}',   [AdminRestaurantController::class, 'deleteImage'])->name('destroy');
        Route::patch('reorder',    [AdminRestaurantController::class, 'reorderImages'])->name('reorder');
    });
});
