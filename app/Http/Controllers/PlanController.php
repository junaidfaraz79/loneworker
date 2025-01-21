<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;


class PlanController extends Controller
{
    public function list()
    {
        $plans = DB::table('plans')->get();
        return view('plans', ['plans'=>$plans]);
    }

    public function add()
    {
        $features = DB::table('features')->get();
        return view('add-plan', ['features'=>$features]);
    }         

    public function save(Request $req)
    {

        try {

            $duplicate = DB::table('plans')->where('plan_name','=',$req->plan_name)->get();

            if(count($duplicate))
            {            
                $res = ['id'=>'', 'status'=>'duplicate'];            
            }
            else
            {    
                if($req->file('plan_image'))
                {
                    if($req->file('plan_image')->isValid())
                        $plan_image = $req->file('plan_image')->store('public');
                }            
                else
                    $plan_image = ''; 
    
                $id = DB::table('plans')->insertGetId([
                'plan_name'=>$req->plan_name, 'plan_description'=>$req->plan_description, 'plan_type'=>$req->plan_type, 'monthly_price'=>$req->monthly_price, 'yearly_price'=>$req->yearly_price,'duration'=>$req->duration, 'persons'=>$req->persons, 'plan_status'=>$req->plan_status, 'plan_image'=>$plan_image]);

                $save_feature = array();

                if(isset($req->features))
                {
                    foreach($req->features as $key => $f)
                    {
                        $rec = ['plan_id'=>$id,
                                'feature_id'=>$f
                                ];
                        array_push($save_feature, $rec);
                    }

                    if(count($save_feature))
                        DB::table('plan_features')->insert($save_feature);
                }   
    
                $res = ['id'=>'$id', 'status'=>'success'];
    
            }
    
            return json_encode($res);
          
          } catch (\Exception $e) {
          
              return json_encode($e->getMessage());

          }

    }

    public function edit(Request $req, string $id)
    {
        $plan = DB::table('plans as P')->where('P.id','=',$id)->get();

        if(count($plan))
        {
            $features = DB::table('features')->get();

            $data = DB::table('plan_features')
                        ->select('feature_id')
                        ->where('plan_id','=',$plan[0]->id)
                        ->get()->toArray();

            $plan_features = array();

            foreach($data as $key => $f)
            {
                array_push($plan_features, $f->feature_id);
            }

            return view('edit-plan', ['plan' => $plan, 'features'=>$features, 'plan_features'=>$plan_features]);
        }
        else 
            return redirect(route('plans'));
    }
    
    public function update(Request $req)
    {

        try {

            $duplicate = DB::table('plans')->where('plan_name','=',$req->plan_name)->where('id','<>',$req->id)->get();

            if(count($duplicate))
            {            
                $res = ['id'=>'', 'status'=>'duplicate'];            
            }
            else
            {
                if($req->file('plan_image'))
                {
                    if($req->file('plan_image')->isValid())
                        $plan_image = $req->file('plan_image')->store('public');
        
                    if($req->current_image)
                        Storage::delete($req->current_image);
                }            
                elseif($req->current_image)
                {
                    $plan_image = $req->current_image; 
                }
                else
                {
                    $plan_image = ''; 
                }
        
                DB::table('plans')->where('id',$req->id)->update(['plan_name'=>$req->plan_name, 'plan_description'=>$req->plan_description, 'plan_type'=>$req->plan_type, 'monthly_price'=>$req->monthly_price, 'yearly_price'=>$req->yearly_price,'duration'=>$req->duration, 'persons'=>$req->persons, 'plan_status'=>$req->plan_status, 'plan_image'=>$plan_image]);

                $save_feature = array();

                if(isset($req->features))
                {
                    foreach($req->features as $key => $f)
                    {
                        $rec = ['plan_id'=>$req->id,
                                'feature_id'=>$f
                                ];
                        array_push($save_feature, $rec);
                    }

                    DB::table('plan_features')->where('plan_id',$req->id)->delete();

                    if(count($save_feature))
                        DB::table('plan_features')->insert($save_feature);
                }                   

                $res = ['id'=>$req->id, 'status'=>'success'];

            }

            return json_encode($res);

        } catch (\Exception $e) {
          
            return json_encode($e->getMessage());
        }            

    }

    public function delete(Request $req)
    {

        $child_records = DB::table('tbl_project')->where('community_id','=',$req->id)->get();

        if(count($child_records))
        {
            $res = ['id'=>$req->id, 'status'=>'child_exist']; 
        }
        else
        {
            DB::table('tbl_community')->where('id',$req->id)->delete();
            DB::table('tbl_community_attraction')->where('community_id',$req->id)->delete();
            DB::table('tbl_faqs')->where('community_id',$req->id)->delete();
            $res = ['id'=>$req->id, 'status'=>'success'];
        }              

        return json_encode($res);

    }

}
