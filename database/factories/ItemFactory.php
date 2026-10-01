<?php

namespace Database\Factories;

use App\Enums\ItemUnit;
use App\Models\Category;
use App\Models\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Item>
 */
class ItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-####??')),
            'name' => ucwords(rtrim(fake()->sentence(3), '.')),
            'unit' => fake()->randomElement(ItemUnit::cases()),
            'stock' => 0,
            'reorder_level' => fake()->numberBetween(0, 10),
        ];
    }
}
