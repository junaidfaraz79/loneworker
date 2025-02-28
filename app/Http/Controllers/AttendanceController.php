<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Worker;
use App\Models\WorkerCheckIns;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    //
    public function attendance(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'checkin_time' => 'required',  // Ensure that the checkin_time is a valid date
        ]);

        DB::beginTransaction();

        try {
            $worker = Auth::user();
            $checkinTime = Carbon::parse($request->checkin_time);

            // Retrieve the check_in_frequency value by joining with the check_in_frequency table
            $frequency = Worker::where('workers.id', $worker->id)
                ->join('check_in_frequency', 'workers.check_in_frequency', '=', 'check_in_frequency.id')
                ->first(['check_in_frequency.value']);

            // Retrieve the worker's shifts
            $shifts = DB::table('worker_shift_site')
                ->join('shifts', 'worker_shift_site.shift_id', '=', 'shifts.id')
                ->where('worker_shift_site.worker_id', $worker->id)
                ->whereDate('worker_shift_site.start_date', '<=', $checkinTime)
                ->whereDate('worker_shift_site.end_date', '>=', $checkinTime)
                ->select('worker_shift_site.*', 'shifts.default_start_time', 'shifts.default_end_time')
                ->get();

            $matchedShift = null;

            foreach ($shifts as $shift) {
                // Use custom times if available, otherwise use default times
                $startTime = $shift->custom_start_time ? Carbon::createFromFormat('h:i A', $shift->custom_start_time) : Carbon::createFromFormat('h:i A', $shift->default_start_time);
                $endTime = $shift->custom_end_time ? Carbon::createFromFormat('h:i A', $shift->custom_end_time) : Carbon::createFromFormat('h:i A', $shift->default_end_time);

                // Compare checkin_time with the shift's start and end times
                if ($checkinTime->between($startTime, $endTime)) {
                    $matchedShift = $shift;
                    break;
                }
            }

            if (!$matchedShift) {
                throw new \Exception('No matching shift found for the check-in time.');
            }

            // Insert check-in time into attendance table
            $attendance = Attendance::create([
                'worker_id' => $worker->id,
                'start_time' => $request->checkin_time,
                'status' => 'active',
                'worker_shift_site_id' => $matchedShift->id,
            ]);

            // Assume $frequencyInSeconds holds the frequency in seconds retrieved from your frequency table.
            // $frequencyInSeconds = 300; // For example, 300 seconds for 5 minutes
            $scheduledTime = $checkinTime->copy()->addSeconds(120); // Add the frequency to the current time to get the scheduled time
            // $scheduledTime = $carbonCheckInTime ->addSeconds($frequency->value); // Add the frequency to the current time to get the scheduled time
            $gracePeriodEnd = $scheduledTime->copy()->addMinutes(15);

            $checkin = WorkerCheckIns::create([
                'attendance_id' => $attendance->id,
                'scheduled_time' => $scheduledTime,
                'grace_period_end' => $gracePeriodEnd,
                'status' => 'pending',
                'worker_id' => $worker->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Worker checked in successfully.',
                'check_in_frequency' => $frequency->value,
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

    public function checkout(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'end_time' => 'required',  // Ensure that the checkin_time is a valid date
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
                'actual_time' => $request->end_time,
                'status' => 'completed',
                'updated_at' => now()
            ]);

            $attendance = Attendance::find($workerCheckIn->attendance_id);

            if (!$attendance) {
                return response()->json(['message' => 'Attendance not found'], 404); // Or handle this case as needed
            }

            $attendance->update([
                'end_time' => $request->end_time,
                'status' => 'completed',
                'updated_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Worker checked out successfully.',
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
