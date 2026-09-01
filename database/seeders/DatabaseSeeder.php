<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->removeLegacyTestUser();

        $this->call([
            AdminSeeder::class,
            ClientPortalSeeder::class,
        ]);
    }

    /**
     * Remove the legacy demo test user that is no longer referenced.
     */
    protected function removeLegacyTestUser(): void
    {
        User::where('email', 'test@example.com')
            ->each(function (User $user): void {
                $user->delete();
            });
    }
}
