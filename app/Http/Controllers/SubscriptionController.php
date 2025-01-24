<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;


class SubscriptionController extends Controller
{
    public function list()
    {
        $subscriptions = DB::table('subscriptions')
                            ->join('users', 'users.email','=','subscriptions.user_email')
                            ->select('subscriptions.id', 'subscriptions.plan_name', 'subscriptions.status', 'subscriptions.added_on', 'users.username', 'users.email', 'users.phone_no', 'users.company_name', 'users.designation')
                            ->where('user_type', 'subscriber')
                            ->get();
                       
        return view('admin.subscriptions', ['subscriptions'=>$subscriptions]);
    }

    public function add()
    {
        $frequency = DB::table('check_in_frequency')->get();
        return view('add-customer', ['frequency'=>$frequency]);  
    }         

    public function edit(Request $req, string $id)
    {
        $subscription = DB::table('subscriptions')->where('subscriptions.id','=',$id)
                            ->select('subscriptions.*', 'users.*', 'subscriptions.id as subscription_id')
                            ->join('users', 'users.email','=','subscriptions.user_email')->get();

        if(count($subscription))
        {
            $plans = DB::table('plans')->get();
            return view('admin.edit-subscription', ['subscription' => $subscription[0], 'plans'=>$plans]);
        }
        else 
            return redirect(route('subscriptions'));

    }
    
    public function update(Request $req)
    {
   
        DB::table('subscriptions')->where('id',$req->id)->update(['status'=>$req->status]);
        $res = ['id'=>$req->id, 'status'=>'success'];

        return json_encode($res);
    }

    public function delete(Request $req)
    {

        DB::table('customers')->where('id',$req->id)->delete();
        $res = ['id'=>$req->id, 'status'=>'success'];
        return json_encode($res);

    }


}
