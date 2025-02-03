<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;

class ForgotPasswordController extends Controller
{
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        Log::info('Password::RESET_LINK_SENT: ' . $request->email);
        
        $status = Password::broker('workers')->sendResetLink(
            $request->only('email')
        );
        Log::info('Password::RESET_LINK_SENT: ' . Password::RESET_LINK_SENT);
        return $status === Password::RESET_LINK_SENT
                    ? response()->json(['message' => __($status)], 200)
                    : response()->json(['message' => __($status)], 400);
    }
}
