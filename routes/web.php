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

Route::get('/edit-password', [SigninController::class, 'editPassword'])->name('editPassword');
Route::post('/update-password', [SigninController::class, 'updatePassword'])->name('updatePassword');

Route::get('/dashboard', [DashboardController::class, 'index']);

// Profile
Route::get('/profile', [DashboardController::class, 'profile'])->name('profile');
Route::post('/profile/update', [DashboardController::class, 'update']);
Route::get('/subscription', [DashboardController::class, 'subscription'])->name('subscription');

// Worker Routes
Route::get('/workers', [WorkerController::class, 'list'])->name('workers');
Route::get('/worker/add', [WorkerController::class, 'add'])->name('worker.add');
Route::post('/worker/save', [WorkerController::class, 'save']);
Route::get('/worker/edit/{parameter}', [WorkerController::class, 'edit'])->name('worker.edit');
Route::post('/worker/update', [WorkerController::class, 'update']);
Route::get('/worker/view/{parameter}', [WorkerController::class, 'view'])->name('worker.view');
Route::get('/worker/download-document/{parameter}', [WorkerController::class, 'downloadDocument'])->name('downloadDocument');

// Site Routes
Route::get('/sites', [SiteController::class, 'list'])->name('sites');
Route::get('/site/add', [SiteController::class, 'add'])->name('site.add');
Route::post('/site/save', [SiteController::class, 'save']);
Route::get('/site/edit/{parameter}', [SiteController::class, 'edit'])->name('site.edit');
Route::post('/site/update', [SiteController::class, 'update']);

// Customer Routes
Route::get('/customers', [CustomerController::class, 'list'])->name('customers');
Route::get('/customer/add', [CustomerController::class, 'add'])->name('customer.add');
Route::post('/customer/save', [CustomerController::class, 'save']);
Route::get('/customer/edit/{parameter}', [CustomerController::class, 'edit'])->name('customer.edit');
Route::post('/customer/update', [CustomerController::class, 'update']);

// Users Routes
Route::get('/users', [UserController::class, 'list'])->name('users');
Route::get('/user/add', [UserController::class, 'add'])->name('user.add');
Route::post('/user/save', [UserController::class, 'save']);
Route::get('/user/edit/{parameter}', [UserController::class, 'edit'])->name('user.edit');
Route::post('/user/update', [UserController::class, 'update']);

// Shifts Routes
Route::get('/shifts', [ShiftController::class, 'list'])->name('shifts');
Route::get('/shift/add', [ShiftController::class, 'add'])->name('shift.add');
Route::post('/shift/save', [ShiftController::class, 'save']);
Route::get('/shift/edit/{parameter}', [ShiftController::class, 'edit'])->name('shift.edit');
Route::get('/shift/view/{parameter}', [ShiftController::class, 'view'])->name('shift.view');
Route::post('/shift/update', [ShiftController::class, 'update']);

// Admin Routes
Route::prefix('lwadmin')->group(function () {
    Route::get('/', [AdminController::class, 'login'])->name('admin.login'); // Accessible without authentication
    Route::post('/execute', [AdminController::class, 'executeLogin'])->name('admin.executeLogin'); // Handles login attempts

    // Protected Admin Routes
    Route::middleware([AdminAuth::class])->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard'); // Requires authentication
        Route::get('/signout', [AdminController::class, 'logout'])->name('admin.logout'); // Requires authentication
        Route::get('/profile', [AdminController::class, 'profile'])->name('admin.profile');
        Route::get('/edit-password', [AdminController::class, 'editPassword'])->name('admin.editPassword');
        Route::post('/update-password', [AdminController::class, 'updatePassword'])->name('admin.updatePassword');

        // Subscription Routes
        Route::get('/subscriptions', [SubscriptionController::class, 'list'])->name('subscriptions');
        Route::get('/subscription/edit/{parameter}', [SubscriptionController::class, 'subscription.edit']);
        Route::post('/subscription/update', [SubscriptionController::class, 'subscription.update']);

        // Plan Routes
        Route::get('/plans', [PlanController::class, 'list'])->name('plans');
        Route::get('/plan/add', [PlanController::class, 'add'])->name('plan.add');
        Route::post('/plan/save', [PlanController::class, 'save'])->name('plan.save');
        Route::get('/plan/edit/{parameter}', [PlanController::class, 'edit'])->name('plan.edit');
        Route::post('/plan/update', [PlanController::class, 'update'])->name('plan.update');
    });
});
