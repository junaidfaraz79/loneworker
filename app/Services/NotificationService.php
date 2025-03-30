<?php

namespace App\Services;

use App\Models\Worker;
use Google\Client as GoogleClient;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\WorkerNotification;
use Illuminate\Support\Facades\Config;

class NotificationService
{
    protected $client;
    protected $projectId;

    public function __construct()
    {
        $this->projectId = config('services.fcm.project_id');
        $this->initializeGoogleClient();
    }

    protected function initializeGoogleClient(): void
    {
        $this->client = new GoogleClient();

        // Get credentials path from firebase.php config
        $credentialsPath = env('FIREBASE_CREDENTIALS');
        $this->client->setAuthConfig($credentialsPath);

        $this->client->addScope('https://www.googleapis.com/auth/firebase.messaging');
    }

    /**
     * Send push notification to a worker
     *
     * @param string $to
     * @param string $title
     * @param string $body
     * @param array $data
     * @param int|null $workerId
     * @return array
     */
    public function sendPushNotification(
        string $to,
        string $title,
        string $body,
        array $data = [],
        ?int $workerId = null
    ): array {

        Log::info('to: ' . $to);
        Log::info('title: ' . $title);
        Log::info('body: ' . $body);
        Log::info('workerId: ' . $workerId);

        try {
            $user = $workerId ? Worker::find($workerId) : null;
            $fcmToken = $user?->push_token ?: $to;

            Log::info('user: ' . $user->id);
            Log::info('fcmToken: ' . $fcmToken);

            if (!$fcmToken) {
                throw new \RuntimeException('User does not have a device token');
            }

            $accessToken = $this->getAccessToken();
            Log::info('accessToken: ' . $accessToken);
            $response = $this->sendFcmMessage($fcmToken, $title, $body, $data, $accessToken);

            Log::info('response from sendFcmMessage: ' . print_r($response, true));

            $this->logNotification($to, $workerId, $title, $body, $data);

            return [
                'success' => true,
                'message' => 'Notification sent successfully',
                'response' => $response
            ];
        } catch (\Exception $e) {
            Log::error('Push notification failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Notification failed: ' . $e->getMessage()
            ];
        }
    }

    protected function getAccessToken(): string
    {
        $token = $this->client->fetchAccessTokenWithAssertion();
        return $token['access_token'];
    }

    protected function sendFcmMessage(
        string $fcmToken,
        string $title,
        string $body,
        array $data,
        string $accessToken
    ): array {
        $message = [
            'message' => [
                'token' => $fcmToken,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                ],
                'data' => $data,
            ]
        ];
    
        $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json',
            ])
            ->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", $message);
    
        $responseData = $response->json();
        
        // Detailed logging
        Log::debug('FCM Full Response', [
            'status_code' => $response->status(),
            'headers' => $response->headers(),
            'body' => $responseData,
            'request' => $message
        ]);
    
        if ($response->failed()) {
            throw new \RuntimeException('FCM API error: ' . $response->body());
        }
    
        // A successful FCM response will contain a 'name' field
        if (!isset($responseData['name'])) {
            throw new \RuntimeException('Malformed FCM response');
        }
    
        return $responseData;
    }

    protected function logNotification(
        string $to,
        ?int $workerId,
        string $title,
        string $body,
        $data
    ): void {
        if ($workerId) {
            WorkerNotification::create([
                'worker_id' => $workerId,
                'to' => $to,
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'status' => 'pending',
            ]);
        }
    }
}