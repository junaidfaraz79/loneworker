<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DashboardController extends Controller
{

    public function index()
    {
        $total_monitors = DB::table('users')->where('role','monitor')->get()->count();
        $total_workers = DB::table('workers')->get()->count();
        $total_customers = DB::table('customers')->get()->count();
        $total_sites = DB::table('sites')->get()->count();

        return view('dashboard', ['total_monitors'=>$total_monitors, 'total_workers'=>$total_workers, 'total_customers'=>$total_customers, 'total_sites'=>$total_sites]);
  
    }

    public function profile()
    {
        $profile = DB::table('users')->where('email',session('email'))->get();
        return view('edit-profile', ['profile'=>$profile[0]]);  
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

        DB::table('users')->where('id',session('user_id'))->update(['username'=>$req->username, 'email'=>$req->email, 'cell_no'=>$req->cell_no, 'phone_no'=>$req->phone_no, 'designation'=>$req->designation, 'company_name'=>$req->company_name, 'official_address'=>$req->official_address, 'user_image'=>$user_image]);

        session()->put('username',$req->username);

        $res = ['id'=>$req->id, 'status'=>'success'];


        return json_encode($res);

    }

    public function subscription()
    {
        $subscription = DB::table('subscriptions')->where('user_email',session('email'))->get();
        return view('my-subscription', ['subscription'=>$subscription[0]]);  
    }    
  
}
