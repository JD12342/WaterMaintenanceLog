<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\StatusManagementService;

class StatusManagementServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(StatusManagementService::class, function ($app) {
            return new StatusManagementService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}