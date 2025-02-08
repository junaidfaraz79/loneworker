<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Monitor extends Authenticatable
{
    protected $table = 'user'; // The name of the table in the database

    protected $fillable = [
        'subscriber_id', 'username', 'role', 'email', 'password', 'cell_no',
        'phone_no', 'company_name', 'official_address', 'designation', 'user_image',
        'user_type', 'added_on', 'updated_on'
    ];

    protected $hidden = [
        'password'
    ];

    public $timestamps = true; 
}
