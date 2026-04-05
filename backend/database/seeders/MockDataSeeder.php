<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Entry;
use App\Models\Timeline;
use App\Models\Friend;
use App\Models\Note;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MockDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Main User
        $mainUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Digitizing my life memories one entry at a time. Lover of travel, coffee, and archival photography.',
            'avatar_url' => 'https://i.pravatar.cc/300?u=test@example.com',
        ]);

        // 2. Create 20 Mock Users (potential friends)
        $users = User::factory(20)->create();

        // 3. Establish Friendships for Main User
        // Accepted Friends (10)
        $acceptedFriends = $users->random(10);
        foreach ($acceptedFriends as $friend) {
            Friend::create([
                'user_id' => $mainUser->id,
                'friend_id' => $friend->id,
                'status' => 'accepted'
            ]);
        }

        // Pending Incoming Requests (5) - Others wanting to be friends with Main User
        $incomingRequests = $users->diff($acceptedFriends)->random(5);
        foreach ($incomingRequests as $requestor) {
            Friend::create([
                'user_id' => $requestor->id,
                'friend_id' => $mainUser->id,
                'status' => 'pending'
            ]);
        }

        // Pending Outgoing Requests (3) - Main User wanting to be friends with others
        $outgoingRequests = $users->diff($acceptedFriends)->diff($incomingRequests)->random(3);
        foreach ($outgoingRequests as $recipient) {
            Friend::create([
                'user_id' => $mainUser->id,
                'friend_id' => $recipient->id,
                'status' => 'pending'
            ]);
        }

        // 4. Create Timelines for Main User
        $defaultTimeline = Timeline::create([
            'user_id' => $mainUser->id,
            'name' => 'All Entries',
            'is_default' => true
        ]);

        $travelTimeline = Timeline::create([
            'user_id' => $mainUser->id,
            'name' => 'European Travels 2024',
            'is_default' => false
        ]);

        $cookingTimeline = Timeline::create([
            'user_id' => $mainUser->id,
            'name' => 'My Cooking Journey',
            'is_default' => false
        ]);

        $familyTimeline = Timeline::create([
            'user_id' => $mainUser->id,
            'name' => 'Family Archives',
            'is_default' => false
        ]);

        $timelines = [$travelTimeline, $cookingTimeline, $familyTimeline];

        // 5. Create Entries for Main User
        $entries = Entry::factory(25)->create([
            'user_id' => $mainUser->id
        ]);

        // Evocative titles and content for some entries
        $specialEntries = [
            ['title' => 'Sunset in Santorini', 'color' => '#f8a5c2'],
            ['title' => 'First Homemade Lasagna', 'color' => '#fab387'],
            ['title' => 'Grandpa\'s 90th Birthday', 'color' => '#cba6f7'],
            ['title' => 'Rainy Day in Paris', 'color' => '#89dceb'],
            ['title' => 'Brewing the Perfect Cup', 'color' => '#f9e2af'],
        ];

        foreach ($entries as $index => $entry) {
            // Apply special titles to some
            if ($index < count($specialEntries)) {
                $entry->update($specialEntries[$index]);
            }

            // Randomly assign to 1-2 custom timelines
            if (fake()->boolean(70)) {
                $randomTimeline = $timelines[array_rand($timelines)];
                $entry->timelines()->attach($randomTimeline->id);
            }

            // Always add to default timeline (logic usually handled by app, but good for seeding)
            $entry->timelines()->syncWithoutDetaching([$defaultTimeline->id]);

            // Randomly assign 1-3 participants from accepted friends
            if (fake()->boolean(60)) {
                $participants = $acceptedFriends->random(fake()->numberBetween(1, 3));
                $entry->participants()->attach($participants->pluck('id'));
            }

            // Add some "placeholder" images to some entries for visualization
            if (fake()->boolean(40)) {
                $imgId = fake()->numberBetween(1, 1000);
                $entry->update(['image_url' => "https://picsum.photos/seed/{$imgId}/800/600"]);
            }
        }

        // 6. Create some shared entries where Main User is a participant
        foreach ($acceptedFriends->random(5) as $friend) {
            $friendEntry = Entry::factory()->create([
                'user_id' => $friend->id,
                'title' => "Shared with " . $mainUser->name
            ]);
            $friendEntry->participants()->attach($mainUser->id);
        }

        // 7. Create Notes for Main User
        $notesData = [
            ['title' => 'Shopping List', 'type' => 'text', 'content' => "Milk\nEggs\nBread\nButter", 'color' => '#f9e2af', 'is_pinned' => true],
            ['title' => 'Project Ideas', 'type' => 'text', 'content' => "Refactor the authentication flow.\nAdd drag and drop to notes.\nImprove the UI animations.", 'color' => '#89dceb', 'is_pinned' => false],
            ['title' => 'Weekly Meeting', 'type' => 'text', 'content' => "Discuss the new features for the upcoming sprint. Review the bug reports from yesterday.", 'color' => '#cba6f7', 'is_pinned' => false],
            ['title' => 'Movies to Watch', 'type' => 'text', 'content' => "Dune: Part Two\nOppenheimer\nPoor Things", 'color' => '#f8a5c2', 'is_pinned' => true],
            ['title' => 'Workout Plan', 'type' => 'text', 'content' => "Monday: Chest & Triceps\nWednesday: Back & Biceps\nFriday: Legs & Core", 'color' => '#a6e3a1', 'is_pinned' => false],
            ['title' => 'Quick Reminder', 'type' => 'text', 'content' => "Call mom at 5 PM.", 'color' => '#fab387', 'is_pinned' => false]
        ];

        foreach ($notesData as $note) {
            Note::create(array_merge($note, ['user_id' => $mainUser->id]));
        }
    }
}
