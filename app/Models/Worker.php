<?php

namespace App\Models;

use App\Notifications\WorkerResetPasswordNotification;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Auth\Passwords\CanResetPassword;

class Worker extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword;

    protected $table = 'workers'; // Specify the table associated with the model

    protected $primaryKey = 'id';
    
    protected $fillable = [
        'worker_name',
        'phone_no',
        'email',
        'pin',
        'password',
        'phone_type',
        'role',
        'department',
        'check_in_frequency',
        'worker_image',
        'worker_status',
        'sia_license_number',      
        'sia_license_expiry_date', 
        'emergency_contact_1',     
        'emergency_contact_2',     
        'nok_name',               
        'nok_relation',          
        'nok_address',    
        'nok_contact'
    ];

    protected $hidden = [
        'password', // Hide the password when the model is serialized to JSON
    ];

    protected $casts = [
        'added_on' => 'datetime',
        'updated_on' => 'datetime',
    ];

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new WorkerResetPasswordNotification($token));
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class, 'worker_id', 'id');
    }

    public function checkIns()
    {
        return $this->hasMany(WorkerCheckIns::class, 'worker_id', 'id');
    }

    public function monitors()
    {
        return $this->belongsToMany(Monitor::class, 'worker_monitor', 'worker_id', 'monitor_id');
    }
}

