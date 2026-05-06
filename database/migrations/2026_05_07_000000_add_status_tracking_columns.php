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
        Schema::table('complaints', function (Blueprint $table) {
            $table->timestamp('status_updated_at')->nullable()->after('submitted_at');
            $table->foreignId('status_updated_by')->nullable()->constrained('users')->onDelete('set null')->after('status_updated_at');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->timestamp('status_updated_at')->nullable()->after('status');
            $table->foreignId('status_updated_by')->nullable()->constrained('users')->onDelete('set null')->after('status_updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropForeign(['status_updated_by']);
            $table->dropColumn(['status_updated_at', 'status_updated_by']);
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropForeign(['status_updated_by']);
            $table->dropColumn(['status_updated_at', 'status_updated_by']);
        });
    }
};
