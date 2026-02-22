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
            'user_id' => 1,
            'title' => fake()->sentence(3),
            'date' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'content' => fake()->paragraph(5),
            'image_url' => null,
        ];
    }
}
