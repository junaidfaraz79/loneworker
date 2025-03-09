<?php

namespace App\Console\Commands;

use App\Jobs\SendShiftStartNotification;
use App\Models\Worker;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NotifyShiftStart extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notify:shift-start';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Notifying workers about shift start';

    /**
     * Execute the console command.
     */
    public function handle()
{
    $today = Carbon::today();
    Log::info('Notifying workers about shift starts at: ' . $today);

    // Fetch shifts that start exactly at the current time
    DB::table('worker_shift_site')
        ->join('shifts', 'worker_shift_site.shift_id', '=', 'shifts.id')
        ->join('sites', 'worker_shift_site.site_id', '=', 'sites.id')
        ->select(
            'worker_shift_site.id as worker_shift_site_id', // Alias the primary key for chunking
            'worker_shift_site.worker_id',
            'worker_shift_site.custom_start_time',
            'worker_shift_site.start_date',
            'worker_shift_site.end_date',
            'shifts.default_start_time',
            'sites.site_name'
        )
        ->whereDate('worker_shift_site.start_date', '<', $today) // Check if the shift is active today
        ->whereDate('worker_shift_site.end_date', '>=', $today) // Check if the shift is still ongoing
        ->chunkById(100, function ($shifts) {
            foreach ($shifts as $shift) {
                // Fetch the worker
                $worker = Worker::find($shift->worker_id);

                if ($worker) {
                    // Determine the shift start time (custom or default)
                    $shiftStartTime = Carbon::parse($shift->custom_start_time ?? $shift->default_start_time);
                    
                    // Schedule the notification job to run at the shift start time
                    dispatch(new SendShiftStartNotification(
                        $worker, 
                        $shiftStartTime->format('h:i A'), 
                        $shift->site_name
                    ))->delay($shiftStartTime);

                    // Prepare notification data
                    $notificationData = [
                        'worker_name' => $worker->name,
                        'shift_start_time' => $shiftStartTime,
                        'site_name' => $shift->site_name, // Assuming you have a relationship to the Site model
                    ];
                    Log::info($notificationData);
                }
            }
        }, 'worker_shift_site_id'); // Use the aliased column name for chunking

    $this->info('Shift start notifications processed successfully.');
}
}
