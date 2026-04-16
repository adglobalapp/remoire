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
        Schema::rename('friends', 'relationships');
        
        Schema::table('relationships', function (Blueprint $table) {
            $table->renameColumn('friend_id', 'target_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('relationships', function (Blueprint $table) {
            $table->renameColumn('target_id', 'friend_id');
        });

        Schema::rename('relationships', 'friends');
    }
};
