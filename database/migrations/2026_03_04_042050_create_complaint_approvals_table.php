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
        Schema::create('complaint_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained()->onDelete('cascade');
            $table->foreignId('reviewed_by')->constrained('users')->onDelete('cascade'); // Engineering staff
            $table->enum('action', ['approve', 'decline']);
            $table->text('reason')->nullable(); // Required for decline, optional for approve
            $table->text('engineering_assessment')->nullable(); // Technical assessment
            $table->json('recommended_materials')->nullable(); // Suggested materials
            $table->integer('estimated_hours')->nullable(); // Estimated work hours
            $table->timestamp('reviewed_at')->useCurrent();
            $table->timestamps();

            $table->index('complaint_id');
            $table->index('reviewed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaint_approvals');
    }
};
