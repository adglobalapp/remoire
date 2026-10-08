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

test('search results include relationship status', function () {
    $user = User::factory()->create();
    $friend = User::factory()->create(['name' => 'Bob']);
    Relationship::create([
        'user_id' => $user->id,
        'target_id' => $friend->id,
        'status' => 'accepted',
    ]);

    $this->actingAs($user)
        ->getJson('/api/relationships/search?q=Bob')
        ->assertStatus(200)
        ->assertJsonFragment([
            'name' => 'Bob',
            'relationship_status' => 'accepted',
        ]);
});

test('authenticated user can send friend request', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/relationships', ['target_id' => $target->id])
        ->assertStatus(200)
        ->assertJson(['message' => 'Request sent']);

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

test('blocked user cannot remove the block placed on them', function () {
    $blocker = User::factory()->create();
    $blocked = User::factory()->create();
    Relationship::create(['user_id' => $blocker->id, 'target_id' => $blocked->id, 'status' => 'blocked']);

    $this->actingAs($blocked)
        ->deleteJson("/api/relationships/{$blocker->id}")
        ->assertStatus(404);

    $this->assertDatabaseHas('relationships', [
        'user_id' => $blocker->id,
        'target_id' => $blocked->id,
        'status' => 'blocked',
    ]);
});

test('blocking back keeps the other users block', function () {
    $first = User::factory()->create();
    $second = User::factory()->create();
    Relationship::create(['user_id' => $first->id, 'target_id' => $second->id, 'status' => 'blocked']);

    $this->actingAs($second)
        ->postJson("/api/relationships/{$first->id}/block")
        ->assertStatus(200);

    $this->assertDatabaseHas('relationships', ['user_id' => $first->id, 'target_id' => $second->id, 'status' => 'blocked']);
    $this->assertDatabaseHas('relationships', ['user_id' => $second->id, 'target_id' => $first->id, 'status' => 'blocked']);
});

test('friend request notification is removed once the request is answered', function (string $action) {
    $requester = User::factory()->create();
    $target = User::factory()->create();

    $this->actingAs($requester)->postJson('/api/relationships', ['target_id' => $target->id])->assertStatus(200);
    $this->assertDatabaseHas('notifications', ['user_id' => $target->id, 'type' => 'friend_request']);

    match ($action) {
        'accept' => $this->actingAs($target)->postJson("/api/relationships/{$requester->id}/accept"),
        'reject' => $this->actingAs($target)->deleteJson("/api/relationships/{$requester->id}"),
        'cancel' => $this->actingAs($requester)->deleteJson("/api/relationships/{$target->id}"),
        'block' => $this->actingAs($target)->postJson("/api/relationships/{$requester->id}/block"),
    };

    $this->assertDatabaseMissing('notifications', ['user_id' => $target->id, 'type' => 'friend_request']);
})->with(['accept', 'reject', 'cancel', 'block']);
