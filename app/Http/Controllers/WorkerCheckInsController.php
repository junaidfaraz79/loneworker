<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use App\Models\WorkerCheckIns;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WorkerCheckInsController extends Controller
{
    //
    public function checkin(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'checkin_time' => 'required',  // Ensure that the checkin_time is a valid date
            'worker_check_in_id' => 'required',  // Ensure that the checkin_time is a valid date
        ]);

        DB::beginTransaction();

        try {
            $worker = Auth::user();

            // Find the WorkerCheckIns record by ID and update it
            $workerCheckIn = WorkerCheckIns::find(intval($request->worker_check_in_id));
            
            if (!$workerCheckIn) {
                return response()->json(['message' => 'WorkerCheckIn not found'], 404); // Or handle this case as needed
            }

            $workerCheckIn->update([
                'actual_time' => $request->checkin_time,
                'status' => 'completed',
            ]);

            $carbonCheckInTime  = Carbon::parse($request->checkin_time); // Get the current time
            $scheduledTime = $carbonCheckInTime ->addSeconds(120); // Add the frequency to the current time to get the scheduled time
            // $scheduledTime = $carbonCheckInTime ->addSeconds($frequency->value); // Add the frequency to the current time to get the scheduled time
            $gracePeriodEnd = $scheduledTime->copy()->addMinutes(16);

            $checkin = WorkerCheckIns::create([
                'attendance_id' => $workerCheckIn->attendance_id,
                'scheduled_time' => $scheduledTime,
                'grace_period_end' => $gracePeriodEnd,
                'status' => 'pending',
                'worker_id' => $worker->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Worker checked in successfully.',
                'worker_check_in_id' => $checkin->id,
                'grace_period_end' => $gracePeriodEnd,
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
