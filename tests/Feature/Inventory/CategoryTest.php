<?php

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Item;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('inventory.categories.index'));

    $response->assertRedirect(route('login'));
});

test('category page can be rendered', function () {
    $user = User::factory()->create();
    Category::factory()->count(2)->create();

    $response = $this->actingAs($user)->get(route('inventory.categories.index'));

    $response->assertOk()->assertInertia(
        fn ($page) => $page->component('inventory/categories/index')
            ->has('categories', 2),
    );
});

test('staff can not create a category', function () {
    $user = User::factory()->withRole(UserRole::Staff)->create();

    $response = $this->actingAs($user)->post(route('inventory.categories.store'), [
        'name' => 'Electronics',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('categories', ['name' => 'Electronics']);
});

test('manager can create a category', function () {
    $user = User::factory()->withRole(UserRole::Manager)->create();

    $response = $this->actingAs($user)->post(route('inventory.categories.store'), [
        'name' => 'Electronics',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('inventory.categories.index'));

    $this->assertDatabaseHas('categories', ['name' => 'Electronics']);
});

test('category name must be unique', function () {
    $user = User::factory()->withRole(UserRole::Admin)->create();
    Category::factory()->create(['name' => 'Electronics']);

    $response = $this->actingAs($user)->post(route('inventory.categories.store'), [
        'name' => 'Electronics',
    ]);

    $response->assertSessionHasErrors('name');
});

test('category name is required', function () {
    $user = User::factory()->withRole(UserRole::Admin)->create();

    $response = $this->actingAs($user)->post(route('inventory.categories.store'), []);

    $response->assertSessionHasErrors('name');
});

test('staff can not rename a category', function () {
    $user = User::factory()->withRole(UserRole::Staff)->create();
    $category = Category::factory()->create(['name' => 'Electronics']);

    $response = $this->actingAs($user)->patch(
        route('inventory.categories.update', $category),
        ['name' => 'Gadgets'],
    );

    $response->assertForbidden();
    expect($category->refresh()->name)->toBe('Electronics');
});

test('admin can rename a category', function () {
    $user = User::factory()->withRole(UserRole::Admin)->create();
    $category = Category::factory()->create(['name' => 'Electronics']);

    $response = $this->actingAs($user)->patch(
        route('inventory.categories.update', $category),
        ['name' => 'Gadgets'],
    );

    $response->assertSessionHasNoErrors();
    expect($category->refresh()->name)->toBe('Gadgets');
});

test('a category that still holds items can not be deleted', function () {
    $user = User::factory()->withRole(UserRole::Admin)->create();
    $category = Category::factory()->create();
    Item::factory()->create(['category_id' => $category->id]);

    $response = $this->actingAs($user)->delete(route('inventory.categories.destroy', $category));

    $response->assertSessionHas(
        'inertia.flash_data',
        fn (array $flash) => $flash['toast']['type'] === 'error',
    );
    $this->assertModelExists($category);
});

test('an empty category can be deleted', function () {
    $user = User::factory()->withRole(UserRole::Admin)->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($user)->delete(route('inventory.categories.destroy', $category));

    $response->assertSessionHasNoErrors();
    $this->assertModelMissing($category);
});
