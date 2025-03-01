<?php

namespace App\Console\Commands;

use App\Jobs\SendMissedCheckInAlert;
use App\Models\Alert;
use App\Models\Worker;
use App\Models\WorkerCheckIns;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckMissedCheckIns extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:missed-checkins';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for missed worker check-ins and generate alerts.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        $now = Carbon::now();
        Log::info('Check for missed worker check-ins and generate alerts at: ' . $now);

        // Process in batches to optimize memory usage
        WorkerCheckIns::where('status', 'active')
            ->where('grace_period_end', '<', $now)
            ->chunkById(100, function ($checkIns) {
                foreach ($checkIns as $checkIn) {
                    // Mark as missed
                    $checkIn->update(['status' => 'missed']);

                    // Generate alert
                    Alert::create([
                        'worker_id' => $checkIn->worker_id,
                        'check_in_id' => $checkIn->id,
                        'type' => 'missed_checkin',
                        'status' => 'pending',
                    ]);

                    // Fetch the worker and their monitors
                    $worker = Worker::find($checkIn->worker_id);
                    $monitors = $worker->monitors;

                    $emailData = [
                        'name' => $worker->name,
                        'scheduled_time' => $checkIn->scheduled_time,
                    ];

                    // Send email to each monitor
                    foreach ($monitors as $monitor) {
                        SendMissedCheckInAlert::dispatch($monitor->email, $emailData);
                    }
                }
            });

        $this->info('Missed check-ins processed successfully.');
    }
}
