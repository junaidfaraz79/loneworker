<?php

namespace App\Http\Controllers;

use App\Models\Monitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MonitorController extends Controller
{
    //
    public function login()
    {
        return view('monitor.signin');  // Return the login view for admins
    }

    public function authenticateMonitor(Request $request)
    {
        $request->validate([
            'email' => 'email|required',
            'password' => 'required',
        ]);

        // Start a transaction to ensure data integrity
        DB::beginTransaction();

        try {
            $monitor = Monitor::where('email', $request->email)->first();

            // Check if monitor exists and password is correct
            if (!$monitor || $request->password !== $monitor->password) {
                // if (!$monitor || !Hash::check($request->password, $monitor->password)) {
                // If authentication fails, we rollback any changes and return an error
                DB::rollback();
                return response()->json([
                    'success' => false,
                    'message' => 'The provided credentials are incorrect.'
                ], 422); // HTTP 422 Unprocessable Entity
            }

            Auth::guard('monitor')->login($monitor);

            // dd('Monitor login attempt', ['user' => Auth::user()]);
            // If authentication is successful, commit the transaction
            DB::commit();

            // Return the token and success message
            return "success";
        } catch (\Exception $e) {
            // If an exception occurs, rollback and return an error
            DB::rollback();
            return "fail";
        }
    }

    public function logout(Request $request)
    {
        // Using the 'monitor' guard to log out the user
        Auth::guard('monitor')->logout();

        // Optionally, you might want to invalidate the user's session completely.
        $request->session()->invalidate();

        // Regenerate the session ID to avoid session fixation attacks
        $request->session()->regenerateToken();

        // Redirect the user to the monitor's login page or the homepage
        return redirect()->route('monitor.login')->with('status', 'You have been successfully logged out.');
    }

    public function dashboard()
    {
        // dd('redirecting to dashboard');
        $total_monitors = DB::table('user')->where('user_type', 'monitor')->get()->count();
        $total_workers = DB::table('workers')->get()->count();
        $total_customers = DB::table('customers')->get()->count();
        $total_sites = DB::table('sites')->get()->count();

        return view('monitor.dashboard', ['total_monitors' => $total_monitors, 'total_workers' => $total_workers, 'total_customers' => $total_customers, 'total_sites' => $total_sites]);
    }

    public function editPassword(Request $req) {
        return view ('monitor.edit-password');
    }

    public function updatePassword(Request $req)
    {
        // Validate the input
        $req->validate([
            'password' => 'required|min:8|confirmed',
        ]);

        try {
            // Assuming email is stored in session and the user is authenticated
            // Type-hint the $monitor variable
            /** @var Monitor $monitor */
            $monitor = Auth::guard('monitor')->user(); // or use Auth::user()->email if using built-in Auth

            // Update the user's password
            $monitor->password = $req->password;
            $updated = $monitor->save();

            // Check if the update was successful
            if ($updated) {
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

    public function profile()
    {
        $profile = DB::table('user')->where('email', Auth::guard('monitor')->user()->email)->get();
        return view('monitor.edit-profile', ['profile'=>$profile[0]]);  
    }

    public function update(Request $req)
    {
        if($req->file('user_image'))
        {
            if($req->file('user_image')->isValid())
                $user_image = $req->file('user_image')->store('public');

            if($req->current_image)
                Storage::delete($req->current_image);
        }            
        elseif($req->current_image)
        {
            $user_image = $req->current_image; 
        }
        else
        {
            $user_image = ''; 
        }

        DB::table('user')->where('id', Auth::guard('monitor')->user()->id)
            ->update(['username'=>$req->username, 
                'email'=>$req->email, 
                'cell_no'=>$req->cell_no, 
                'phone_no'=>$req->phone_no, 
                'designation'=>$req->designation, 
                'company_name'=>$req->company_name, 
                'official_address'=>$req->official_address, 
                'user_image'=>$user_image
            ]);

        session()->put('username',$req->username);

        $res = ['id'=>$req->id, 'status'=>'success'];


        return json_encode($res);

    }
}
