<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;


class WorkerController extends Controller
{
    public function list()
    {
        $workers = DB::table('workers')->get();
        return view('workers', ['workers'=>$workers]);
    }

    public function add()
    {
        $frequency = DB::table('check_in_frequency')->get();
        return view('add-worker', ['frequency'=>$frequency]);  
    }         

    public function save(Request $req)
    {

        // $duplicate = DB::table('workers')->where('phone_no','=',$req->phone_no)->OrWhere('email','=',$req->email)->get();

        // if(count($duplicate))
        // {            
        //     $res = ['id'=>'', 'status'=>'duplicate'];            
        // }
        // else
        // {

            if($req->file('worker_image'))
            {
                if($req->file('worker_image')->isValid())
                    $worker_image = $req->file('worker_image')->store('public');
            }            
            else
                $worker_image = ''; 

            $id = DB::table('workers')->insertGetId([
                'worker_name'=>$req->worker_name, 'phone_no'=>$req->phone_no, 'email'=>$req->email, 'pin'=>'', 'phone_type'=>$req->phone_type,'role'=>$req->role, 'department'=>$req->department, 'check_in_frequency'=>$req->check_in_frequency, 'worker_image'=>$worker_image, 'worker_status'=>$req->worker_status]);

            $res = ['id'=>$id, 'status'=>'success'];

        // }

        return json_encode($res);

    }

    public function edit(Request $req, string $id)
    {
        $worker = DB::table('workers')->where('id','=',$id)->get();
        if(count($worker)) {
            $frequency = DB::table('check_in_frequency')->get();
            return view('edit-worker', ['worker' => $worker[0], 'frequency'=>$frequency]);
        }
        else 
            return redirect(route('workers'));
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
            // if($req->file('worker_image'))
            // {
            //     if($req->file('worker_image')->isValid())
            //         $worker_image = $req->file('worker_image')->store('public');
    
            //     if($req->current_image)
            //         Storage::delete($req->current_image);
            // }            
            // elseif($req->current_image)
            // {
            //     $worker_image = $req->current_image; 
            // }
            // else
            // {
                $worker_image = ''; 
            // }
    
            DB::table('workers')->where('id',$req->id)->update(['worker_name'=>$req->worker_name, 'phone_no'=>$req->phone_no, 'email'=>$req->email, 'pin'=>'', 'phone_type'=>$req->phone_type,'role'=>$req->role, 'department'=>$req->department, 'check_in_frequency'=>$req->check_in_frequency, 'worker_image'=>$worker_image, 'worker_status'=>$req->worker_status]);

            $res = ['id'=>$req->id, 'status'=>'success'];

        // }

        return json_encode($res);

    }

    public function delete(Request $req)
    {

        DB::table('workers')->where('id',$req->id)->delete();
        $res = ['id'=>$req->id, 'status'=>'success'];
        return json_encode($res);

    }


}
