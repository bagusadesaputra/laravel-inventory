<?php

namespace App\Http\Controllers\Inventory;

use App\Enums\ItemUnit;
use App\Enums\StockMovementType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreItemRequest;
use App\Http\Requests\Inventory\UpdateItemRequest;
use App\Models\Category;
use App\Models\Item;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    /**
     * List items, filtered by free text search and category.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $categoryId = $request->integer('category');

        $items = Item::query()
            ->with('category:id,name')
            ->when($search, fn ($query, $term) => $query->where(
                fn ($q) => $q->where('name', 'like', "%{$term}%")->orWhere('sku', 'like', "%{$term}%"),
            ))
            ->when($categoryId, fn ($query, $id) => $query->where('category_id', $id))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('inventory/items/index', [
            'items' => $items,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * Show the item, its stock figure and its audit trail.
     */
    public function show(Item $item): Response
    {
        return Inertia::render('inventory/items/show', [
            'item' => $item->load('category:id,name'),
            'movements' => $item->movements()
                ->with('user:id,name')
                ->latest('id')
                ->paginate(10),
        ]);
    }

    /**
     * Show the form to create an item.
     */
    public function create(): Response
    {
        return Inertia::render('inventory/items/create', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'units' => array_column(ItemUnit::cases(), 'value'),
        ]);
    }

    /**
     * Persist a new item, opening its stock ledger when a starting stock is given.
     */
    public function store(StoreItemRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $initialStock = (int) ($validated['initial_stock'] ?? 0);
        unset($validated['initial_stock']);

        $item = Item::create($validated);

        if ($initialStock > 0) {
            $item->recordMovement(StockMovementType::In, $initialStock, $request->user(), 'Stok awal.');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Barang berhasil dibuat.']);

        return redirect()->route('inventory.items.show', $item);
    }

    /**
     * Show the form to edit the given item.
     */
    public function edit(Item $item): Response
    {
        return Inertia::render('inventory/items/edit', [
            'item' => $item->load('category:id,name'),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'units' => array_column(ItemUnit::cases(), 'value'),
        ]);
    }

    /**
     * Update the given item. Stock is never touched here.
     */
    public function update(UpdateItemRequest $request, Item $item): RedirectResponse
    {
        $item->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Barang berhasil diperbarui.']);

        return redirect()->route('inventory.items.show', $item);
    }

    /**
     * Remove the given item once its stock history is empty.
     */
    public function destroy(Item $item): RedirectResponse
    {
        if ($item->movements()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Barang ini memiliki riwayat stok dan tidak dapat dihapus.',
            ]);

            return back();
        }

        $item->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Barang berhasil dihapus.']);

        return redirect()->route('inventory.items.index');
    }
}
