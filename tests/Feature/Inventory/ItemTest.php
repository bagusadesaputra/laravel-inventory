<?php

use App\Enums\StockMovementType;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Item;
use App\Models\StockMovement;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('inventory.items.index'));

    $response->assertRedirect(route('login'));
});

test('staff can browse items but can not create them', function () {
    $user = User::factory()->withRole(UserRole::Staff)->create();
    $category = Category::factory()->create();
    Item::factory()->create(['category_id' => $category->id]);

    $browse = $this->actingAs($user)->get(route('inventory.items.index'));
    $browse->assertOk();

    $create = $this->post(route('inventory.items.store'), [
        'category_id' => $category->id,
        'sku' => 'SKU-9999',
        'name' => 'Blocked item',
        'unit' => 'pcs',
        'reorder_level' => 0,
    ]);

    $create->assertForbidden();
    $this->assertDatabaseMissing('items', ['sku' => 'SKU-9999']);
});

test('manager can create an item with an opening stock', function () {
    $user = User::factory()->withRole(UserRole::Manager)->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($user)->post(route('inventory.items.store'), [
        'category_id' => $category->id,
        'sku' => 'SKU-0001',
        'name' => 'USB Cable',
        'unit' => 'pcs',
        'reorder_level' => 5,
        'initial_stock' => 25,
    ]);

    $item = Item::where('sku', 'SKU-0001')->firstOrFail();

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('inventory.items.show', $item));

    expect($item->stock)->toBe(25);

    $movement = StockMovement::where('item_id', $item->id)->sole();
    expect($movement->type)->toBe(StockMovementType::In)
        ->and($movement->quantity)->toBe(25)
        ->and($movement->stock_after)->toBe(25)
        ->and($movement->user_id)->toBe($user->id);
});

test('an item is created with zero stock when no opening stock is given', function () {
    $user = User::factory()->withRole(UserRole::Manager)->create();
    $category = Category::factory()->create();

    $this->actingAs($user)->post(route('inventory.items.store'), [
        'category_id' => $category->id,
        'sku' => 'SKU-0002',
        'name' => 'HDMI Cable',
        'unit' => 'pcs',
        'reorder_level' => 0,
    ])->assertSessionHasNoErrors();

    $item = Item::where('sku', 'SKU-0002')->firstOrFail();

    expect($item->stock)->toBe(0);
    $this->assertDatabaseCount('stock_movements', 0);
});

test('item sku must be unique', function () {
    $user = User::factory()->withRole(UserRole::Manager)->create();
    $category = Category::factory()->create();
    Item::factory()->create(['sku' => 'SKU-0001']);

    $response = $this->actingAs($user)->post(route('inventory.items.store'), [
        'category_id' => $category->id,
        'sku' => 'SKU-0001',
        'name' => 'Duplicate',
        'unit' => 'pcs',
        'reorder_level' => 0,
    ]);

    $response->assertSessionHasErrors('sku');
});

test('item category must exist', function () {
    $user = User::factory()->withRole(UserRole::Manager)->create();

    $response = $this->actingAs($user)->post(route('inventory.items.store'), [
        'category_id' => 999,
        'sku' => 'SKU-0003',
        'name' => 'Orphan',
        'unit' => 'pcs',
        'reorder_level' => 0,
    ]);

    $response->assertSessionHasErrors('category_id');
});

test('item unit must be a known unit', function () {
    $user = User::factory()->withRole(UserRole::Manager)->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($user)->post(route('inventory.items.store'), [
        'category_id' => $category->id,
        'sku' => 'SKU-0004',
        'name' => 'Barrel',
        'unit' => 'barrel',
        'reorder_level' => 0,
    ]);

    $response->assertSessionHasErrors('unit');
});

test('editing an item can not change its stock', function () {
    $user = User::factory()->withRole(UserRole::Manager)->create();
    $item = Item::factory()->create(['sku' => 'SKU-0005', 'stock' => 12]);

    $response = $this->actingAs($user)->patch(route('inventory.items.update', $item), [
        'category_id' => $item->category_id,
        'sku' => 'SKU-0005',
        'name' => 'Renamed',
        'unit' => 'kg',
        'reorder_level' => 3,
        'stock' => 9999,
    ]);

    $response->assertSessionHasNoErrors();

    $item->refresh();
    expect($item->name)->toBe('Renamed')
        ->and($item->stock)->toBe(12);
});

test('an item with a stock history can not be deleted', function () {
    $user = User::factory()->withRole(UserRole::Admin)->create();
    $item = Item::factory()->create(['stock' => 0]);
    $item->recordMovement(StockMovementType::In, 10, $user);

    $response = $this->actingAs($user)->delete(route('inventory.items.destroy', $item));

    $response->assertSessionHas(
        'inertia.flash_data',
        fn (array $flash) => $flash['toast']['type'] === 'error',
    );
    $this->assertModelExists($item);
});

test('an item without a stock history can be deleted', function () {
    $user = User::factory()->withRole(UserRole::Admin)->create();
    $item = Item::factory()->create();

    $response = $this->actingAs($user)->delete(route('inventory.items.destroy', $item));

    $response->assertSessionHasNoErrors();
    $this->assertModelMissing($item);
});

test('item pages can be rendered', function () {
    $user = User::factory()->withRole(UserRole::Manager)->create();
    $item = Item::factory()->create();
    $item->recordMovement(StockMovementType::In, 4, $user);

    $this->actingAs($user)
        ->get(route('inventory.items.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('inventory/items/create'));

    $this->actingAs($user)
        ->get(route('inventory.items.edit', $item))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('inventory/items/edit'));

    $this->actingAs($user)
        ->get(route('inventory.items.show', $item))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page->component('inventory/items/show')
                ->where('item.stock', 4)
                ->has('movements.data', 1),
        );
});

test('item search matches the name or the sku', function () {
    $user = User::factory()->withRole(UserRole::Staff)->create();
    Item::factory()->create(['name' => 'Alpha Cable', 'sku' => 'SKU-1000']);
    Item::factory()->create(['name' => 'Beta Cable', 'sku' => 'SKU-2000']);

    $response = $this->actingAs($user)->get(route('inventory.items.index', ['search' => 'SKU-2000']));

    $response->assertOk()->assertInertia(
        fn ($page) => $page->has('items.data', 1)
            ->where('items.data.0.name', 'Beta Cable'),
    );
});
