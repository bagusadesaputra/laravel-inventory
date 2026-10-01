<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\StockMovement;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the inventory summary and the most recent stock movements.
     */
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'totalItems' => Item::count(),
                'lowStock' => Item::query()
                    ->where('reorder_level', '>', 0)
                    ->whereColumn('stock', '<=', 'reorder_level')
                    ->count(),
                'movementsToday' => StockMovement::query()
                    ->whereDate('created_at', today())
                    ->count(),
            ],
            'movements' => StockMovement::query()
                ->with(['item:id,name,unit', 'user:id,name'])
                ->latest('id')
                ->limit(15)
                ->get(),
        ]);
    }
}
