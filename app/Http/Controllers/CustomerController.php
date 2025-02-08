<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;


class CustomerController extends Controller
{
    public function list()
    {
        $customers = DB::table('customers')
            ->leftJoin('sites', 'customers.id', '=', 'sites.customer_id')
            ->select(
                'customers.id as customer_id',
                'customers.customer_name',
                'customers.email',
                'customers.phone_no',
                'sites.id as site_id',
                'sites.site_name'
            )
            ->get();

        // Prepare the data structure
        $customersWithSites = [];

        foreach ($customers as $record) {
            if (!isset($customersWithSites[$record->customer_id])) {
                $customersWithSites[$record->customer_id] = [
                    'id' => $record->customer_id,
                    'name' => $record->customer_name,
                    'email' => $record->email,
                    'phone_no' => $record->phone_no,
                    'sites' => []
                ];
            }

            if ($record->site_id) {  // Only add sites if they exist
                $customersWithSites[$record->customer_id]['sites'][] = [
                    'id' => $record->site_id,
                    'name' => $record->site_name
                ];
            }
        }

        return view('monitor.customers', ['customers' => $customersWithSites]);
    }


    public function add()
    {
        $frequency = DB::table('check_in_frequency')->get();
        return view('monitor.add-customer', ['frequency' => $frequency]);
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

        if ($req->file('customer_image')) {
            if ($req->file('customer_image')->isValid())
                $customer_image = $req->file('customer_image')->store('public');
        } else
            $customer_image = '';

        $id = DB::table('customers')->insertGetId([
            'customer_name' => $req->customer_name,
            'phone_no' => $req->phone_no,
            'email' => $req->email,
            'role' => $req->role,
            'department' => $req->department,
            'customer_image' => $customer_image,
            'customer_status' => $req->customer_status
        ]);

        $res = ['id' => $id, 'status' => 'success'];

        // }

        return json_encode($res);
    }

    public function edit(Request $req, string $id)
    {
        $customer = DB::table('customers')->where('id', '=', $id)->get();
        if (count($customer))
            return view('monitor.edit-customer', ['customer' => $customer[0]]);
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

        DB::table('customers')->where('id', $req->id)->update(['customer_name' => $req->customer_name, 'phone_no' => $req->phone_no, 'email' => $req->email, 'role' => $req->role, 'department' => $req->department,  'customer_image' => $customer_image, 'customer_status' => $req->customer_status]);

        $res = ['id' => $req->id, 'status' => 'success'];

        // }

        return json_encode($res);
    }

    public function delete(Request $req)
    {

        DB::table('customers')->where('id', $req->id)->delete();
        $res = ['id' => $req->id, 'status' => 'success'];
        return json_encode($res);
    }
}
