<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\Verified;

class VerificationController extends Controller
{
    public function show()
    {
        // dd("OK");
        return view('verify-email');
    }

    public function verify($id, $hash)
    {
        // Find the subscriber by ID
        $subscriber = Subscriber::findOrFail($id);

        // If the subscriber already verified, redirect to home
        if ($subscriber->hasVerifiedEmail()) {
            return redirect()->route('signin');
        }

        // Verify the email
        if (! Hash::check($hash, $subscriber->getEmailVerificationHash())) {
            abort(403);
        }

         // Mark the email as verified
         $subscriber->markEmailAsVerified();
         event(new Verified($subscriber));

        // Redirect to home with a success message
        return redirect()->route('signin')->with('verified', true);
    }
}
