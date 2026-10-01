<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Guarantee one known administrator account exists, so the app can be
     * signed into on a fresh deployment. Safe to run on every deploy.
     *
     * User only mass-assigns name/email/password on purpose — a registration
     * must never pick its own role — so this seeds with forceCreate.
     */
    public function run(): void
    {
        if (User::query()->where('email', 'test@example.com')->exists()) {
            return;
        }

        User::query()->forceCreate([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'email_verified_at' => now(),
            'role' => UserRole::Admin,
        ]);
    }
}
