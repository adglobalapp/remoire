<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EntryController;

use App\Http\Controllers\UploadController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('entries', EntryController::class);
Route::post('/upload', [UploadController::class, 'store']);