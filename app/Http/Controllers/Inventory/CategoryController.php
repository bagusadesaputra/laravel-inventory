<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreCategoryRequest;
use App\Http\Requests\Inventory\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * List every category with the number of items it holds.
     */
    public function index(): Response
    {
        return Inertia::render('inventory/categories/index', [
            'categories' => Category::withCount('items')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kategori berhasil dibuat.']);

        return redirect()->route('inventory.categories.index');
    }

    /**
     * Update the given category.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kategori berhasil diperbarui.']);

        return back();
    }

    /**
     * Remove the given category, as long as no item still points at it.
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->items()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Kategori ini masih memiliki barang. Pindahkan atau hapus barangnya terlebih dahulu.',
            ]);

            return back();
        }

        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kategori berhasil dihapus.']);

        return back();
    }
}
