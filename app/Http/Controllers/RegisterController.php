<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;

class RegisterController extends Controller
{
    public function showRegistrationForm()
    {
        $subscriptions = DB::table('plans')->get();
        return view('register', compact('subscriptions'));
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
            'plan_id' => $request->plan_id,
            'role' => 'subscriber',
            'cell_no' => '123-456-7890',
            'phone_no' => '333-305-4572',
            'company_name' => $request->company_name,
            'designation' => 'Employee',
            'user_image' => 'default_image.jpg',
            'user_type' => 'subscriber',
            'company_number' => $request->company_number,
            'address_line_1' => $request->address_line_1,
            'address_line_2' => $request->address_line_2,
            'country' => $request->country,
            'locality' => $request->locality,
            'region' => $request->region,
            'postal_code' => $request->postal_code,
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
