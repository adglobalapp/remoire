<?php

namespace Database\Seeders;

use App\Models\Entry;
use App\Models\User;
use Illuminate\Database\Seeder;

class EntrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@remoire.com',
            'password' => bcrypt('password'),
        ]);

        Entry::factory()->count(20)->create([
            'user_id' => $user->id,
        ]);
    }
}
