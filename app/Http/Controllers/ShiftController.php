<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;


class ShiftController extends Controller
{
    public function list()
    {
        $shifts = DB::table('shifts')->get();
        return view('shifts', ['shifts' => $shifts]);
    }

    public function add()
    {
        // $plans = DB::table('plans')->get();
        $timings = DB::table('timings')->get();
        return view('add-shift', compact('timings'));
    }

    public function save(Request $req)
    {
        // Start transaction
        DB::beginTransaction();
        try {
            // Insert data into the database
            $id = DB::table('shifts')->insertGetId([
                'name' => $req->input('name'),  // Assuming 'name' is passed in the request
                'start_time' => $req->input('start_time'),  // Assuming 'start_time' is passed in the request
                'end_time' => $req->input('end_time'),  // Assuming 'end_time' is passed in the request
                'status' => $req->input('status'),  // Assuming 'status' is passed in the request
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
            return view('edit-shift', ['shift' => $shift, 'timings' => $timings, 'isViewMode' => $isViewMode]);
        } else
            return redirect(route('shifts'));
    }

    public function view(Request $req, $id)
    {
        $shift = DB::table('shifts')->where('id', $id)->first();
        $isViewMode = 'y';

        if ($shift) {
            $timings = DB::table('timings')->get();
            return view('edit-shift', ['shift' => $shift, 'timings' => $timings, 'isViewMode' => $isViewMode]);
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
                    'start_time' => $req->input('start_time'),
                    'end_time' => $req->input('end_time'),
                    'status' => $req->input('status'),
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
