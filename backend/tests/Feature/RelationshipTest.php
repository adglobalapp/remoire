<?php

use App\Models\Relationship;
use App\Models\User;

test('authenticated user can search for other users', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create(['name' => 'Alice']);

    $this->actingAs($user)
        ->getJson('/api/relationships/search?q=Alice')
        ->assertStatus(200)
        ->assertJsonFragment(['name' => 'Alice']);
});

test('authenticated user can send friend request', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/relationships', ['target_id' => $target->id])
        ->assertStatus(200)
        ->assertJson(['message' => 'Connection request sent.']);

    $this->assertDatabaseHas('relationships', [
        'user_id' => $user->id,
        'target_id' => $target->id,
        'status' => 'pending',
    ]);
});

test('authenticated user can accept friend request', function () {
    $user = User::factory()->create();
    $requester = User::factory()->create();

    Relationship::create([
        'user_id' => $requester->id,
        'target_id' => $user->id,
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->postJson("/api/relationships/{$requester->id}/accept")
        ->assertStatus(200);

    $this->assertDatabaseHas('relationships', [
        'user_id' => $requester->id,
        'target_id' => $user->id,
        'status' => 'accepted',
    ]);
});

test('user can block another user', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();

    $this->actingAs($user)
        ->postJson("/api/relationships/{$target->id}/block")
        ->assertStatus(200);

    $this->assertDatabaseHas('relationships', [
        'user_id' => $user->id,
        'target_id' => $target->id,
        'status' => 'blocked',
    ]);
});
