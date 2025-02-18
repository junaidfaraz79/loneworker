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
            $scheduledTime = $carbonCheckInTime->addSeconds(120); // Add the frequency to the current time to get the scheduled time
            // $scheduledTime = $carbonCheckInTime ->addSeconds($frequency->value); // Add the frequency to the current time to get the scheduled time
            $gracePeriodEnd = $scheduledTime->copy()->addMinutes(15);

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

    public function historyByWorkerId(Request $request)
    {
        $user = Auth::user();

        // If the user is not authenticated, Laravel will automatically handle this
        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        // Directly use findOrFail to automatically return a 404 response if not found
        $worker = Worker::findOrFail($user->id);

        // Eager load checkIns relationship and use pagination
        $workerCheckIns = $worker->checkIns()->orderBy('created_at', 'desc')->paginate(10);

        // Transform the pagination result (no need to check, it will return empty if no records found)
        $data = $workerCheckIns->getCollection()->transform(function ($checkIn) {
            return [
                'date' => $checkIn->created_at->format('jS M Y'), // Day as 1st, 2nd, etc., Month as Jan, Feb, etc., Year as 2024
                'scheduled_time' => optional($checkIn->scheduled_time)->format('g:i:s A') ?? 'Not Scheduled', // Time in AM/PM format with seconds
                'actual_time' => optional($checkIn->actual_time)->format('g:i:s A') ?? 'Not Checked In', // Time in AM/PM format with seconds
                'grace_period_end' => optional($checkIn->grace_period_end)->format('g:i:s A') ?? 'No Grace Period', // Time in AM/PM format with seconds
                'location' => $checkIn->location ?? 'N/A',
                'status' => $checkIn->status ?? 'Unknown'
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ], 200);
    }
}
