<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EntryController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\TimelineController;

// Auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::apiResource('entries', EntryController::class);
    Route::post('/upload', [UploadController::class, 'store']);

    Route::apiResource('timelines', TimelineController::class);
    Route::post('/timelines/{timeline}/entries/{entry}', [TimelineController::class, 'addEntry']);
    Route::delete('/timelines/{timeline}/entries/{entry}', [TimelineController::class, 'removeEntry']);
});