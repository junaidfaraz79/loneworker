<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminAuth
{
    public function handle(Request $request, Closure $next)
    {
        if (session()->has('admin_authenticated') && session('admin_authenticated') === true) {
            return $next($request);
        }
        return redirect()->route('admin.login');
    }
}

