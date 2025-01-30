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
        'worker_status'
    ];

    protected $hidden = [
        'password', // Hide the password when the model is serialized to JSON
    ];

    protected $casts = [
        'added_on' => 'datetime',
        'updated_on' => 'datetime',
    ];
}

