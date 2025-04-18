<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;


class ShiftController extends Controller
{
    public function list()
    {
        $shifts = DB::table('shifts')->where('shifts.subscriber_id', Auth::guard('monitor')->user()->subscriber_id)->get();
        $sites = DB::table('sites')->where('sites.subscriber_id', Auth::guard('monitor')->user()->subscriber_id)->get();
        return view('monitor.shifts', ['shifts' => $shifts, 'sites' => $sites]);
    }

    public function shiftsBySite(Request $req, $site_id)
    {
        try {
            $shifts = DB::table('shifts')
            ->where('shifts.subscriber_id', Auth::guard('monitor')->user()->subscriber_id)
            ->where('site_id', intval($site_id))
            ->get();

            if ($shifts) {
                $res = ['shifts' => $shifts, 'status' => 'success'];
                return response()->json($res, 200);  // Return a 200 OK with the response
            } else {
                // If insertion failed
                $res = ['shifts' => null, 'status' => 'not found'];
                return response()->json($res, 404);  // Return a 500 Internal Server Error
            }
        }
        catch (\Exception $e) {
            // Log the exception
            Log::error('Error saving shift: ' . $e->getMessage());

            // Return an error response
            $res = ['id' => null, 'status' => 'error', 'message' => 'Server error occurred: ' . $e];
            return response()->json($res, 500);  // Return a 500 Internal Server Error
        }
        
    }

    public function add()
    {
        // $plans = DB::table('plans')->get();
        $timings = DB::table('timings')->get();
        $frequency = DB::table('check_in_frequency')->get();
        $sites = DB::table('sites')->where('sites.subscriber_id', Auth::guard('monitor')->user()->subscriber_id)->get();
        return view('monitor.add-shift', compact('timings', 'frequency', 'sites'));
    }

    public function save(Request $req)
    {
        // Start transaction
        DB::beginTransaction();
        try {
            // Insert data into the database
            $id = DB::table('shifts')->insertGetId([
                'name' => $req->input('name'),  // Assuming 'name' is passed in the request
                'default_start_time' => $req->input('start_time'),  // Assuming 'start_time' is passed in the request
                'default_end_time' => $req->input('end_time'),  // Assuming 'end_time' is passed in the request
                'status' => $req->input('status'),  // Assuming 'status' is passed in the request
                'site_id' => $req->input('site_id'),
                'days' => json_encode($req->days),
                // 'alert_frequency' => $req->input('alert_frequency'),
                'monitor_id' => Auth::guard('monitor')->user()->id,       
                'subscriber_id' => Auth::guard('monitor')->user()->subscriber_id,         
                'added_on' => now(),
                'updated_on' => now(),
            ]);

            // Commit the transaction
            DB::commit();

            // If insertion is successful and $id is returned
            if ($id) {
                $res = ['id' => $id, 'status' => 'success'];
                return response()->json($res, 200);  // Return a 200 OK with the response
            } else {
                // If insertion failed
                $res = ['id' => null, 'status' => 'error'];
                return response()->json($res, 500);  // Return a 500 Internal Server Error
            }
        } catch (\Exception $e) {
            // Rollback the transaction in case of an error
            DB::rollback();

            // Log the exception
            Log::error('Error saving shift: ' . $e->getMessage());

            // Return an error response
            $res = ['id' => null, 'status' => 'error', 'message' => 'Server error occurred: ' . $e];
            return response()->json($res, 500);  // Return a 500 Internal Server Error
        }
    }


    public function edit(Request $req, $id)
    {
        $shift = DB::table('shifts')->where('id', $id)->first();
        $isViewMode = 'n';

        if ($shift) {
            $timings = DB::table('timings')->get();
            $frequency = DB::table('check_in_frequency')->get();
            $sites = DB::table('sites')->get();
            return view('monitor.edit-shift', ['shift' => $shift, 'timings' => $timings, 'frequency' => $frequency, 'sites' => $sites, 'isViewMode' => $isViewMode]);
        } else
            return redirect(route('shifts'));
    }

    public function view(Request $req, $id)
    {
        $shift = DB::table('shifts')->where('id', $id)->first();
        $isViewMode = 'y';

        if ($shift) {
            $timings = DB::table('timings')->get();
            $frequency = DB::table('check_in_frequency')->get();
            $sites = DB::table('sites')->get();
            return view('monitor.edit-shift', ['shift' => $shift, 'timings' => $timings, 'frequency' => $frequency, 'sites' => $sites, 'isViewMode' => $isViewMode]);
        } else
            return redirect(route('shifts'));
    }

    public function update(Request $req)
    {
        // Start transaction
        DB::beginTransaction();

        try {
            $updated = DB::table('shifts')->where('id', $req->shift_id)
                ->update([
                    'name' => $req->input('name'),
                    'default_start_time' => $req->input('start_time'),
                    'default_end_time' => $req->input('end_time'),
                    'status' => $req->input('status'),
                    'days' => json_encode($req->days),
                    'site_id' => $req->input('site_id'),
                    // 'alert_frequency' => $req->input('alert_frequency'),
                    'monitor_id' => Auth::guard('monitor')->user()->id,
                    'updated_on' => now()
                ]);

            // Commit the transaction
            DB::commit();

            // If insertion is successful and $id is returned
            if ($updated) {
                $res = ['status' => 'success'];
                return response()->json($res, 200);  // Return a 200 OK with the response
            } else {
                // If insertion failed
                $res = ['status' => 'error'];
                return response()->json($res, 500);  // Return a 500 Internal Server Error
            }
        } catch (\Exception $e) {
            // Rollback the transaction in case of an error
            DB::rollback();

            // Log the exception
            Log::error('Error saving shift: ' . $e->getMessage());

            // Return an error response
            $res = ['status' => 'error', 'message' => 'Server error occurred: ' . $e];
            return response()->json($res, 500);  // Return a 500 Internal Server Error
        }
    }

    public function delete(Request $req)
    {

        DB::table('customers')->where('id', $req->id)->delete();
        $res = ['id' => $req->id, 'status' => 'success'];
        return json_encode($res);
    }
}
