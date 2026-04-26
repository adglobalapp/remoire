<?php

use App\Models\Note;
use App\Models\User;

test('guest cannot see notes', function () {
    $this->getJson('/api/notes')
        ->assertStatus(401);
});

test('authenticated user can see only their notes', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Note::factory()->create(['user_id' => $user->id, 'title' => 'User Note']);
    Note::factory()->create(['user_id' => $otherUser->id, 'title' => 'Other Note']);

    $this->actingAs($user)
        ->getJson('/api/notes')
        ->assertStatus(200)
        ->assertJsonCount(1)
        ->assertJsonFragment(['title' => 'User Note'])
        ->assertJsonMissing(['title' => 'Other Note']);
});

test('authenticated user can create a note', function () {
    $user = User::factory()->create();

    $noteData = [
        'title' => 'New Note',
        'content' => 'Note content',
        'color' => '#ffffff',
        'is_pinned' => false,
    ];

    $this->actingAs($user)
        ->postJson('/api/notes', $noteData)
        ->assertStatus(201)
        ->assertJsonFragment(['title' => 'New Note']);

    $this->assertDatabaseHas('notes', [
        'user_id' => $user->id,
        'title' => 'New Note',
    ]);
});

test('user cannot update other user\'s note', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $note = Note::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($user)
        ->putJson("/api/notes/{$note->id}", ['title' => 'Updated Title'])
        ->assertStatus(403);
});

test('user can delete their own note', function () {
    $user = User::factory()->create();
    $note = Note::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->deleteJson("/api/notes/{$note->id}")
        ->assertStatus(200)
        ->assertJson(['message' => 'Note deleted']);

    $this->assertDatabaseMissing('notes', ['id' => $note->id]);
});
