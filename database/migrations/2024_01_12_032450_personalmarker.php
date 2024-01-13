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
        Schema::create('personal_marker', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150)->unique();
            $table->string('coordinateX');
            $table->string('coordinateY');
            $table->string('zone');
            $table->string('type');
            $table->string('icon');
            $table->string('unity')->nullable();
            $table->decimal('count', 5, 2)->default(0);
            $table->decimal('lenPercent', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_marker');
    }
};
