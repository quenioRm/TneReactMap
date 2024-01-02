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
        Schema::table('markerconfigimpediment', function (Blueprint $table) {
            $table->string('IsBlocked')->default('Não')->after('Status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('markerconfigimpediment', function (Blueprint $table) {
            $table->string('IsBlocked');
        });
    }
};
