<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;


class SiteController extends Controller
{
    public function list()
    {
        $sites = DB::table('sites')->get();
        return view('sites', ['sites'=>$sites]);
    }

    public function add()
    {
        return view('add-site');  
    }         

    public function save(Request $req)
    {

        if($req->file('site_image'))
        {
            if($req->file('site_image')->isValid())
                $site_image = $req->file('site_image')->store('public');
        }            
        else
            $site_image = ''; 

        $id = DB::table('sites')->insertGetId([
            'site_name'=>$req->site_name, 'site_address'=>$req->site_address, 'site_image'=>$site_image, 'site_status'=>$req->site_status]);

        $res = ['id'=>$id, 'status'=>'success'];

        return json_encode($res);

    }

    public function edit(Request $req, string $id)
    {
        $site = DB::table('sites')->where('id','=',$id)->get();
        if(count($site)) {
            return view('edit-site', ['site'=>$site[0]]);
        }
        else 
            return redirect(route('sites'));
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
            // if($req->file('site_image'))
            // {
            //     if($req->file('site_image')->isValid())
            //         $site_image = $req->file('site_image')->store('public');
    
            //     if($req->current_image)
            //         Storage::delete($req->current_image);
            // }            
            // elseif($req->current_image)
            // {
            //     $site_image = $req->current_image; 
            // }
            // else
            // {
                $site_image = ''; 
            // }
    
            DB::table('sites')->where('id',$req->id)->update(['site_name'=>$req->site_name, 'site_address'=>$req->site_address, 'site_image'=>$site_image, 'site_status'=>$req->site_status]);

            $res = ['id'=>$req->id, 'status'=>'success'];

        // }

        return json_encode($res);

    }

    public function delete(Request $req)
    {
        DB::table('sites')->where('id',$req->id)->delete();
        $res = ['id'=>$req->id, 'status'=>'success'];
        return json_encode($res);
    }


}
