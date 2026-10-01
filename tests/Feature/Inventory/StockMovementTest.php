<?php

use App\Enums\StockMovementType;
use App\Enums\UserRole;
use App\Models\Item;
use App\Models\StockMovement;
use App\Models\User;

test('staff can record a stock movement', function () {
    $user = User::factory()->withRole(UserRole::Staff)->create();
    $item = Item::factory()->create(['stock' => 40]);

    $response = $this->actingAs($user)->post(
        route('inventory.items.movements.store', $item),
        ['type' => 'in', 'quantity' => 10, 'note' => 'Delivery'],
    );

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('inventory.items.show', $item));

    expect($item->refresh()->stock)->toBe(50);
});

test('a stock in increases the item stock and records who did it', function () {
    $user = User::factory()->withRole(UserRole::Manager)->create();
    $item = Item::factory()->create(['stock' => 7]);

    $this->actingAs($user)->post(route('inventory.items.movements.store', $item), [
        'type' => 'in',
        'quantity' => 3,
    ])->assertSessionHasNoErrors();

    $movement = StockMovement::where('item_id', $item->id)->sole();

    expect($item->refresh()->stock)->toBe(10)
        ->and($movement->type)->toBe(StockMovementType::In)
        ->and($movement->quantity)->toBe(3)
        ->and($movement->stock_after)->toBe(10)
        ->and($movement->user_id)->toBe($user->id);
});

test('a stock out decreases the item stock', function () {
    $user = User::factory()->withRole(UserRole::Staff)->create();
    $item = Item::factory()->create(['stock' => 30]);

    $this->actingAs($user)->post(route('inventory.items.movements.store', $item), [
        'type' => 'out',
        'quantity' => 12,
    ])->assertSessionHasNoErrors();

    $movement = StockMovement::where('item_id', $item->id)->sole();

    expect($item->refresh()->stock)->toBe(18)
        ->and($movement->stock_after)->toBe(18);
});

test('a stock out larger than the balance is rejected and changes nothing', function () {
    $user = User::factory()->withRole(UserRole::Staff)->create();
    $item = Item::factory()->create(['stock' => 5]);

    $response = $this->actingAs($user)->post(
        route('inventory.items.movements.store', $item),
        ['type' => 'out', 'quantity' => 6],
    );

    $response->assertSessionHasErrors('quantity');
    expect($item->refresh()->stock)->toBe(5);
    $this->assertDatabaseCount('stock_movements', 0);
});

test('quantity must be a positive whole number', function () {
    $user = User::factory()->withRole(UserRole::Staff)->create();
    $item = Item::factory()->create(['stock' => 5]);

    $response = $this->actingAs($user)->post(
        route('inventory.items.movements.store', $item),
        ['type' => 'in', 'quantity' => 0],
    );

    $response->assertSessionHasErrors('quantity');
    expect($item->refresh()->stock)->toBe(5);
});

test('movement type must be a known type', function () {
    $user = User::factory()->withRole(UserRole::Staff)->create();
    $item = Item::factory()->create(['stock' => 5]);

    $response = $this->actingAs($user)->post(
        route('inventory.items.movements.store', $item),
        ['type' => 'opname', 'quantity' => 1],
    );

    $response->assertSessionHasErrors('type');
    $this->assertDatabaseCount('stock_movements', 0);
});

test('guests are redirected to the login page', function () {
    $item = Item::factory()->create();

    $response = $this->post(route('inventory.items.movements.store', $item), [
        'type' => 'in',
        'quantity' => 1,
    ]);

    $response->assertRedirect(route('login'));
    $this->assertGuest();
});
