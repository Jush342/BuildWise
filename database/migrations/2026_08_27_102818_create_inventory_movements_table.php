<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('inventory_movements')) {
            Schema::create('inventory_movements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('team_id')->constrained()->cascadeOnDelete();
                $table->foreignId('inventory_id')->constrained('inventories')->cascadeOnDelete();
                $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('type');
                $table->integer('quantity_change');
                $table->unsignedInteger('previous_quantity');
                $table->unsignedInteger('new_quantity');
                $table->string('reason')->nullable();
                $table->timestamps();

                $table->index(['team_id', 'created_at']);
                $table->index(['inventory_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
