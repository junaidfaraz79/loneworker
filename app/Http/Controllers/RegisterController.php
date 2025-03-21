<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\Registered;

class RegisterController extends Controller
{
    public function showRegistrationForm()
    {
        return view('register');
    }

    public function register(Request $request)
    {
        // dd("OK");
        // Validate the form data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:subscribers,email',
            'password' => 'required|string|confirmed|min:8',
        ]);

       

        if ($validator->fails()) {
            // dd("OK");
            dd($validator->errors());
            return redirect()->route('register')->withErrors($validator)->withInput();
        }

        // Create new user
        $subscriber = Subscriber::create([
            'username' => $request->name,
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => 'subscriber',
            'cell_no' => '123-456-7890',
            'phone_no' => '333-305-4572',
            'company_name' => 'Dummy Company',
            'official_address' => '123 Dummy Address',
            'designation' => 'Employee',
            'user_image' => 'default_image.jpg',
            'user_type' => 'subscriber',
            'subscription_id' => 17
        ]);

        

        // Fire registered event
        event(new Registered($subscriber));

        

        // Send verification email
        $subscriber->sendEmailVerificationNotification();
        

        // dd($subscriber);
        return redirect()->route('verification.notice')->with('email', $subscriber->email);
        // return redirect()->route('verify-email');
    }
}
