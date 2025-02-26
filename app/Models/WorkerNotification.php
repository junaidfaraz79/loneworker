<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkerNotification extends Model
{
    use HasFactory;

    protected $table = 'worker_notifications';

    protected $fillable = [
        'worker_id',
        'to',
        'title',
        'body',
        'data',
        'status',
        'response',
    ];

    protected $casts = [
        'data' => 'json',
    ];

    /**
     * Get the worker associated with the notification.
     */
    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}