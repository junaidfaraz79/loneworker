<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MissedCheckInMail extends Mailable
{
    use Queueable, SerializesModels;

    protected $emailData;

    /**
     * Create a new message instance.
     * @param mixed $worker Data to be used in the email
     */
    public function __construct($emailData)
    {
        $this->emailData = $emailData;
    }

    /**
     * Get the message envelope.
     */
    // public function envelope(): Envelope
    // {
    //     return new Envelope(
    //         subject: 'Worker Checkin Missed'
    //     );
    // }

    /**
     * Get the message content definition.
     */
    // public function content(): Content
    // {
    //     return new Content(
    //         view: 'view.name',
    //     );
    // }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Build the message.
     */
    public function build()
    {
        try {
            Log::info('Building MissedCheckinMail with data:', $this->emailData);

            return $this->from('noreply@etgraphics.net')
                ->subject('Missed Check-In Alert: ' . $this->emailData['name'])
                ->view('monitor.emails.missed_checkin_alert')
                ->with('data', $this->emailData);
        } catch (\Exception $e) {
            Log::error('Failed to send email:', [
                'worker' => $this->emailData['name'],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString() // This will provide a stack trace
            ]);
        }
    }
}
