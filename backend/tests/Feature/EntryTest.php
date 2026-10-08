<?php

use App\Models\Entry;
use App\Models\Timeline;
use App\Models\User;

test('authenticated user can list their entries', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $content = json_encode([
        'contentJSON' => [
            'type' => 'doc',
            'content' => [['type' => 'text', 'text' => 'My Entry']],
        ],
    ]);

    Entry::factory()->create(['user_id' => $user->id, 'content' => $content]);
    Entry::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($user)
        ->getJson('/api/entries')
        ->assertStatus(200)
        ->assertJsonCount(1)
        ->assertJsonFragment(['title' => 'My Entry']);
});

test('user can see entries where they are participants', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();

    $content = json_encode([
        'contentJSON' => [
            'type' => 'doc',
            'content' => [['type' => 'text', 'text' => 'Shared Entry']],
        ],
    ]);

    $entry = Entry::factory()->create(['user_id' => $owner->id, 'content' => $content]);

    $entry->participants()->attach($user->id);

    $this->actingAs($user)
        ->getJson('/api/entries')
        ->assertStatus(200)
        ->assertJsonFragment(['title' => 'Shared Entry']);
});

test('user can create an entry with participants', function () {
    $user = User::factory()->create();
    $friend = User::factory()->create();

    $entryData = [
        'date' => '2026-04-24',
        'content' => json_encode([
            'contentJSON' => [
                'type' => 'doc',
                'content' => [['type' => 'text', 'text' => 'Buli']],
            ],
        ]),
        'participant_ids' => [$friend->id],
    ];

    $this->actingAs($user)
        ->postJson('/api/entries', $entryData)
        ->assertStatus(201)
        ->assertJsonFragment(['title' => 'Buli']);

    $this->assertDatabaseHas('entries', ['title' => 'Buli', 'user_id' => $user->id]);
    $this->assertDatabaseHas('entry_user', ['user_id' => $friend->id]);
});

test('user cannot update other user\'s entry', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();
    $entry = Entry::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($user)
        ->putJson("/api/entries/{$entry->id}", ['title' => 'Hacked'])
        ->assertStatus(403);
});

test('owner can delete their entry', function () {
    $user = User::factory()->create();
    $entry = Entry::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->deleteJson("/api/entries/{$entry->id}")
        ->assertStatus(200);

    $this->assertDatabaseMissing('entries', ['id' => $entry->id]);
});

test('entry without title and content is saved as untitled', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/entries', ['date' => '2026-05-10'])
        ->assertStatus(201)
        ->assertJsonFragment(['title' => 'Untitled']);
});

test('removed participant loses the entry from their timelines', function () {
    $owner = User::factory()->create();
    $participant = User::factory()->create();
    $entry = Entry::factory()->create(['user_id' => $owner->id]);
    $entry->participants()->attach($participant->id);

    $ownerTimeline = Timeline::create(['user_id' => $owner->id, 'name' => 'Mine']);
    $participantTimeline = Timeline::create(['user_id' => $participant->id, 'name' => 'Theirs']);
    $ownerTimeline->entries()->attach($entry->id);
    $participantTimeline->entries()->attach($entry->id);

    $this->actingAs($owner)
        ->putJson("/api/entries/{$entry->id}", ['participant_ids' => []])
        ->assertStatus(200);

    expect($participantTimeline->entries()->count())->toBe(0)
        ->and($ownerTimeline->entries()->count())->toBe(1);
});
