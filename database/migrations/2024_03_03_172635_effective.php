<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('effective', function (Blueprint $table) {
            $table->id();
            $table->string('activity', 150);
            $table->string('business', 150);
            $table->integer('direct');
            $table->integer('indirect');
            $table->integer('machinescount');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('effective');
    }
};
