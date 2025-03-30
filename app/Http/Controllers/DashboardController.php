<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DashboardController extends Controller
{

    public function index()
    {
        $total_monitors = DB::table('user')->where('role','monitor')->get()->count();
        $total_workers = DB::table('workers')->get()->count();
        $total_customers = DB::table('customers')->get()->count();
        $total_sites = DB::table('sites')->get()->count();

        return view('dashboard', ['total_monitors'=>$total_monitors, 'total_workers'=>$total_workers, 'total_customers'=>$total_customers, 'total_sites'=>$total_sites]);
    }

    public function profile()
    {
        $profile = Auth::guard('subscriber')->user();
        return view('edit-profile', ['profile' => $profile]);  
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

        DB::table('subscribers')->where('id', Auth::guard('subscriber')->user()->id)->update([
            'username'=>$req->username, 
            'email'=>$req->email, 
            'cell_no'=>$req->cell_no, 
            'phone_no'=>$req->phone_no, 
            'designation'=>$req->designation, 
            'company_name'=>$req->company_name, 
            'user_image'=>$user_image,
            'company_number' => $req->company_number,
            'address_line_1' => $req->address_line_1,
            'address_line_2' => $req->address_line_2,
            'country' => $req->country,
            'locality' => $req->locality,
            'region' => $req->region,
            'postal_code' => $req->postal_code,
        ]);

        $res = ['id'=>$req->id, 'status'=>'success'];

        session()->put('username',$req->username);

        return json_encode($res);

    }

    public function subscription()
    {
        $subscription = DB::table('subscriptions')->where('user_email', Auth::guard('subscriber')->user()->email)->first();
        $card = DB::table('cards')->where('subscriber_id', Auth::guard('subscriber')->user()->id)->first();
        return view('my-subscription', ['subscription'=>$subscription, 'card' => $card]);  
    }    
  
}
