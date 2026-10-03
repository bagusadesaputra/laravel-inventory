<?php

use App\Models\Category;
use App\Models\Item;
use App\Models\StockMovement;
use Database\Seeders\InventorySeeder;

test('seeds a demo catalogue with a balanced stock ledger', function () {
    (new InventorySeeder)->run();

    expect(Item::query()->where('sku', 'BRG-0001')->exists())->toBeTrue()
        ->and(Item::query()->count())->toBe(24)
        ->and(Category::query()->count())->toBe(6);

    $bar = Item::query()->where('sku', 'BRG-0001')->sole();

    expect($bar->movements()->count())->toBe(2)
        ->and($bar->stock)->toBe($bar->movements()->latest('id')->first()->stock_after);
});

test('is safe to run on a database that already has the catalogue', function () {
    (new InventorySeeder)->run();

    $counts = [Category::count(), Item::count(), StockMovement::count()];

    (new InventorySeeder)->run();

    expect([Category::count(), Item::count(), StockMovement::count()])->toBe($counts);
});
