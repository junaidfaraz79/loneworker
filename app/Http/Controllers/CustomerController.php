<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;


class CustomerController extends Controller
{
    public function list()
    {
        $customers = DB::table('customers')->get();
        return view('customers', ['customers'=>$customers]);
    }

    public function add()
    {
        $frequency = DB::table('check_in_frequency')->get();
        return view('add-customer', ['frequency'=>$frequency]);  
    }         

    public function save(Request $req)
    {

        // $duplicate = DB::table('customers')->where('phone_no','=',$req->phone_no)->OrWhere('email','=',$req->email)->get();

        // if(count($duplicate))
        // {            
        //     $res = ['id'=>'', 'status'=>'duplicate'];            
        // }
        // else
        // {

            if($req->file('customer_image'))
            {
                if($req->file('customer_image')->isValid())
                    $customer_image = $req->file('customer_image')->store('public');
            }            
            else
                $customer_image = ''; 

            $id = DB::table('customers')->insertGetId([
                'customer_name'=>$req->customer_name, 'phone_no'=>$req->phone_no, 'email'=>$req->email, 'role'=>$req->role, 'department'=>$req->department, 'customer_image'=>$customer_image, 'customer_status'=>$req->customer_status]);

            $res = ['id'=>$id, 'status'=>'success'];

        // }

        return json_encode($res);

    }

    public function edit(Request $req, string $id)
    {
        $customer = DB::table('customers')->where('id','=',$id)->get();
        if(count($customer))
            return view('edit-customer', ['customer' => $customer[0]]);
        else 
            return redirect(route('customers'));
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
