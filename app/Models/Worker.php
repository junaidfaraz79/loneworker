<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class Worker extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'workers'; // Specify the table associated with the model

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
}

