<?php

namespace Database\Factories;

use App\Enums\StockMovementType;
use App\Models\Item;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Log row only: it does not touch the item's stock. Use Item::recordMovement()
 * whenever the ledger has to balance.
 *
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'item_id' => Item::factory(),
            'user_id' => User::factory(),
            'type' => StockMovementType::In,
            'quantity' => fake()->numberBetween(1, 20),
            'stock_after' => 1,
            'note' => fake()->sentence(3),
        ];
    }
}
