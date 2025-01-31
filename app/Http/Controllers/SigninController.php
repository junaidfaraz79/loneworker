<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SigninController extends Controller
{
    public function execute(Request $req) {

        $user = DB::table('user')
                        ->where(
                            [
                                ['email', '=', $req->email],
                                ['password', '=', $req->password],
                            ]
                        )->get();
        
        if(count($user)) {

            session([
                'username'=>$user[0]->username, 
                'user_id' => $user[0]->id, 
                'role' => $user[0]->role, 
                'email' => $req->email, 
                'authenticated' => TRUE, 
                'admin_authenticated' => FALSE
            ]);

            return "success";
        }
            
        else
            return "fail";

    }

    public function editPassword(Request $req) {
        return view ('edit-password');
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
            $updated = DB::table('user')
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
            // Log the error
            // \Log::error('Password update failed: ' . $e->getMessage());
            // Redirect back with error message
            $res = ['status' => 'error'];
            return response()->json($res, 500);
        }
    }

}
