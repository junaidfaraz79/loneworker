<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    use HasFactory;

    // Specify the table associated with the model
    protected $table = 'alerts';

    // Specify the primary key if it's not 'id'
    protected $primaryKey = 'id';

    // We use timestamps for created_at and updated_at
    public $timestamps = true;

    // Specify the attributes that are mass assignable
    protected $fillable = [
        'worker_id',
        'check_in_id',
        'type',
        'status',
    ];

    // Specify how the attributes should be cast (e.g., casting 'status' to an ENUM)
    protected $casts = [
        'status' => 'string', // It will store 'pending' or 'resolved'
    ];

    // Define the relationship with Worker model (if you need to access the worker for an alert)
    public function worker()
    {
        return $this->belongsTo(Worker::class, 'worker_id', 'id');
    }

    // Define the relationship with WorkerCheckIns model (if you need to access the missed check-in for the alert)
    public function workerCheckIn()
    {
        return $this->belongsTo(WorkerCheckIns::class, 'check_in_id', 'id');
    }
}
