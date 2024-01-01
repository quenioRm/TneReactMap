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
        Schema::table('markerconfig', function (Blueprint $table) {
            $table->string('unidade')->nullable()->after('atividade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('markerconfig', function (Blueprint $table) {
            $table->dropColumn('unidade');
        });
    }
};
