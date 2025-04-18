<?php

namespace App\Models;

use App\Notifications\WorkerResetPasswordNotification;
use App\Services\ExpoPushNotificationService;
use App\Services\NotificationService;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\SoftDeletes;

class Worker extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword, SoftDeletes;

    protected $table = 'workers'; // Specify the table associated with the model

    protected $primaryKey = 'id';

    public $timestamps = true;

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
        'nok_contact',
        'push_token',
        'monitor_id',
        'check_in_visibility',
        'subscriber_id'
    ];

    protected $hidden = [
        'password', // Hide the password when the model is serialized to JSON
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new WorkerResetPasswordNotification($token));
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class, 'worker_id', 'id');
    }

    public function checkIns()
    {
        return $this->hasMany(WorkerCheckIns::class, 'worker_id', 'id');
    }

    public function notifications()
    {
        return $this->hasMany(WorkerNotification::class, 'worker_id', 'id');
    }

    public function monitors()
    {
        return $this->belongsToMany(Monitor::class, 'worker_monitor', 'worker_id', 'monitor_id');
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class, 'worker_id', 'id');
    }
    /**
     * Send a push notification to the worker.
     *
     * @param string $title
     * @param string $body
     * @param array $data
     * @return mixed
     */
    public function sendPushNotification($title, $body, $data = [])
    {
        if (!$this->push_token) {
            Log::warning('Worker does not have a push token: ' . $this->id);
            return null;
        }

        $notificationService = new NotificationService();
        $result =  $notificationService->sendPushNotification($this->push_token, $title, $body, $data, $this->id);

        if ($result['success']) {
            return $result;
        } else {
            // Handle error
            logger()->error('Notification failed', $result);
        }
    }
}

