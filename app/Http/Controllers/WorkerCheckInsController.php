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
        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        $worker = Worker::findOrFail($user->id);
        $visibility = $worker->check_in_visibility;

        $query = $worker->checkIns()->orderBy('created_at', 'desc');

        // Apply date filters based on visibility configured by the monitor
        switch ($visibility) {
            case 'today':
                $query->whereDate('created_at', now()->startOfDay());
                break;
            case '7days':
                $query->whereDate('created_at', '>=', now()->subDays(6)->startOfDay());
                break;
            case '30days':
                $query->whereDate('created_at', '>=', now()->subDays(29)->startOfDay());
                break;
            case 'this_month':
                $query->whereMonth('created_at', '=', now()->month)
                      ->whereYear('created_at', '=', now()->year);
                break;
            case 'last_month':
                $lastMonth = now()->subMonth();
                $query->whereMonth('created_at', '=', $lastMonth->month)
                      ->whereYear('created_at', '=', $lastMonth->year);
                break;
        }
        
        $perPage = 10;
        $page = $request->query('page', 1);

        $workerCheckIns = $query->paginate($perPage, ['*'], 'page', $page);

        $data = $workerCheckIns->getCollection()->transform(function ($checkIn) {
            return [
                'date' => $checkIn->created_at->format('d-M-y'),
                'scheduled_time' => optional($checkIn->scheduled_time)->format('g:i:s A') ?? 'N/A',
                'actual_time' => optional($checkIn->actual_time)->format('g:i:s A') ?? 'N/A',
                'grace_period_end' => optional($checkIn->grace_period_end)->format('g:i:s A') ?? 'N/A',
                'location' => $checkIn->location ?? 'N/A',
                'status' => $checkIn->status ?? 'N/A'
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'total' => $workerCheckIns->total(),
                'per_page' => $workerCheckIns->perPage(),
                'current_page' => $workerCheckIns->currentPage(),
                'last_page' => $workerCheckIns->lastPage(),
                'from' => $workerCheckIns->firstItem(),
                'to' => $workerCheckIns->lastItem()
            ]
        ], 200);
    }
}
