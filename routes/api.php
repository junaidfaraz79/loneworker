<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\WorkerCheckInsController;
use App\Http\Controllers\WorkerController;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::post('/worker/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail'])->name('worker.password.email');
Route::post('/worker/reset-password', [ResetPasswordController::class, 'reset'])->name('worker.password.update');

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('/worker/auth', [WorkerController::class, 'authenticateWorker']);

// Routes for workers
Route::middleware('auth:worker')->group(function () {
    Route::get('/worker/test', function (Request $request) {
        $workerId = Auth::guard('worker')->user()->id;
        $worker= Worker::find($workerId);
        $worker->sendPushNotification('Hello!', 'This is a test notification.', ['screen' => 'Shift Details']);

        $res = ['status' => 'successful testing with token'];
        return response()->json($res, 200);
    });
    Route::post('/worker/signout', [WorkerController::class, 'signoutWorker']);
    Route::post('/worker/change-password', [WorkerController::class, 'changePassword']);
    Route::post('/worker/attendance', [AttendanceController::class, 'attendance']);
    Route::post('/worker/checkin', [WorkerCheckInsController::class, 'checkin']);
    Route::get('/worker/checkin-history', [WorkerCheckInsController::class, 'historyByWorkerId']);
    Route::post('/worker/checkout', [AttendanceController::class, 'checkout']);
    Route::get('/worker/shift-details', [WorkerController::class, 'getDetailedWorkerShifts']);
});