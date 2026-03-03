<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

enum UserRole: string
{
    case ADMIN = 'ADMIN';
    case ENGINEERING = 'ENGINEERING';
    case MAINTENANCE = 'MAINTENANCE';
    case CONSUMER = 'CONSUMER';
}

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => UserRole::class,
        ];
    }

    /**
     * Get complaints submitted by this user
     */
    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    /**
     * Get work orders assigned by this user (admin role)
     */
    public function assignedWorkOrders()
    {
        return $this->hasMany(WorkOrder::class, 'assigned_by');
    }

    /**
     * Get work orders assigned to this user (maintenance role)
     */
    public function workOrdersAssignedToMe()
    {
        return $this->hasMany(WorkOrder::class, 'assigned_to');
    }

    /**
     * Get work orders approved by this user (engineering role)
     */
    public function approvedWorkOrders()
    {
        return $this->hasMany(WorkOrder::class, 'engineering_approved_by');
    }

    /**
     * Get maintenance reports created by this user
     */
    public function maintenanceReports()
    {
        return $this->hasMany(MaintenanceReport::class, 'reported_by');
    }

    /**
     * Check if user has specific role
     */
    public function hasRole(UserRole $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user has any of the specified roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    /**
     * Check if user is engineering
     */
    public function isEngineering(): bool
    {
        return $this->role === UserRole::ENGINEERING;
    }

    /**
     * Check if user is maintenance staff
     */
    public function isMaintenance(): bool
    {
        return $this->role === UserRole::MAINTENANCE;
    }

    /**
     * Check if user is consumer/end user
     */
    public function isConsumer(): bool
    {
        return $this->role === UserRole::CONSUMER;
    }
}
