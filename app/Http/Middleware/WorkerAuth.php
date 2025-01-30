<?php

namespace App\Http\Middleware;
use Laravel\Sanctum\PersonalAccessToken;
use Closure;
use Illuminate\Http\Request;

class WorkerAuth
{
    public function handle(Request $request, Closure $next)
    {
        if (session()->has('worker_authenticated') && session('worker_authenticated') === true) {
            return $next($request);
        }
        return redirect()->route('admin.login');
    }
}

