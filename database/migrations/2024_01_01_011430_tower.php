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
        Schema::create('towers', function (Blueprint $table) {
            $table->id();
            $table->string('ProjectName');
            $table->string('Number');
            $table->string('Name');
            $table->string('Distance');
            $table->string('SolicitationDate')->nullable();
            $table->string('ReceiveDate')->nullable();
            $table->string('CoordinateX');
            $table->string('CoordinateY');
            $table->string('CoordinateZ')->nullable();
            $table->string('Zone');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('towers');
    }
};
