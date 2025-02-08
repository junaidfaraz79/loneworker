<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    //
    public function checkin(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'checkin_time' => 'required',  // Ensure that the checkin_time is a valid date
        ]);

        DB::beginTransaction();

        try {
            $worker = Auth::user();

            // Retrieve the check_in_frequency value by joining with the check_in_frequency table
            $frequency = Worker::where('workers.id', $worker->id)
                ->join('check_in_frequency', 'workers.check_in_frequency', '=', 'check_in_frequency.id')
                ->first(['check_in_frequency.value']);

            // Insert check-in time into attendance table
            $attendance = new Attendance();
            $attendance->worker_id = $worker->id;
            $attendance->checkin = $request->checkin_time;
            $attendance->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Worker checked in successfully.',
                'check_in_frequency' => $frequency->value,
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while checking in.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
