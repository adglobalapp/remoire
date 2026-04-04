<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Entry>
 */
class EntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'title' => fake()->sentence(fake()->numberBetween(2, 5)),
            'date' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'content' => fake()->paragraph(fake()->numberBetween(3, 8)),
            'image_url' => null,
            'color' => fake()->hexColor(),
        ];
    }
}
