<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Entry;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/entries', function () {
    return Entry::orderBy('date', 'desc')->get();
});