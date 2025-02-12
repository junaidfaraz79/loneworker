<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SigninController extends Controller
{
    public function execute(Request $req)
    {

        $req->validate([
            'email' => 'email|required',
            'password' => 'required',
        ]);
        $subscriber = Subscriber::where('email', $req->email)->first();

        // Check if monitor exists and password is correct
        if (!$subscriber || $req->password !== $subscriber->password) {
            return "fail";
        }

        Auth::guard('subscriber')->login($subscriber);

        return "success";
    }

    public function editPassword(Request $req)
    {
        return view('edit-password');
    }

    public function updatePassword(Request $req)
    {
        // Validate the input
        $req->validate([
            'password' => 'required|min:8|confirmed',
        ]);

        try {
            // Assuming email is stored in session and the user is authenticated
            // $email = Auth::guard('subscriber')->user()->email; // or use Auth::user()->email if using built-in Auth

            // Update the user's password
            // $updated = DB::table('user')
            //     ->where('email', $email)
            //     ->update(['password' => $req->password]);
            // ->update(['password' => bcrypt($req->password)]);

            if (Auth::guard('subscriber')->check()) {
                $req->user()->password = $req->password;
                $req->user()->save();

                $res = ['status' => 'success'];
                return response()->json($res, 200);
            } else {
                // If no rows were updated, handle the case
                $res = ['status' => 'error'];
                return response()->json($res, 500);
            }
        } catch (\Exception $e) {
            // Log the error
            // \Log::error('Password update failed: ' . $e->getMessage());
            // Redirect back with error message
            $res = ['status' => 'error'];
            return response()->json($res, 500);
        }
    }

    public function signout(Request $req)
    {
        // Using the 'subscriber' guard to log out the user
        Auth::guard('subscriber')->logout();

        // Optionally, you might want to invalidate the user's session completely.
        $req->session()->invalidate();

        // Regenerate the session ID to avoid session fixation attacks
        $req->session()->regenerateToken();
        return redirect()->route('signin')->with('message', 'You have successfully logged out from the system.');
    }
}
