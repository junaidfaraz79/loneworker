<?php

use App\Http\Controllers\WorkerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('/worker/auth', [WorkerController::class, 'authenticateWorker']);

// Routes for workers
Route::middleware('auth:worker')->group(function () {
    Route::get('/worker/test', function () {
        $res = ['status' => 'successful testing with token'];
        return response()->json($res, 200);
    });
    Route::post('/worker/signout', [WorkerController::class, 'signoutWorker']);
});