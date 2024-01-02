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
        Schema::create('tower_impediments', function (Blueprint $table) {
            $table->id();
            $table->string('ProjectName');
            $table->string('Number');
            $table->string('ImpedimentType');
            $table->string('Status')->nullable();
            $table->datetime('StatusDate')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tower_impediments');
    }
};
