<?php

namespace Database\Seeders;

use App\Enums\ItemUnit;
use App\Enums\StockMovementType;
use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Demo catalogue: category name => [[item name, unit, reorder level, opening stock]].
     *
     * Fixed values on purpose — a demo you can recognise beats random words. SKUs are
     * derived from the position in this list, and everything is keyed on the SKU, so the
     * seeder can run against a live database without duplicating rows or the ledger.
     *
     * @var array<string, list<array{string, ItemUnit, int, int}>>
     */
    private const CATALOG = [
        'Minuman' => [
            ['Air Mineral 600 ml', ItemUnit::Box, 20, 48],
            ['Teh Celup 25 s', ItemUnit::Pack, 15, 30],
            ['Kopi Bubuk 250 g', ItemUnit::Pack, 10, 24],
            ['Susu UHT Full Cream 1 L', ItemUnit::Box, 12, 20],
        ],
        'Makanan' => [
            ['Beras Premium 5 kg', ItemUnit::Pack, 15, 30],
            ['Minyak Goreng 2 L', ItemUnit::Pack, 10, 18],
            ['Gula Pasir 1 kg', ItemUnit::Pack, 20, 40],
            ['Mie Instan Goreng 85 g', ItemUnit::Box, 25, 50],
        ],
        'Kebersihan' => [
            ['Sabun Mandi Cair 450 ml', ItemUnit::Pack, 12, 24],
            ['Deterjen Bubuk 800 g', ItemUnit::Pack, 10, 16],
            ['Pembersih Lantai 900 ml', ItemUnit::Pack, 8, 12],
            ['Kantong Sampah 50 pcs', ItemUnit::Roll, 6, 10],
        ],
        'Alat Tulis' => [
            ['Pulpen Biru', ItemUnit::Box, 15, 30],
            ['Buku Tulis 80 Lembar', ItemUnit::Pack, 20, 40],
            ['Penghapus', ItemUnit::Box, 10, 25],
            ['Kertas A4 80 g', ItemUnit::Pack, 8, 15],
        ],
        'Kesehatan' => [
            ['Masker Medis 50 pcs', ItemUnit::Box, 10, 6],
            ['Handsanitizer 500 ml', ItemUnit::Pack, 12, 24],
            ['Vitamin C 500 mg', ItemUnit::Box, 8, 16],
            ['Termometer Digital', ItemUnit::Pcs, 5, 8],
        ],
        'Elektronik' => [
            ['Baterai AA 4 pcs', ItemUnit::Pack, 15, 30],
            ['Kabel USB-C 1 m', ItemUnit::Pcs, 10, 20],
            ['Lampu LED 9 W', ItemUnit::Pcs, 20, 40],
            ['Keyboard USB', ItemUnit::Unit, 5, 9],
        ],
    ];

    /**
     * Seed demo categories, items and a stock ledger so the UI has something to show.
     */
    public function run(): void
    {
        $owner = User::query()->orderBy('id')->first();
        $position = 0;

        foreach (self::CATALOG as $categoryName => $items) {
            $category = Category::query()->firstOrCreate(['name' => $categoryName]);

            foreach ($items as [$name, $unit, $reorderLevel, $openingStock]) {
                $position++;

                $item = Item::query()->firstOrCreate(
                    ['sku' => 'BRG-'.str_pad((string) $position, 4, '0', STR_PAD_LEFT)],
                    [
                        'category_id' => $category->getKey(),
                        'name' => $name,
                        'unit' => $unit,
                        'reorder_level' => $reorderLevel,
                    ],
                );

                // Already in the ledger: re-running must not duplicate movements.
                if (! $item->wasRecentlyCreated) {
                    continue;
                }

                $item->recordMovement(StockMovementType::In, $openingStock, $owner, 'Stok awal.');
                $item->recordMovement(
                    StockMovementType::Out,
                    max(1, intdiv($openingStock, 4)),
                    $owner,
                    'Barang keluar untuk penjualan.',
                );
            }
        }
    }
}
