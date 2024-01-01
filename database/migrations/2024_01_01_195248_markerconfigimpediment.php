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
        Schema::create('markerconfigimpediment', function (Blueprint $table) {
            $table->id();
            $table->string('ImpedimentType');
            $table->string('Status');
            $table->string('Icon');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('markerconfigimpediment');
    }
};
