<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

//*******************THIS IS A SUBSCRIBER CONTROLLER**********************
class SubscriberController extends Controller
{
    public function list()
    {
        $userId = session('user_id');
        $users = DB::table('subscribers')
                            ->join('subscriptions', 'subscribers.email','=','subscriptions.user_email')
                            ->select('subscriptions.id', 'subscriptions.plan_name', 'subscriptions.status', 'subscriptions.added_on', 'subscribers.username', 'subscribers.email', 'subscribers.phone_no', 'subscribers.company_name', 'subscribers.designation')
                            ->where('subscribers.user_type', 'subscriber')
                            ->get();

        return view('users', ['users'=>$users]);
    }

    public function add()
    {
        $plans = DB::table('plans')->get();
        return view('add-user', ['plans'=>$plans]);  
    }         

    public function save(Request $req)
    {

        $duplicate = DB::table('subscribers')->where('email','=',$req->email)->get();

        if(count($duplicate))
        {            
            $res = ['id'=>'', 'status'=>'duplicate'];            
        }
        else
        {        

            $id = DB::table('subscribers')->insertGetId([
                        'username'=>$req->username, 
                        'role'=>'subscriber', 
                        'email'=>$req->email,
                        'password'=>'password', 
                        'cell_no'=>$req->cell_no, 
                        'phone_no'=>$req->phone_no, 
                        'company_name'=>$req->company_name, 
                        'official_address'=>$req->official_address,
                        'designation'=>$req->designation,
                        'user_type'=>'subscriber',
                        // 'status'=>'active'
                    ]);

            $plan = DB::table('plans')->select('plan_name', 'plan_description', 'plan_type', 'monthly_price', 'yearly_price', 'duration', 'persons')->where('id',$req->plan_id)->get()->toArray();

            $user_plan = [
                            'user_email'=>$req->email,
                            'plan_name'=>$plan[0]->plan_name,
                            'plan_description'=>$plan[0]->plan_description,
                            'plan_type'=>$plan[0]->plan_type,
                            'monthly_price'=>$plan[0]->monthly_price,
                            'yearly_price'=>$plan[0]->yearly_price,
                            'duration'=>$plan[0]->duration,
                            'persons'=>$plan[0]->persons,
                            'status'=>'active'
                        ];

            $id = DB::table('subscriptions')->insertGetId($user_plan);
            
            $res = ['id'=>$id, 'status'=>'success'];

        }

        return json_encode($res);

    }

    public function edit(Request $req, string $id)
    {
        $subscription = DB::table('subscriptions')->where('subscriptions.id','=',$id)
                            ->join('subscribers', 'subscribers.email','=','subscriptions.user_email')->get();

        if(count($subscription))
        {
            $plans = DB::table('plans')->get();
            return view('edit-subscription', ['subscription' => $subscription[0], 'plans'=>$plans]);
        }
        else 
            return redirect(route('subscriptions'));

    }
    
    public function update(Request $req)
    {

        // $duplicate = DB::table('plans')->where('plan_name','=',$req->plan_name)->where('id','<>',$req->id)->get();

        // if(count($duplicate))
        // {            
        //     $res = ['id'=>'', 'status'=>'duplicate'];            
        // }
        // else
        // {
            // if($req->file('customer_image'))
            // {
            //     if($req->file('customer_image')->isValid())
            //         $customer_image = $req->file('customer_image')->store('public');
    
            //     if($req->current_image)
            //         Storage::delete($req->current_image);
            // }            
            // elseif($req->current_image)
            // {
            //     $customer_image = $req->current_image; 
            // }
            // else
            // {
                $customer_image = ''; 
            // }
    
            DB::table('customers')->where('id',$req->id)->update(['customer_name'=>$req->customer_name, 'phone_no'=>$req->phone_no, 'email'=>$req->email, 'role'=>$req->role, 'department'=>$req->department,  'customer_image'=>$customer_image, 'customer_status'=>$req->customer_status]);

            $res = ['id'=>$req->id, 'status'=>'success'];

        // }

        return json_encode($res);

    }

    public function delete(Request $req)
    {

        DB::table('customers')->where('id',$req->id)->delete();
        $res = ['id'=>$req->id, 'status'=>'success'];
        return json_encode($res);

    }
}
