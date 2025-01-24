<?php

use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SigninController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\WorkerController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ShiftController;
use App\Http\Middleware\AdminAuth;
use Illuminate\Support\Facades\Request;

Route::get('/', function() {
    return view('signin');
});

Route::get('/signin', function() {
    return view('signin');
})->name('signin');

Route::post('/execute', [SigninController::class, 'execute']);

Route::get('/signout', function (Request $request) {
    session()->flush();
    return redirect()->route('signin')->with('message', 'You have successfully logged out from the system.');
});

Route::get('/dashboard', [DashboardController::class, 'index']);

// Profile
Route::get('/profile', [DashboardController::class, 'profile'])->name('profile');
Route::post('/profile/update', [DashboardController::class, 'update']);
Route::get('/subscription', [DashboardController::class, 'subscription'])->name('subscription');

// Worker Routes
Route::get('/workers', [WorkerController::class, 'list'])->name('workers');
Route::get('/worker/add', [WorkerController::class, 'add']);
Route::post('/worker/save', [WorkerController::class, 'save']);
Route::get('/worker/edit/{parameter}', [WorkerController::class, 'edit']);
Route::post('/worker/update', [WorkerController::class, 'update']);
Route::get('/worker/view/{parameter}', [WorkerController::class, 'view']);
Route::get('/worker/download-document/{parameter}', [WorkerController::class, 'downloadDocument'])->name('downloadDocument');

// Site Routes
Route::get('/sites', [SiteController::class, 'list'])->name('sites');
Route::get('/site/add', [SiteController::class, 'add']);
Route::post('/site/save', [SiteController::class, 'save']);
Route::get('/site/edit/{parameter}', [SiteController::class, 'edit']);
Route::post('/site/update', [SiteController::class, 'update']);

// Customer Routes
Route::get('/customers', [CustomerController::class, 'list'])->name('customers');
Route::get('/customer/add', [CustomerController::class, 'add']);
Route::post('/customer/save', [CustomerController::class, 'save']);
Route::get('/customer/edit/{parameter}', [CustomerController::class, 'edit']);
Route::post('/customer/update', [CustomerController::class, 'update']);

// Users Routes
Route::get('/users', [UserController::class, 'list'])->name('users');
Route::get('/user/add', [UserController::class, 'add']);
Route::post('/user/save', [UserController::class, 'save']);
Route::get('/user/edit/{parameter}', [UserController::class, 'edit']);
Route::post('/user/update', [UserController::class, 'update']);

// Shifts Routes
Route::get('/shifts', [ShiftController::class, 'list'])->name('users');
Route::get('/shift/add', [ShiftController::class, 'add']);
Route::post('/shift/save', [ShiftController::class, 'save']);
Route::get('/shift/edit/{parameter}', [ShiftController::class, 'edit']);
Route::post('/shift/update', [ShiftController::class, 'update']);

// Admin Routes
Route::prefix('lwadmin')->group(function () {
    Route::get('/', [AdminController::class, 'login'])->name('admin.login'); // Accessible without authentication
    Route::post('/execute', [AdminController::class, 'executeLogin'])->name('admin.executeLogin'); // Handles login attempts

    // Protected Admin Routes
    Route::middleware([AdminAuth::class])->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard'); // Requires authentication
        Route::get('/signout', [AdminController::class, 'logout'])->name('admin.logout'); // Requires authentication

        // Subscription Routes
        Route::get('/subscriptions', [SubscriptionController::class, 'list'])->name('subscriptions');
        Route::get('/subscription/edit/{parameter}', [SubscriptionController::class, 'edit']);
        Route::post('/subscription/update', [SubscriptionController::class, 'update']);

        // Plan Routes
        Route::get('/plans', [PlanController::class, 'list'])->name('plans');
        Route::get('/plan/add', [PlanController::class, 'add']);
        Route::post('/plan/save', [PlanController::class, 'save']);
        Route::get('/plan/edit/{parameter}', [PlanController::class, 'edit']);
        Route::post('/plan/update', [PlanController::class, 'update']);
    });
});
