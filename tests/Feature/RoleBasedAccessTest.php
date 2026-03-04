<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Complaint;
use App\Models\WorkOrder;
use App\Services\StatusManagementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

class RoleBasedAccessTest extends TestCase
{
    use RefreshDatabase;

    protected StatusManagementService $statusService;
    
    public function setUp(): void
    {
        parent::setUp();
        $this->statusService = new StatusManagementService();
    }

    /** @test */
    public function admin_can_access_admin_routes()
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        
        $response = $this->actingAs($admin)->get('/admin/dashboard');
        
        $response->assertStatus(200);
    }

    /** @test */
    public function consumer_cannot_access_admin_routes()
    {
        $consumer = User::factory()->create(['role' => 'CONSUMER']);
        
        $response = $this->actingAs($consumer)->get('/admin/dashboard');
        
        $response->assertStatus(403);
    }

    /** @test */
    public function engineering_can_access_engineering_routes()
    {
        $engineer = User::factory()->create(['role' => 'ENGINEERING']);
        
        $response = $this->actingAs($engineer)->get('/engineering/dashboard');
        
        $response->assertStatus(200);
    }

    /** @test */
    public function maintenance_can_access_maintenance_routes()
    {
        $maintenance = User::factory()->create(['role' => 'MAINTENANCE']);
        
        $response = $this->actingAs($maintenance)->get('/maintenance/dashboard');
        
        $response->assertStatus(200);
    }

    /** @test */
    public function status_transitions_are_role_restricted()
    {
        $complaint = Complaint::factory()->create(['status' => 'submitted_to_engineering']);
        $engineer = User::factory()->create(['role' => 'ENGINEERING']);
        $consumer = User::factory()->create(['role' => 'CONSUMER']);

        // Engineering can approve/decline
        Auth::login($engineer);
        $this->assertTrue($this->statusService->canTransitionComplaintStatus($complaint, 'approved', 'ENGINEERING'));
        $this->assertTrue($this->statusService->canTransitionComplaintStatus($complaint, 'declined', 'ENGINEERING'));

        // Consumer cannot approve/decline
        Auth::login($consumer);
        $this->assertFalse($this->statusService->canTransitionComplaintStatus($complaint, 'approved', 'CONSUMER'));
        $this->assertFalse($this->statusService->canTransitionComplaintStatus($complaint, 'declined', 'CONSUMER'));
    }

    /** @test */
    public function dashboard_data_is_role_specific()
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $consumer = User::factory()->create(['role' => 'CONSUMER']);

        // Test admin dashboard
        $response = $this->actingAs($admin)->getJson('/api/v1/dashboard');
        $response->assertJsonHas('stats.pending_complaints');

        // Test consumer dashboard
        $response = $this->actingAs($consumer)->getJson('/api/v1/dashboard');
        $response->assertJsonHas('my_complaints');
    }

    /** @test */
    public function status_information_is_accessible()
    {
        $user = User::factory()->create(['role' => 'ADMIN']);
        
        $response = $this->actingAs($user)->getJson('/api/v1/status/info');
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'complaint_statuses',
                     'work_order_statuses', 
                     'priority_levels'
                 ]);
    }

    /** @test */
    public function allowed_transitions_vary_by_role()
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $engineering = User::factory()->create(['role' => 'ENGINEERING']);
        
        // Test admin transitions
        $response = $this->actingAs($admin)
                         ->getJson('/api/v1/status/transitions?type=complaint&current_status=pending');
        
        $response->assertJsonHas('allowed_transitions');
        
        // Test engineering transitions
        $response = $this->actingAs($engineering)
                         ->getJson('/api/v1/status/transitions?type=complaint&current_status=submitted_to_engineering');
        
        $response->assertJsonHas('allowed_transitions');
    }

    /** @test */
    public function guest_cannot_access_protected_routes()
    {
        $response = $this->get('/admin/dashboard');
        $response->assertRedirect('/login');

        $response = $this->getJson('/api/v1/dashboard');
        $response->assertStatus(401);
    }

    /** @test */
    public function public_complaint_submission_works()
    {
        $response = $this->postJson('/api/v1/complaints/public', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'title' => 'Water leak issue',
            'description' => 'There is a water leak in front of my house',
            'location' => '123 Main St',
            'priority' => 'high'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('complaints', [
            'title' => 'Water leak issue',
            'status' => 'pending'
        ]);
    }
}