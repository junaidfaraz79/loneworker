<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkerMonitor extends Model
{
    protected $table = 'worker_monitor'; // Specify the table name if different from the plural of class name

    protected $primaryKey = ['monitor_id', 'worker_id']; // Set composite primary keys
    public $incrementing = false; // Set incrementing to false since it's a composite key

    public $timestamps = true; // No timestamps unless you have them in your table

    protected $fillable = ['monitor_id', 'worker_id'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship with Worker
    public function worker()
    {
        return $this->belongsTo(Worker::class, 'worker_id', 'id');
    }

    // Relationship with User (assuming User is the model for monitors)
    public function monitor()
    {
        return $this->belongsTo(Monitor::class, 'monitor_id', 'id');
    }
}
