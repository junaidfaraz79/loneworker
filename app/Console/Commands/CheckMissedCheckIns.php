<?php

namespace App\Console\Commands;

use App\Models\Alert;
use App\Models\WorkerCheckIns;
use Carbon\Carbon;
use Illuminate\Console\Command;

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

        // Process in batches to optimize memory usage
        WorkerCheckIns::where('status', 'pending')
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
                }
            });

        $this->info('Missed check-ins processed successfully.');
    }
}
