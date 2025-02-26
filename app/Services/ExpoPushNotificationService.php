<?php

namespace App\Services;

use App\Models\WorkerNotification;
use App\Models\Worker;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class ExpoPushNotificationService
{
    protected $expoApiUrl = 'https://exp.host/--/api/v2/push/send';

    /**
     * Send a push notification and log it in the database.
     *
     * @param string $to
     * @param string $title
     * @param string $body
     * @param array $data
     * @param int|null $workerId
     * @return array|null
     */
    public function sendNotification($to, $title, $body, $data = [], $workerId = null)
    {
        $client = new Client();

        $payload = [
            'to' => $to,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ];

        // Log the notification in the database
        $notification = WorkerNotification::create([
            'worker_id' => $workerId,
            'to' => $to,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'status' => 'pending',
        ]);

        try {
            $response = $client->post($this->expoApiUrl, [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => [$payload],
            ]);

            $responseData = json_decode($response->getBody(), true);

            // Update the notification status and response
            if (isset($responseData['data'][0]['status'])) {
                $status = $responseData['data'][0]['status'];
                $notification->update([
                    'status' => $status,
                    'response' => json_encode($responseData),
                ]);

                if ($status === 'error') {
                    Log::error('Expo Push Notification Error: ' . $responseData['data'][0]['message']);
                }
            }

            return $responseData;
        } catch (\Exception $e) {
            // Log the error and update the notification status
            $notification->update([
                'status' => 'failed',
                'response' => $e->getMessage(),
            ]);

            Log::error('Failed to send Expo Push Notification: ' . $e->getMessage());
            return null;
        }
    }
}