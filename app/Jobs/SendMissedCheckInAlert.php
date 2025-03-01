<?php

namespace App\Jobs;

use App\Mail\MissedCheckInMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendMissedCheckInAlert implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    protected $monitorEmail;
    protected $emailData;

    /**
     * Create a new job instance.
     *
     * @param mixed $workerId
     * @param mixed $emailData
     */
    public function __construct($monitorEmail, $emailData)
    {
        $this->monitorEmail = $monitorEmail;
        $this->emailData = $emailData;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        try {
            Log::info('Starting MissedCheckinMail job for worker:', [
                'monitorEmail' => $this->monitorEmail,
                'emailData' => $this->emailData,
            ]);

            // Send the email
            Mail::to($this->monitorEmail)->send(new MissedCheckInMail($this->emailData));

            Log::info('Email sent successfully to:', [
                'email' => $this->monitorEmail,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send email:', [
                'monitorEmail' => $this->monitorEmail,
                'worker' => $this->emailData,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
