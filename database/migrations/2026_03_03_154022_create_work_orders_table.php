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
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->string('work_order_number')->unique(); // e.g., WO-2026-001
            $table->foreignId('complaint_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade'); // Admin
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null'); // Maintenance staff
            $table->foreignId('engineering_approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('engineering_approved_at')->nullable();
            $table->text('engineering_notes')->nullable();
            $table->enum('status', [
                'pending_assignment',   // Approved but not assigned yet
                'assigned',             // Assigned to maintenance
                'in_progress',          // Maintenance working
                'completed',            // Work done
                'verified'             // Admin verified completion
            ])->default('pending_assignment');
            $table->date('estimated_completion_date')->nullable();
            $table->date('actual_completion_date')->nullable();
            $table->text('assignment_notes')->nullable(); // Admin notes when assigning
            $table->timestamps();

            $table->index(['complaint_id', 'status']);
            $table->index('assigned_to');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
