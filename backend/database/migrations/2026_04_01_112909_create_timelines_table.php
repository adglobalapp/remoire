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
        Schema::create('timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('entry_timeline', function (Blueprint $table) {
            $table->foreignId('entry_id')->constrained()->onDelete('cascade');
            $table->foreignId('timeline_id')->constrained()->onDelete('cascade');
            $table->primary(['entry_id', 'timeline_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entry_timeline');
        Schema::dropIfExists('timelines');
    }
};
