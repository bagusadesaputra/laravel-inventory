<?php

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;

test('creates a single hashed admin account on a fresh database', function () {
    (new AdminUserSeeder)->run();

    $user = User::query()->where('email', 'test@example.com')->sole();

    expect($user->role)->toBe(UserRole::Admin)
        ->and($user->password)->not->toBe('password');
});

test('is safe to run on every deploy', function () {
    (new AdminUserSeeder)->run();
    User::query()->where('email', 'test@example.com')->update(['name' => 'Renamed']);

    (new AdminUserSeeder)->run();

    expect(User::query()->count())->toBe(1)
        ->and(User::query()->where('email', 'test@example.com')->sole()->name)->toBe('Renamed');
});

test('does not escalate an account that already has that address', function () {
    $existing = User::factory()->create([
        'email' => 'test@example.com',
        'role' => UserRole::Staff,
    ]);

    (new AdminUserSeeder)->run();

    expect($existing->fresh()->role)->toBe(UserRole::Staff);
});
