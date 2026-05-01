<?php

use App\Models\Notification;
use App\Models\User;

test('user can list their notifications', function () {
    $user = User::factory()->create();
    Notification::create([
        'user_id' => $user->id,
        'type' => 'friend_request',
        'data' => ['requester_name' => 'Test User'],
    ]);

    $this->actingAs($user)
        ->getJson('/api/notifications')
        ->assertStatus(200)
        ->assertJsonCount(1);
});

test('user can mark notification as read', function () {
    $user = User::factory()->create();
    $notification = Notification::create([
        'user_id' => $user->id,
        'type' => 'anniversary',
        'data' => ['entry_title' => 'Memory'],
    ]);

    $this->actingAs($user)
        ->putJson("/api/notifications/{$notification->id}/read")
        ->assertStatus(200);

    $this->assertNotNull($notification->refresh()->read_at);
});

test('user can delete notification', function () {
    $user = User::factory()->create();
    $notification = Notification::create([
        'user_id' => $user->id,
        'type' => 'friend_request',
        'data' => ['requester_name' => 'Other User'],
    ]);

    $this->actingAs($user)
        ->deleteJson("/api/notifications/{$notification->id}")
        ->assertStatus(200);

    $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
});
