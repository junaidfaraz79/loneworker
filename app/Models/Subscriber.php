<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Subscriber extends Authenticatable
{
    use HasFactory;

    protected $table = 'subscribers';

    protected $primaryKey = 'id';
    
    protected $fillable = [
        'username', 'role', 'email', 'password', 'cell_no', 'phone_no', 
        'company_name', 'official_address', 'designation', 'user_image', 
        'user_type', 'added_on', 'updated_on', 'subscription_id',
        'company_number', 'address_line_1', 'address_line_2', 'country',
        'locality', 'region', 'postal_code'
    ];

    protected $casts = [
        'added_on' => 'datetime',
        'updated_on' => 'datetime',
    ];

    public $timestamps = false;
}

