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
         Schema::create('personal_marker_activity', function (Blueprint $table) {
             $table->id();
             $table->unsignedBigInteger('personalMarkerId');
             $table->string('unity')->nullable();
             $table->decimal('previouscount', 5, 2)->default(0);
             $table->decimal('lenPercent', 5, 2)->default(0);
             $table->string('icon');
             $table->timestamps();

            //  $table->foreign('personalMarkerId')
            //      ->references('id')
            //      ->on('personal_markers')
            //      ->onDelete('restrict')
            //      ->onUpdate('cascade');
         });
     }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_marker_activity');
    }
};
