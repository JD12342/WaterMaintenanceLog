<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\StatusManagementServiceProvider;

return [
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    StatusManagementServiceProvider::class,
];
