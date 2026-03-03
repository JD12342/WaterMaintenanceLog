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
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Complainant
            $table->string('title');
            $table->text('description');
            $table->string('location');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('status', [
                'pending',              // Just submitted by user
                'reviewed',             // Admin reviewed
                'submitted_to_engineering', // Sent to engineering
                'approved',             // Engineering approved
                'declined',             // Engineering declined
                'assigned',             // Admin assigned to maintenance
                'in_progress',          // Maintenance working on it
                'completed',            // Task completed
                'closed'               // Final closure
            ])->default('pending');
            $table->text('damage_assessment')->nullable(); // Engineering notes
            $table->text('admin_notes')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
