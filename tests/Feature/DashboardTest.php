<?php

use App\Enums\StockMovementType;
use App\Models\Item;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard lists recent stock movements with their item and user', function () {
    $user = User::factory()->create();
    $item = Item::factory()->create(['name' => 'USB Cable']);
    $item->recordMovement(StockMovementType::In, 5, $user);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page->component('dashboard')
                ->where('stats.totalItems', 1)
                ->where('movements.0.type', 'in')
                ->where('movements.0.quantity', 5)
                ->where('movements.0.item.name', 'USB Cable')
                ->where('movements.0.user.name', $user->name),
        );
});

test('dashboard shows an empty audit log before any movement is recorded', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('movements', 0));
});
