<?php

use App\Models\Entry;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Carbon;

afterEach(function () {
    Carbon::setTestNow();
});

function anniversaryCount(User $user): int
{
    return Notification::where('user_id', $user->id)->where('type', 'anniversary')->count();
}

test('anniversary notification is created for an entry from a previous year', function () {
    Carbon::setTestNow('2026-05-10 12:00:00');
    $user = User::factory()->create();
    $entry = Entry::factory()->create(['user_id' => $user->id, 'date' => '2024-05-10']);

    $this->actingAs($user)->getJson('/api/notifications')->assertStatus(200);

    $notification = Notification::where('user_id', $user->id)->where('type', 'anniversary')->sole();
    expect($notification->data['entry_id'])->toBe($entry->id)
        ->and($notification->data['years'])->toBe(2);
});

test('anniversary notification is only created once per day', function () {
    Carbon::setTestNow('2026-05-10 12:00:00');
    $user = User::factory()->create();
    Entry::factory()->create(['user_id' => $user->id, 'date' => '2025-05-10']);

    $this->actingAs($user)->getJson('/api/notifications');
    $this->actingAs($user)->getJson('/api/entries');

    expect(anniversaryCount($user))->toBe(1);
});

test('deleted anniversary notification does not come back the same day', function () {
    Carbon::setTestNow('2026-05-10 12:00:00');
    $user = User::factory()->create();
    Entry::factory()->create(['user_id' => $user->id, 'date' => '2025-05-10']);

    $this->actingAs($user)->getJson('/api/notifications');
    $notification = Notification::where('user_id', $user->id)->where('type', 'anniversary')->sole();

    $this->actingAs($user)->deleteJson("/api/notifications/{$notification->id}")->assertStatus(200);
    $this->actingAs($user)->getJson('/api/notifications')->assertJsonCount(0);

    expect(anniversaryCount($user))->toBe(0);
});

test('anniversary is checked again on the next day', function () {
    Carbon::setTestNow('2026-05-10 12:00:00');
    $user = User::factory()->create();
    Entry::factory()->create(['user_id' => $user->id, 'date' => '2025-05-11']);

    $this->actingAs($user)->getJson('/api/notifications');
    expect(anniversaryCount($user))->toBe(0);

    Carbon::setTestNow('2026-05-11 08:00:00');
    $this->actingAs($user)->getJson('/api/notifications');
    expect(anniversaryCount($user))->toBe(1);
});

test('logging in does not prevent the anniversary check', function () {
    Carbon::setTestNow('2026-05-10 12:00:00');
    $user = User::factory()->create(['email' => 'anniv@example.com', 'password' => 'password']);
    Entry::factory()->create(['user_id' => $user->id, 'date' => '2025-05-10']);

    $token = $this->postJson('/api/auth/login', ['email' => 'anniv@example.com', 'password' => 'password'])
        ->assertStatus(200)
        ->json('access_token');

    $this->withToken($token)->getJson('/api/notifications')->assertJsonCount(1);
});

test('entry from today does not create an anniversary notification', function () {
    Carbon::setTestNow('2026-05-10 12:00:00');
    $user = User::factory()->create();
    Entry::factory()->create(['user_id' => $user->id, 'date' => '2026-05-10']);

    $this->actingAs($user)->getJson('/api/notifications');

    expect(anniversaryCount($user))->toBe(0);
});

test('leap day entry gets its anniversary on february 28 in non-leap years', function () {
    Carbon::setTestNow('2026-02-28 12:00:00');
    $user = User::factory()->create();
    Entry::factory()->create(['user_id' => $user->id, 'date' => '2024-02-29']);

    $this->actingAs($user)->getJson('/api/notifications');

    expect(anniversaryCount($user))->toBe(1);
});

test('leap day entry is not notified twice in leap years', function () {
    Carbon::setTestNow('2028-02-28 12:00:00');
    $user = User::factory()->create();
    Entry::factory()->create(['user_id' => $user->id, 'date' => '2024-02-29']);

    $this->actingAs($user)->getJson('/api/notifications');
    expect(anniversaryCount($user))->toBe(0);

    Carbon::setTestNow('2028-02-29 12:00:00');
    $this->actingAs($user)->getJson('/api/notifications');
    expect(anniversaryCount($user))->toBe(1);
});

test('deleting an entry removes its anniversary notifications', function () {
    Carbon::setTestNow('2026-05-10 12:00:00');
    $user = User::factory()->create();
    $entry = Entry::factory()->create(['user_id' => $user->id, 'date' => '2025-05-10']);

    $this->actingAs($user)->getJson('/api/notifications');
    expect(anniversaryCount($user))->toBe(1);

    $this->actingAs($user)->deleteJson("/api/entries/{$entry->id}")->assertStatus(200);

    expect(anniversaryCount($user))->toBe(0);
});
