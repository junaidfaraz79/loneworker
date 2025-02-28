<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    // The table associated with the model.
    protected $table = 'attendance';

    // Specify the primary key if it's not 'id'
    protected $primaryKey = 'id'; // Assuming 'id' is the primary key if it exists; adjust if different

    // Set timestamps to false if you don't want them to be auto-managed
    public $timestamps = true; 

    // Attributes that are mass assignable
    protected $fillable = [
        'worker_id', 'start_time', 'end_time', 'status', 'worker_shift_site_id'
    ];

    // Attributes that should be cast to native types
    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the worker that owns the attendance.
     */
    public function worker()
    {
        return $this->belongsTo(Worker::class, 'worker_id', 'id');
    }

    // Relationship with CheckIn model
    public function workerCheckIns()
    {
        return $this->hasMany(WorkerCheckIns::class, 'attendance_id', 'id');
    }
}
