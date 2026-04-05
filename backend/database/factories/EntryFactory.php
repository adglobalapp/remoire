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
        $titleText = fake()->sentence(3);
        $bodyText = fake()->paragraph(fake()->numberBetween(2, 4));
        
        // Structure expected by EntryController::extractTitle and the frontend editor
        $contentJSON = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'heading',
                    'attrs' => ['level' => 1],
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => $titleText
                        ]
                    ]
                ],
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => $bodyText
                        ]
                    ]
                ]
            ]
        ];

        return [
            'user_id' => \App\Models\User::factory(),
            'title' => 'Untitled', // Will be overwritten by the 'saving' event in the Entry model
            'date' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'content' => json_encode(['contentJSON' => $contentJSON]),
            'image_url' => null,
            'color' => fake()->hexColor(),
        ];
    }
}
