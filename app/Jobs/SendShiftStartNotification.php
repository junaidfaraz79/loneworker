<?php

namespace App\Jobs;

use App\Models\Worker;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendShiftStartNotification implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    protected $worker;
    protected $shiftStartTime;
    protected $siteName;

    public function __construct($worker, $shiftStartTime, $siteName)
    {
        $this->worker = $worker;
        $this->shiftStartTime = $shiftStartTime;
        $this->siteName = $siteName;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        // Send notification to the worker
        $this->worker->sendPushNotification(
            'Shift Starting Now!',
            'Your shift at ' . $this->siteName . ' starts at ' . $this->shiftStartTime . '.',
            ['screen' => 'Testing']
        );

        Log::info('Shift start notification sent to worker: ' . $this->worker->worker_name);
        Log::info('Your shift at ' . $this->siteName . ' starts at ' . $this->shiftStartTime . '.');
    }
}
