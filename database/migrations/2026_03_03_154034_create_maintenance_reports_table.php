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
        Schema::create('maintenance_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('reported_by')->constrained('users')->onDelete('cascade'); // Maintenance staff
            $table->text('work_description'); // What was actually done
            $table->json('materials_used'); // Materials and quantities used
            $table->decimal('hours_worked', 5, 2); // Hours spent on the task
            $table->text('completion_notes')->nullable(); // Additional notes
            $table->json('photos')->nullable(); // Photo file paths/URLs
            $table->enum('work_quality', ['excellent', 'good', 'satisfactory', 'needs_followup'])->default('good');
            $table->boolean('requires_followup')->default(false);
            $table->text('followup_notes')->nullable();
            $table->timestamp('work_started_at');
            $table->timestamp('work_completed_at');
            $table->timestamp('reported_at')->useCurrent();
            $table->timestamps();

            $table->index('work_order_id');
            $table->index('reported_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_reports');
    }
};
