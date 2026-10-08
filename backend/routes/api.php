<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EntryController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RelationshipController;
use App\Http\Controllers\TimelineController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

// Auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'last_seen'])->group(function () {
    // Photo upload route
    Route::post('/upload', [UploadController::class, 'store']);

    // Auth routes
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Entry routes
    Route::apiResource('entries', EntryController::class);

    // Timeline routes
    Route::apiResource('timelines', TimelineController::class);
    Route::post('/timelines/{timeline}/entries/{entry}', [TimelineController::class, 'addEntry']);
    Route::delete('/timelines/{timeline}/entries/{entry}', [TimelineController::class, 'removeEntry']);

    // Note routes
    Route::apiResource('notes', NoteController::class);

    // Relationship routes
    Route::get('/relationships', [RelationshipController::class, 'index']);
    Route::get('/relationships/requests', [RelationshipController::class, 'requests']);
    Route::get('/relationships/search', [RelationshipController::class, 'search']);
    Route::post('/relationships', [RelationshipController::class, 'store']);
    Route::post('/relationships/{user}/accept', [RelationshipController::class, 'accept']);
    Route::delete('/relationships/{user}', [RelationshipController::class, 'destroy']);
    Route::post('/relationships/{user}/block', [RelationshipController::class, 'block']);

    // Profile routes
    Route::put('/user/profile', [ProfileController::class, 'update']);
    Route::put('/user/password', [ProfileController::class, 'updatePassword']);
    Route::get('/user/blocked', [ProfileController::class, 'blockedUsers']);
    Route::delete('/user/blocked/{user}', [ProfileController::class, 'unblock']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
});
