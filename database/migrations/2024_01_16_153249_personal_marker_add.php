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
        Schema::table('personal_marker_activity', function (Blueprint $table) {
            $table->integer('personalMarkerId')->nullable()->before('activity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personal_marker_activity', function (Blueprint $table) {
            $table->dropColumn('personalMarkerId');
        });
    }
};
