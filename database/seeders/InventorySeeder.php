<?php

namespace Database\Seeders;

use App\Enums\StockMovementType;
use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Seed demo categories, items and a stock ledger so the UI has something to show.
     */
    public function run(): void
    {
        $owner = User::query()->orderBy('id')->first();

        Category::factory()
            ->count(6)
            ->create()
            ->each(function (Category $category) use ($owner): void {
                Item::factory()
                    ->count(3)
                    ->create(['category_id' => $category->id])
                    ->each(function (Item $item) use ($owner): void {
                        if (fake()->boolean(70)) {
                            $item->recordMovement(
                                StockMovementType::In,
                                fake()->numberBetween(10, 120),
                                $owner,
                                'Seeded opening stock.',
                            );
                        }
                    });
            });
    }
}
