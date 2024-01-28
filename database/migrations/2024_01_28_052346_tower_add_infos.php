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
        Schema::table('towers', function (Blueprint $table) {
            $table->string('Type')->nullable()->after('Zone');
            $table->string('FoundationMC')->nullable()->after('Type');
            $table->string('FoundationFoot')->nullable()->after('FoundationMC');
            $table->string('UsefulHeight')->nullable()->after('FoundationFoot');
            $table->string('Extension')->nullable()->after('UsefulHeight');
            $table->string('HA')->nullable()->after('Extension');
            $table->string('HB')->nullable()->after('HA');
            $table->string('HC')->nullable()->after('HB');
            $table->string('HD')->nullable()->after('HC');
            $table->string('FoundationState')->nullable()->after('HD');
            $table->string('ElectromechanicalState')->nullable()->after('FoundationState');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('towers', function (Blueprint $table) {
            $table->dropColumn('Type');
            $table->dropColumn('FoundationMC');
            $table->dropColumn('FoundationFoot');
            $table->dropColumn('UsefulHeight');
            $table->dropColumn('Extension');
            $table->dropColumn('HA');
            $table->dropColumn('HB');
            $table->dropColumn('HC');
            $table->dropColumn('HD');
            $table->dropColumn('FoundationState');
            $table->dropColumn('ElectromechanicalState');
        });
    }
};
