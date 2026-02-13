<?php

namespace App\Providers;

use App\Contracts\Repositories\CategoryRepositoryInterface;
use App\Contracts\Repositories\RestaurantRepositoryInterface;
use App\Contracts\Services\CategoryServiceInterface;
use App\Contracts\Services\RestaurantServiceInterface;
use App\Repositories\CategoryRepository;
use App\Repositories\RestaurantRepository;
use App\Services\CategoryService;
use App\Services\RestaurantService;
use Illuminate\Support\ServiceProvider;

/**
 * Binds Interfaces → Concrete implementations.
 * Dependency Inversion Principle — controllers/services depend on abstractions.
 */
class RepositoryServiceProvider extends ServiceProvider
{
    public array $bindings = [
        // Repositories
        CategoryRepositoryInterface::class   => CategoryRepository::class,
        RestaurantRepositoryInterface::class => RestaurantRepository::class,

        // Services
        CategoryServiceInterface::class      => CategoryService::class,
        RestaurantServiceInterface::class    => RestaurantService::class,
    ];
}
