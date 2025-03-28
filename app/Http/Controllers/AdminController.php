<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function login()
    {
        return view('admin.signin');  // Return the login view for admins
    }

    public function executeLogin(Request $req)
    {
        $admin = DB::table('lwadmin')
                    ->where([
                        ['email', '=', $req->email],
                        ['password', '=', $req->password],  // Consider hashing your passwords
                    ])->first();

        if ($admin) {
            session([
                'username'=>$admin->username, 
                'user_id' => $admin->id, 
                'role' => $admin->role, 
                'email' => $req->email, 
                'subscriber_authenticated' => FALSE, 
                'monitor_authenticated' => FALSE, 
                'admin_authenticated' => TRUE
            ]);

            return "success";
        }

        return "fail";
    }

    public function dashboard()
    {
        $total_monitors = DB::table('user')->where('role','monitor')->get()->count();
        $total_workers = DB::table('workers')->get()->count();
        $total_customers = DB::table('customers')->get()->count();
        $total_sites = DB::table('sites')->get()->count();

        return view('admin.dashboard', ['total_monitors'=>$total_monitors, 'total_workers'=>$total_workers, 'total_customers'=>$total_customers, 'total_sites'=>$total_sites]);
    }

    public function logout()
    {
        session()->flush();  // Clearing the session
        return redirect()->route('admin.login')->with('message', 'You have successfully logged out from the system.');
    }

    public function profile()
    {
        $profile = DB::table('lwadmin')->where('email',session('email'))->first();
        return view('admin.edit-profile', ['profile'=>$profile]);  
    }

    public function profileUpdate(Request $req)
    {
        // Type-hint the $monitor variable
        $admin = DB::table('lwadmin')->where('id',session('user_id'))->first();

        if ($req->file('user_image')) {
            if ($req->file('user_image')->isValid())
                $user_image = $req->file('user_image')->store('public');

            if ($req->current_image)
                Storage::delete($req->current_image);
        } elseif ($req->current_image) {
            $user_image = $req->current_image;
        } else {
            $user_image = '';
        }

        DB::table('lwadmin')->where('id',session('user_id'))->update([
            'username' => $req->username,
            'email' => $req->email,
            'cell_no' => $req->cell_no,
            'phone_no' => $req->phone_no,
            'designation' => $req->designation,
            'company_name' => $req->company_name,
            'official_address' => $req->official_address,
            'user_image' => $user_image
        ]);

        $res = ['id' => $req->id, 'status' => 'success'];

        return json_encode($res);
    }
    
    public function updatePassword(Request $req)
    {
        // Validate the input
        $req->validate([
            'password' => 'required|min:8|confirmed',
        ]);

        try {
            // Assuming email is stored in session and the user is authenticated
            $email = session('email'); // or use Auth::user()->email if using built-in Auth

            // Update the user's password
            $updated = DB::table('lwadmin')
                ->where('email', $email)
                ->update(['password' => $req->password]);
                // ->update(['password' => bcrypt($req->password)]);

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
            $res = ['status' => 'error', 'message' => $e->getMessage()];
            return response()->json($res, 500);
        }
    }

    public function editPassword(Request $req) {
        return view ('admin.edit-password');
    }
}

