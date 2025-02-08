<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class MonitorAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Check if there's a logged-in user and if the role is 'monitor'
        if (!Auth::guard('monitor')->check() || Auth::guard('monitor')->user()->user_type !== 'monitor') {
            // Redirect them to a different page or error
            return redirect()->route('monitor.login');
        }

        return $next($request);
    }
}
