<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SubscriberAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if there's a logged-in user and if the role is 'monitor'
        if (!Auth::guard('subscriber')->check() || Auth::guard('subscriber')->user()->user_type !== 'subscriber') {
            // Redirect them to a different page or error
            return redirect()->route('signin');
        }

        return $next($request);
    }
}
