<?php

use App\Models\Entry;
use App\Models\Timeline;
use App\Models\User;

test('authenticated user can list their timelines', function () {
    $user = User::factory()->create();
    Timeline::factory()->create(['user_id' => $user->id, 'name' => 'Custom Timeline']);

    $this->actingAs($user)
        ->getJson('/api/timelines')
        ->assertStatus(200)
        ->assertJsonFragment(['name' => 'Custom Timeline']);
});

test('index creates a default timeline if none exists', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/timelines')
        ->assertStatus(200)
        ->assertJsonFragment(['name' => 'All Entries', 'isDefault' => true]);

    $this->assertDatabaseHas('timelines', ['user_id' => $user->id, 'is_default' => true]);
});

test('user can create a new timeline', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/timelines', ['name' => 'Vacation'])
        ->assertStatus(201)
        ->assertJsonFragment(['name' => 'Vacation']);

    $this->assertDatabaseHas('timelines', ['name' => 'Vacation', 'user_id' => $user->id]);
});

test('user can add entry to timeline', function () {
    $user = User::factory()->create();
    $timeline = Timeline::factory()->create(['user_id' => $user->id]);
    $entry = Entry::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->postJson("/api/timelines/{$timeline->id}/entries/{$entry->id}")
        ->assertStatus(200);

    $this->assertDatabaseHas('entry_timeline', [
        'timeline_id' => $timeline->id,
        'entry_id' => $entry->id,
    ]);
});

test('user cannot add other user\'s entry to their timeline', function () {
    $user = User::factory()->create();
    $timeline = Timeline::factory()->create(['user_id' => $user->id]);
    $otherUser = User::factory()->create();
    $otherEntry = Entry::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($user)
        ->postJson("/api/timelines/{$timeline->id}/entries/{$otherEntry->id}")
        ->assertStatus(403);
});

test('user cannot delete default timeline', function () {
    $user = User::factory()->create();
    $timeline = Timeline::factory()->create(['user_id' => $user->id, 'is_default' => true]);

    $this->actingAs($user)
        ->deleteJson("/api/timelines/{$timeline->id}")
        ->assertStatus(400);
});
