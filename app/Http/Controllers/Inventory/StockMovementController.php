<?php

namespace App\Http\Controllers\Inventory;

use App\Enums\StockMovementType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreStockMovementRequest;
use App\Models\Item;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class StockMovementController extends Controller
{
    /**
     * Record a stock in or stock out against the item.
     */
    public function store(StoreStockMovementRequest $request, Item $item): RedirectResponse
    {
        $validated = $request->validated();

        $item->recordMovement(
            StockMovementType::from($validated['type']),
            (int) $validated['quantity'],
            $request->user(),
            $validated['note'] ?? null,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pergerakan stok berhasil dicatat.']);

        return redirect()->route('inventory.items.show', $item);
    }
}
