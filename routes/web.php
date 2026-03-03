<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Frontend routes using Inertia.js + React
Route::get('/', function () {
    return Inertia::render('Home');
});

// Catch-all route for React SPA routing (should be last)
Route::get('/{any}', function () {
    return Inertia::render('Home');
})->where('any', '.*');
