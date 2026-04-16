<?php

namespace Database\Factories;

use App\Models\Relationship;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Relationship>
 */
class RelationshipFactory extends Factory
{
    protected $model = Relationship::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'target_id' => User::factory(),
            'status' => 'pending',
        ];
    }
}
