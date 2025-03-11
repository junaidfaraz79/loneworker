<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkerCheckIns extends Model
{
    //
    use HasFactory;
    protected $primaryKey = 'id';
    public $timestamps = true; 
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'worker_check_ins';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'worker_id',
        'attendance_id',
        'scheduled_time',
        'actual_time',
        'grace_period_end',
        'status',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'scheduled_time' => 'datetime',
        'actual_time' => 'datetime',
    ];

    /**
     * Get the worker associated with the check-in.
     */
    public function worker()
    {
        return $this->belongsTo(Worker::class, 'worker_id', 'id');
    }

    public function attendance()
    {
        return $this->belongsTo(Attendance::class, 'attendance_id', 'id');
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class, 'check_in_id', 'id');
    }
}
