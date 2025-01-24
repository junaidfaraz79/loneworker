<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SigninController extends Controller
{
    public function execute(Request $req) {

        $user = DB::table('users')
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

}
