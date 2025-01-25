<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
                'admin_authenticated' => TRUE
            ]);

            return "success";
        }

        return "fail";
    }

    public function dashboard()
    {
        $total_monitors = DB::table('users')->where('role','monitor')->get()->count();
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
        $profile = DB::table('lwadmin')->where('email',session('email'))->get();
        return view('edit-profile', ['profile'=>$profile[0]]);  
    }
}

