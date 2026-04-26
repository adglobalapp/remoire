<?php

namespace Database\Seeders;

use App\Models\Entry;
use App\Models\Note;
use App\Models\Relationship;
use App\Models\Timeline;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MockDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $mainUser = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::needsRehash('password') ? Hash::make('password') : 'password',
                'bio' => 'Journaling my experiences and memories. Interested in travel and photography.',
                'avatar_url' => 'https://i.pravatar.cc/300?u=test@example.com',
            ]
        );

        $users = User::factory(20)->create();

        $acceptedFriends = $users->random(10);
        foreach ($acceptedFriends as $friend) {
            Relationship::create([
                'user_id' => $mainUser->id,
                'target_id' => $friend->id,
                'status' => 'accepted',
            ]);
        }

        $incomingRequests = $users->diff($acceptedFriends)->random(5);
        foreach ($incomingRequests as $requestor) {
            Relationship::create([
                'user_id' => $requestor->id,
                'target_id' => $mainUser->id,
                'status' => 'pending',
            ]);
        }

        $outgoingRequests = $users->diff($acceptedFriends)->diff($incomingRequests)->random(3);
        foreach ($outgoingRequests as $recipient) {
            Relationship::create([
                'user_id' => $mainUser->id,
                'target_id' => $recipient->id,
                'status' => 'pending',
            ]);
        }

        $defaultTimeline = Timeline::create([
            'user_id' => $mainUser->id,
            'name' => 'All Entries',
            'is_default' => true,
        ]);

        $travelTimeline = Timeline::create([
            'user_id' => $mainUser->id,
            'name' => 'European Travels 2024',
            'is_default' => false,
        ]);

        $cookingTimeline = Timeline::create([
            'user_id' => $mainUser->id,
            'name' => 'Cooking',
            'is_default' => false,
        ]);

        $familyTimeline = Timeline::create([
            'user_id' => $mainUser->id,
            'name' => 'Family Archives',
            'is_default' => false,
        ]);

        $timelines = [$travelTimeline, $cookingTimeline, $familyTimeline];

        $entries = collect();
        for ($i = 0; $i < 50; $i++) {
            $createdAt = match (true) {
                $i < 5 => Carbon::now(),
                $i < 15 => Carbon::now()->subDays(rand(1, 25)),
                $i < 30 => Carbon::now()->subMonths(rand(1, 10)),
                default => Carbon::now()->subYears(rand(1, 2)),
            };

            $entries->push(Entry::factory()->create([
                'user_id' => $mainUser->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]));
        }

        $specialEntries = [
            ['title' => 'Sunset in Santorini', 'color' => '#f8a5c2'],
            ['title' => 'First Homemade Lasagna', 'color' => '#fab387'],
            ['title' => 'Grandpa\'s 90th Birthday', 'color' => '#cba6f7'],
            ['title' => 'Rainy Day in Paris', 'color' => '#89dceb'],
            ['title' => 'Brewing the Perfect Cup', 'color' => '#f9e2af'],
        ];

        foreach ($entries as $index => $entry) {

            if ($index < count($specialEntries)) {
                $entry->update($specialEntries[$index]);
            }

            if (fake()->boolean(70)) {
                $randomTimeline = $timelines[array_rand($timelines)];
                $entry->timelines()->attach($randomTimeline->id);
            }

            $entry->timelines()->syncWithoutDetaching([$defaultTimeline->id]);

            if (fake()->boolean(60)) {
                $participants = $acceptedFriends->random(fake()->numberBetween(1, 3));
                $entry->participants()->attach($participants->pluck('id'));
            }

            if (fake()->boolean(40)) {
                $imgId = fake()->numberBetween(1, 1000);
                $entry->update(['image_url' => "https://picsum.photos/seed/{$imgId}/800/600"]);
            }
        }

        for ($i = 0; $i < 40; $i++) {
            $createdAt = Carbon::now()->subDays(rand(0, 730));
            $entry = Entry::factory()->create([
                'user_id' => $mainUser->id,
                'location_name' => 'Budapest, Hungary',
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
            $entry->update([
                'latitude' => 47.4979 + fake()->randomFloat(4, -0.05, 0.05),
                'longitude' => 19.0402 + fake()->randomFloat(4, -0.05, 0.05),
            ]);
            $entry->timelines()->syncWithoutDetaching([$defaultTimeline->id]);
        }

        $notesData = [
            ['title' => 'Shopping List', 'content' => "Milk\nEggs\nBread\nButter", 'color' => '#f9e2af', 'is_pinned' => true],
            ['title' => 'Project Ideas', 'content' => "Refactor the authentication flow.\nAdd drag and drop to notes.\nImprove the UI animations.", 'color' => '#89dceb', 'is_pinned' => false],
            ['title' => 'Weekly Meeting', 'content' => 'Discuss the new features for the upcoming sprint. Review the bug reports from yesterday.', 'color' => '#cba6f7', 'is_pinned' => false],
            ['title' => 'Movies to Watch', 'content' => "Dune: Part Two\nOppenheimer\nPoor Things", 'color' => '#f8a5c2', 'is_pinned' => true],
            ['title' => 'Workout Plan', 'content' => "Monday: Chest & Triceps\nWednesday: Back & Biceps\nFriday: Legs & Core", 'color' => '#a6e3a1', 'is_pinned' => false],
            ['title' => 'Quick Reminder', 'content' => 'Call mom at 5 PM.', 'color' => '#fab387', 'is_pinned' => false],
        ];

        foreach ($notesData as $note) {
            Note::create(array_merge($note, ['user_id' => $mainUser->id]));
        }
    }
}
