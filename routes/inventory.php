<?php

use App\Http\Controllers\Inventory\CategoryController;
use App\Http\Controllers\Inventory\ItemController;
use App\Http\Controllers\Inventory\StockMovementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    // Readable by every role. The item show route is registered after the resource
    // routes below so that "items/create" is not swallowed by the {item} binding.
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('items', [ItemController::class, 'index'])->name('items.index');

    // Master data is managed by admins and managers only.
    Route::middleware('role:admin,manager')->group(function () {
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::patch('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::resource('items', ItemController::class)
            ->only(['create', 'store', 'edit', 'update', 'destroy']);
    });

    Route::get('items/{item}', [ItemController::class, 'show'])->name('items.show');

    // Every role records stock; Item::recordMovement() keeps the balance non-negative.
    Route::post('items/{item}/movements', [StockMovementController::class, 'store'])
        ->name('items.movements.store');
});
