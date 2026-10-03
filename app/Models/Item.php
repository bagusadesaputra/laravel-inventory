<?php

namespace App\Models;

use App\Enums\ItemUnit;
use App\Enums\StockMovementType;
use Database\Factories\ItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * @property int $id
 * @property int $category_id
 * @property string $sku
 * @property string $name
 * @property ItemUnit $unit
 * @property int $stock
 * @property int $reorder_level
 */
#[Fillable(['category_id', 'sku', 'name', 'unit', 'reorder_level'])]
class Item extends Model
{
    /** @use HasFactory<ItemFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unit' => ItemUnit::class,
            'stock' => 'integer',
            'reorder_level' => 'integer',
        ];
    }

    /**
     * The category the item belongs to.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * The stock movements recorded for the item.
     *
     * @return HasMany<StockMovement, $this>
     */
    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Apply a stock movement to the item and write the audit log entry.
     *
     * The stock column and the movement row are written in one transaction so the
     * log always explains the stock shown on the item.
     *
     * @param  int  $quantity  Units moved in, or units taken out for an "out" movement.
     *
     * @throws ValidationException When the movement would take the stock below zero.
     */
    public function recordMovement(
        StockMovementType $type,
        int $quantity,
        ?User $user = null,
        ?string $note = null,
    ): StockMovement {
        return DB::transaction(function () use ($type, $quantity, $user, $note): StockMovement {
            $locked = static::query()
                ->lockForUpdate()
                ->whereKey($this->getKey())
                ->firstOrFail();

            $stockAfter = $type === StockMovementType::Out
                ? $locked->stock - $quantity
                : $locked->stock + $quantity;

            if ($stockAfter < 0) {
                throw ValidationException::withMessages([
                    'quantity' => "Stok tidak mencukupi: tersedia {$locked->stock} {$locked->unit->value}.",
                ]);
            }

            $locked->stock = $stockAfter;
            $locked->save();

            $movement = $locked->movements()->create([
                'type' => $type,
                'quantity' => $quantity,
                'stock_after' => $stockAfter,
                'note' => $note,
                'user_id' => $user?->getKey(),
            ]);

            $this->refresh();

            return $movement;
        });
    }
}
