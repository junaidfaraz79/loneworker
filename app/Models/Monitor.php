<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Monitor extends Authenticatable
{
    protected $table = 'user'; // The name of the table in the database

    protected $primaryKey = 'id';
    
    protected $fillable = [
        'subscriber_id', 'username', 'role', 'email', 'password', 'cell_no',
        'phone_no', 'company_name', 'official_address', 'designation', 'user_image',
        'user_type', 'country_code', 'home_address', 'gender', 'emergency_contact_1', 'emergency_contact_2', 
        'added_on', 'updated_on'
    ];

    protected $hidden = [
        'password'
    ];

    public $timestamps = false; 
}
