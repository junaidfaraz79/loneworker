<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Monitor;
use App\Models\Worker;
use App\Models\WorkerCheckIns;
use App\Models\WorkerMonitor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class WorkerController extends Controller
{
    public function list()
    {
        $workers = Worker::where('subscriber_id', Auth::guard('monitor')->user()->subscriber_id)->get();
        return view('monitor.workers', ['workers' => $workers]);
    }

    public function workerEscalation(Request $req, string $workerId)
    {
        DB::beginTransaction();  // Begin DB transaction

        try {
            // Fetch the worker along with the latest attendance (by start_time) and related details
            $worker = Worker::with([
                'attendance' => function ($query) {
                    $query->orderBy('start_time', 'desc')->limit(1); // Fetch only the latest attendance
                },
                'monitors' // Eager load monitors (if any)
            ])
                ->leftJoin('check_in_frequency', 'workers.check_in_frequency', '=', 'check_in_frequency.id')
                ->where('workers.id', $workerId)
                ->select('workers.*', 'check_in_frequency.time as check_in_frequency_time')
                ->first();

            // If worker is null, throw an exception to be caught by the catch block
            if (!$worker) {
                throw new \Exception('Worker not found.');
            }

            // Access the latest attendance record
            $latestAttendance = $worker->attendance->first(); // We now directly access the first (and only) attendance record

            if ($latestAttendance) {
                // Load the workerCheckIns relation efficiently
                $latestAttendance->load(['workerCheckIns' => function ($query) {
                    $query->where('status', 'complete')->orderBy('scheduled_time', 'desc');
                }]);
            }

            // Fetch the worker's shift site details using a query builder
            $workerShiftSiteDetails = DB::table('worker_shift_site')
                ->join('sites', 'worker_shift_site.site_id', '=', 'sites.id')
                ->join('customers', 'customers.id', '=', 'sites.customer_id')
                ->join('shifts', 'worker_shift_site.shift_id', '=', 'shifts.id')
                ->where('worker_shift_site.id', $latestAttendance->worker_shift_site_id ?? null) // Using workerShiftSiteId directly
                ->select(
                    'sites.site_name',
                    'sites.site_address_1',
                    'sites.site_address_2',
                    'sites.country as site_country',
                    'sites.suburb_town_city',
                    'sites.postal_code',
                    'shifts.default_start_time',
                    'shifts.default_end_time',
                    'customers.customer_name',
                    'customers.role as customer_role',
                    'customers.email as customer_email',
                    'customers.phone_no as customer_phone_no'
                )
                ->first();

            // Prepare data for view
            $shiftStart = $latestAttendance->start_time ? Carbon::parse($latestAttendance->start_time)->format('F j, Y g:i A') : 'N/A'; // Use null coalescing to avoid optional()
            $lastCheckInCompleted = $latestAttendance->workerCheckIns->first() ? Carbon::parse($latestAttendance->workerCheckIns->first()->actual_time)->format('F j, Y g:i A') : 'N/A'; // Using direct access without optional()

            // Get the monitors, ensuring we handle empty or null monitor usernames
            $monitors = $worker->monitors->pluck('username')->filter()->implode(', ') ?? 'N/A';

            // Commit the transaction after all queries are successfully executed
            DB::commit();

            // Return the view with the required data
            return view('monitor.escalation-procedure', compact(
                'worker',
                'workerShiftSiteDetails',
                'shiftStart',
                'lastCheckInCompleted',
                'monitors'
            ));
        } catch (\Exception $e) {
            DB::rollBack();  // Rollback transaction in case of an error

            // Log the error for debugging
            Log::error('Worker escalation failed: ' . $e->getMessage(), ['worker_id' => $workerId]);

            dd('Worker escalation failed: ' . $e->getMessage());

            // Return error response
            return redirect()->back()->withErrors(['error' => 'An error occurred while processing the request. Please try again.']);
        }
    }


    public function add()
    {
        $monitor = Auth::guard('monitor')->user();

        $assignedMonitors = Monitor::where('id', $monitor->id)->get();
        $unassignedMonitors = Monitor::where('subscriber_id', $monitor->subscriber_id)
            ->whereNotIn('id', $assignedMonitors->pluck('id'))
            ->select('id', 'username')
            ->get();

        $shifts = DB::table('shifts')
        ->where('shifts.subscriber_id', $monitor->subscriber_id)
        ->where('status', 'active')->get();

        $frequency = DB::table('check_in_frequency')->get();

        $sites = DB::table('sites')
            ->join('customers', 'sites.customer_id', '=', 'customers.id')
            ->where('sites.subscriber_id', $monitor->subscriber_id)
            ->select('sites.*', 'customers.customer_name')
            ->get()
            ->groupBy('customer_id');

        $timings = DB::table('timings')->get();

        return view('monitor.add-worker', [
            'frequency' => $frequency,
            'shifts' => $shifts,
            'sites' => $sites,
            'timings' => $timings,
            'assignedMonitors' => $assignedMonitors,
            'unassignedMonitors' => $unassignedMonitors
        ]);
    }

    function generateUniquePin()
    {
        do {
            // Generate a random 6-digit number
            $pin = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);

            // Check if the PIN already exists in the database
            $exists = Worker::where('pin', $pin)->exists();
        } while ($exists); // Repeat until a unique PIN is found

        return $pin;
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

        if (Auth::guard('monitor')->user()->user_type === 'monitor' && Auth::guard('monitor')->check()) {

            $worker = Worker::where('email', $req->email)->first();

            if ($worker) {
                $res = ['id' => $worker->id, 'status' => 'duplicate'];
                return json_encode($res);
            }

            $assignedMonitors = json_decode($req->input('assignedMonitors'), true);

            // Handle shifts_site_repeater
            $items = $req->input('shifts_site_repeater', []);

            // Filter out empty items from shifts_site_repeater
            $items = array_filter($items, function ($item) {
                return !empty(array_filter($item)); // Remove items where all values are empty
            });

            if ($req->file('worker_image')) {
                if ($req->file('worker_image')->isValid())
                    $filename = time() . '_' . $req->file('worker_image')->getClientOriginalName();
                $worker_image = $req->file('worker_image')->storeAs('worker_images', $filename);
            } else {
                $worker_image = '';
            }
            try {
                // Start transaction
                DB::beginTransaction();

                // Generate a unique 6-digit PIN
                $pin = $this->generateUniquePin();

                $worker = Worker::create([
                    'worker_name' => $req->worker_name,
                    'phone_no' => $req->phone_no,
                    'email' => $req->email,
                    'pin' => $pin,
                    'password' => $req->email,
                    'phone_type' => $req->phone_type,
                    'role' => $req->role,
                    'department' => $req->department,
                    'check_in_frequency' => $req->check_in_frequency,
                    'worker_image' => $worker_image,
                    'worker_status' => $req->worker_status,
                    'sia_license_number' => $req->sia_license_number,
                    'sia_license_expiry_date' => $req->sia_license_expiry_date,
                    'emergency_contact_1' => $req->emergency_contact_1,
                    'emergency_contact_2' => $req->emergency_contact_2,
                    'nok_name' => $req->nok_name,
                    'nok_relation' => $req->nok_relation,
                    'nok_address' => $req->nok_address,
                    'nok_contact' => $req->nok_contact,
                    'subscriber_id' => Auth::guard('monitor')->user()->subscriber_id,
                    'monitor_id' => Auth::guard('monitor')->user()->id,
                    'check_in_visibility' => $req->check_in_visibility ?? '7days',
                ]);

                if (!empty($items)) {
                    foreach ($items as $item) {
                        $itemsToInsert[] = [
                            'worker_id' => $worker->id,
                            'shift_id' => $item['shift_id'],
                            'site_id' => $item['site_id'],
                            'custom_start_time' => $item['custom_start_time'],
                            'custom_end_time' => $item['custom_end_time'],
                            'start_date' => $item['start_date'],
                            'end_date' => $item['end_date'],
                        ];
                    }
                    DB::table('worker_shift_site')->insert($itemsToInsert);
                }

                if ($req->hasFile('worker_documents')) {
                    foreach ($req->file('worker_documents') as $file) {
                        $filename = time() . '_' . $file->getClientOriginalName();
                        $filePath = $file->storeAs('worker_documents', $filename); // Store file in public/worker_documents

                        $files[] = [
                            'worker_id' => $worker->id,
                            'file_path' => $filePath,
                            'file_name' => $filename,
                        ];
                    }
                    // dd($files);
                    DB::table('worker_documents')->insert($files);
                }

                if (!empty($assignedMonitors)) {
                    foreach ($assignedMonitors as $monitorId) {
                        WorkerMonitor::create([
                            'worker_id' => $worker->id,
                            'monitor_id' => $monitorId
                        ]);
                    }
                }

                DB::commit(); // Commit transaction

                // Send notification to worker for their new shift details
                $worker->sendPushNotification('Shift Details!', 'Your shift details have been updated. Click here to view.', ['screen' => 'Shift Details']);

                $res = ['id' => $worker->id, 'status' => 'success'];
                return json_encode($res);
            } catch (\Exception $e) {
                DB::rollback(); // Rollback transaction on error
                $res = ['id' => null, 'status' => 'error', 'message' => 'Failed to process the order: ' . $e->getMessage()];
                return json_encode($res);
                // return response()->json(['error' => 'Failed to process the order: ' . $e->getMessage()], 500);
            }
        }

        // }

    }

    public function edit(Request $req, string $id)
    {
        $worker = Worker::with(['monitors'])->find($id);

        if ($worker) {
            $frequency = DB::table('check_in_frequency')->get();

            // Use relationship loaded above
            $assignedMonitors = $worker->monitors()->select('id', 'username')->get();

            // Fetch unassigned monitors
            $unassignedMonitors = Monitor::where('subscriber_id', $worker->subscriber_id)
                ->whereNotIn('id', $assignedMonitors->pluck('id'))
                ->select('id', 'username')
                ->get();

            $shifts = DB::table('shifts')
            ->where('shifts.subscriber_id', Auth::guard('monitor')->user()->subscriber_id)
            ->where('status', 'active')->get();


            $sites = DB::table('sites')
                ->join('customers', 'sites.customer_id', '=', 'customers.id')
                ->where('sites.subscriber_id', $worker->subscriber_id)
                ->select('sites.*', 'customers.customer_name')
                ->get()
                ->groupBy('customer_id');

            $timings = DB::table('timings')->get();

            $documents = DB::table('worker_documents')
                ->join('workers', 'worker_documents.worker_id', '=', 'workers.id')
                ->where('worker_documents.worker_id', $id)
                ->select('worker_documents.*')  // You can modify the select statement based on the columns you need
                ->get();

            return view('monitor.edit-worker', [
                'worker' => $worker,
                'frequency' => $frequency,
                'shifts' => $shifts,
                'isViewMode' => 'n',
                'sites' => $sites,
                'timings' => $timings,
                'documents' => $documents,
                'assignedMonitors' => $assignedMonitors,
                'unassignedMonitors' => $unassignedMonitors
            ]);
        } else {
            return redirect(route('workers'));
        }
    }

    public function getWorkerShifts(Request $req, string $id)
    {
        try {
            $shifts = DB::table('worker_shift_site')
                ->select('shift_id', 'site_id', 'custom_start_time', 'custom_end_time', 'start_date', 'end_date')
                ->where('worker_id', $id)
                ->get();

            if ($shifts) {
                $res = ['shifts' => $shifts, 'status' => 'success'];
                return response()->json($res, 200);  // Return a 200 OK with the response
            } else {
                // If insertion failed
                $res = ['shifts' => null, 'status' => 'not found'];
                return response()->json($res, 404);  // Return a 500 Internal Server Error
            }
        } catch (\Exception $e) {
            // Log the exception
            Log::error('Error fetching shifts: ' . $e->getMessage());

            // Return an error response
            $res = ['shifts' => null, 'status' => 'error', 'message' => 'Server error occurred: ' . $e];
            return response()->json($res, 500);  // Return a 500 Internal Server Error
        }
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
        $workerId = $req->id;

        $assignedMonitors = json_decode($req->input('assignedMonitors'), true);

        // Fetch all current associations for this worker
        $currentAssociations = WorkerMonitor::where('worker_id', $workerId)->get();
        $currentMonitorIds = $currentAssociations->pluck('monitor_id')->all();

        // Determine the monitors to add and remove
        $monitorsToAdd = array_diff($assignedMonitors, $currentMonitorIds);
        $monitorsToRemove = array_diff($currentMonitorIds, $assignedMonitors);

        // Handle shifts_site_repeater
        $items = $req->input('shifts_site_repeater', []);

        // Filter out empty items from shifts_site_repeater
        $items = array_filter($items, function ($item) {
            return !empty(array_filter($item)); // Remove items where all values are empty
        });
        $shiftsUpdated = false; // Flag to track if any updates or inserts were made to worker shift site table

        try {
            DB::beginTransaction();

            // Add new monitors
            foreach ($monitorsToAdd as $monitorId) {
                WorkerMonitor::create([
                    'worker_id' => $workerId,
                    'monitor_id' => $monitorId
                ]);
            }

            // Remove unassigned monitors
            if (!empty($monitorsToRemove)) {
                WorkerMonitor::where('worker_id', $workerId)
                    ->whereIn('monitor_id', $monitorsToRemove)
                    ->delete();
            }

            $worker = Worker::findOrFail($req->id);

            $worker->update([
                'worker_name' => $req->worker_name,
                'phone_no' => $req->phone_no,
                'email' => $req->email,
                'phone_type' => $req->phone_type,
                'role' => $req->role,
                'department' => $req->department,
                'check_in_frequency' => $req->check_in_frequency,
                'worker_image' => $worker_image,
                'worker_status' => $req->worker_status,
                'sia_license_number' => $req->sia_license_number,
                'sia_license_expiry_date' => $req->sia_license_expiry_date,
                'emergency_contact_1' => $req->emergency_contact_1,
                'emergency_contact_2' => $req->emergency_contact_2,
                'nok_name' => $req->nok_name,
                'nok_relation' => $req->nok_relation,
                'nok_address' => $req->nok_address,
                // 'shift_id' => $req->shift_id,
                'nok_contact' => $req->nok_contact,
                'check_in_visibility' => $req->check_in_visibility
            ]);

            // Loop through new shift-site data to update existing records or insert new ones
            foreach ($items as $item) {
                $existingShiftSite = DB::table('worker_shift_site')
                    ->where('worker_id', $worker->id)
                    ->where('shift_id', $item['shift_id'])
                    ->where('site_id', $item['site_id'])
                    ->first();

                if ($existingShiftSite) {
                    $rowsUpdated = DB::table('worker_shift_site')
                        ->where('worker_id', $worker->id)
                        ->where('shift_id', $item['shift_id'])
                        ->where('site_id', $item['site_id'])
                        ->update([
                            'custom_start_time' => $item['custom_start_time'],
                            'custom_end_time' => $item['custom_end_time'],
                            'start_date' => $item['start_date'],
                            'end_date' => $item['end_date'],
                        ]);

                    if ($rowsUpdated > 0) {
                        $shiftsUpdated = true; // Mark as updated only if there's an actual change
                    }
                } else {
                    if (!empty($items)) {
                        // If the record does not exist, insert it
                        DB::table('worker_shift_site')->insert([
                            'worker_id' => $worker->id,
                            'shift_id' => $item['shift_id'],
                            'site_id' => $item['site_id'],
                            'custom_start_time' => $item['custom_start_time'],
                            'custom_end_time' => $item['custom_end_time'],
                            'start_date' => $item['start_date'],
                            'end_date' => $item['end_date'],
                        ]);

                        $shiftsUpdated = true; // Mark as updated for insertions
                    }
                }
            }

            if ($req->hasFile('worker_documents')) {
                foreach ($req->file('worker_documents') as $file) {
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $filePath = $file->storeAs('worker_documents', $filename); // Store file in public/worker_documents

                    $files[] = [
                        'worker_id' => $req->id,
                        'file_name' => $filename,
                        'file_path' => $filePath,
                    ];
                }
                DB::table('worker_documents')->insert($files);
            }

            DB::commit(); // Commit transaction

            // Send notification to worker for only if their shift details are changed
            if ($shiftsUpdated) {
                Log::info('sending shift update notif');
                $worker->sendPushNotification('Shift Details!', 'Your shift details have been updated. Click here to view.', ['screen' => 'Shift Details']);
            }

            $res = ['id' => $req->id, 'status' => 'success'];
            return json_encode($res);
        } catch (\Exception $e) {
            DB::rollback(); // Rollback transaction on error
            $res = ['id' => null, 'status' => 'error', 'message' => 'Failed to process the order: ' . $e->getMessage()];
            return json_encode($res);
            // return response()->json(['error' => 'Failed to process the order: ' . $e->getMessage()], 500);
        }
    }

    public function view(Request $req, $id)
    {
        // Fetching the worker details
        $worker = Worker::find($id);

        // Paginate worker check-ins
        if ($req->ajax()) {
            // Get pagination parameters from the request
            $start = $req->input('start');
            $length = $req->input('length');

            // Get date range parameters from the request (if provided)
            $startDate = $req->input('startDate');
            $endDate = $req->input('endDate');

            // Fetch paginated check-ins
            $query = $worker->checkIns()
                ->orderBy('created_at', 'desc');

            // Apply date range filtering if parameters are provided
            if ($startDate && $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }

            // Get the total number of records (for pagination) before pagination is applied
            $totalRecords = $query->count();

            $workerCheckIns = $query->skip($start)->take($length)->get();

            // Transform the data
            $data = $workerCheckIns->transform(function ($checkIn) {
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
                'draw' => intval($req->input('draw')),
                'recordsTotal' => $totalRecords,
                'recordsFiltered' => $totalRecords,
                'data' => $data,
            ]);
        }

        $fileTypeImages = [
            'pdf' => 'assets/media/svg/files/pdf.svg',
            'doc' => 'assets/media/svg/files/doc.svg',
            'docx' => 'assets/media/svg/files/doc.svg',
        ];

        $isViewMode = 'y';
        if (!$worker) {
            return redirect(route('workers'));
        }

        // Use relationship loaded above
        $assignedMonitors = $worker->monitors()->select('id', 'username')->get();

        // Fetch unassigned monitors
        $unassignedMonitors = Monitor::where('subscriber_id', $worker->subscriber_id)
            ->whereNotIn('id', $assignedMonitors->pluck('id'))
            ->select('id', 'username')
            ->get();

        // Fetching check-in frequencies
        $frequency = DB::table('check_in_frequency')->get();
        $shifts = DB::table('shifts')->where('status', 'active')->get();

        $sites = DB::table('sites')
            ->join('customers', 'sites.customer_id', '=', 'customers.id')
            ->where('sites.subscriber_id', $worker->subscriber_id)
            ->select('sites.*', 'customers.customer_name')
            ->get()
            ->groupBy('customer_id');

        $timings = DB::table('timings')->get();
        // Joining worker_documents with workers to fetch all documents related to the worker
        $documents = DB::table('worker_documents')
            ->join('workers', 'worker_documents.worker_id', '=', 'workers.id')
            ->where('worker_documents.worker_id', $id)
            ->select('worker_documents.*')  // You can modify the select statement based on the columns you need
            ->get();

        return view('monitor.edit-worker', [
            'worker' => $worker,
            'frequency' => $frequency,
            'shifts' => $shifts,
            'sites' => $sites,
            'timings' => $timings,
            'isViewMode' => $isViewMode,
            'documents' => $documents,  // Pass the documents to the view
            'fileTypeImages' => $fileTypeImages,
            'assignedMonitors' => $assignedMonitors,
            'unassignedMonitors' => $unassignedMonitors
        ]);
    }

    public function downloadDocument($id)
    {
        // Fetch the document details from the database
        $document = DB::table('worker_documents')->where('id', $id)->first();

        if (!$document) {
            return redirect()->back()->with('error', 'Document not found.');
        }

        $filePath = storage_path('app/public/' . $document->file_path);

        // Check if file exists in storage directory
        if (!file_exists($filePath)) {
            return redirect()->back()->with('error', 'File does not exist.');
        }

        // Download file
        return response()->download($filePath, $document->file_name, [
            'Content-Type' => $this->getContentType($filePath)
        ]);
    }

    private function getContentType($filePath)
    {
        // Use PHP's finfo_file function to determine the MIME type of the file
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filePath);
        finfo_close($finfo);

        return $mimeType;
    }
    
    public function delete(Request $req, $id)
    {
        $deleted = Worker::where('id', $id)->delete();

        if ($deleted) {
            return response()->json(['status' => 'success', 'message' => 'Worker deleted successfully']);
        } else {
            return response()->json(['status' => 'error', 'message' => 'Failed to delete worker']);
        }
    }


    // API FUNCTIONS
    public function authenticateWorker(Request $request)
    {
        $request->validate([
            'pin' => 'required',
            'password' => 'required',
            'push_token' => 'required',
        ]);

        // Start a transaction to ensure data integrity
        DB::beginTransaction();

        Log::info('pin: ' . $request->pin);
        Log::info('password: ' . $request->password);
        Log::info('push_token: ' . $request->push_token);

        try {
            $worker = Worker::where('pin', $request->pin)->first();

            // Check if worker exists and password is correct
            if (!$worker || $request->password !== $worker->password) {
                // if (!$worker || !Hash::check($request->password, $worker->password)) {
                // If authentication fails, we rollback any changes and return an error
                DB::rollback();
                return response()->json([
                    'success' => false,
                    'message' => 'The provided credentials are incorrect.'
                ], 422); // HTTP 422 Unprocessable Entity
            }

            $worker->update([
                'push_token' => $request->push_token
            ]);

            // If authentication is successful, commit the transaction
            DB::commit();

            // Generate a new token for the session
            $token = $worker->createToken('worker-access')->plainTextToken;

            // Return the token and success message
            return response()->json([
                'success' => true,
                'message' => 'Login successful!',
                'token' => $token
            ], 200);
        } catch (\Exception $e) {
            // If an exception occurs, rollback and return an error
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during the login process.',
                'error' => $e->getMessage()
            ], 500); // HTTP 500 Internal Server Error
        }
    }

    public function signoutWorker(Request $request)
    {
        try {
            // Retrieve the authenticated worker using the custom 'worker' guard
            $worker = Auth::guard('worker')->user();

            // Check if the worker was successfully retrieved
            if (!$worker) {
                return response()->json(['message' => 'Authentication failed. Worker not found.'], 401);
            }

            // Revoke the worker's current token
            if ($request->user()->currentAccessToken()) {
                $request->user()->currentAccessToken()->delete();
            } else {
                return response()->json(['message' => 'No active session found.'], 404);
            }

            // Successfully logged out
            return response()->json(['message' => 'You have been successfully logged out.'], 200);
        } catch (\Exception $e) {
            // Generic error handling if an exception is thrown during the logout process
            return response()->json([
                'message' => 'Failed to logout.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'old_password' => 'required', // ensure old password is provided
            'password' => 'required|string|min:8|confirmed', // ensure new password is confirmed and meets a minimum length
            'password_confirmation' => 'required' // ensure confirmation field is also provided
        ]);

        // Begin transaction
        DB::beginTransaction();

        try {
            // Retrieve the authenticated worker
            $worker = Auth::guard('worker')->user();

            // Check if the provided old password matches the current password
            if ($request->old_password !== $worker->password) {
                // if (!Hash::check($request->old_password, $worker->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Old password is incorrect.'
                ], 422); // Unprocessable Entity
            }

            // Check if the provided password matches the confirmation
            if ($request->password !== $request->password_confirmation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password confirmation does not match.'
                ], 422); // Unprocessable Entity
            }

            // Update the worker's password
            // $request->user()->password = Hash::make($request->password);
            $request->user()->password = $request->password;
            $request->user()->save();

            // Commit the transaction
            DB::commit();

            // Return a success response
            return response()->json([
                'success' => true,
                'message' => 'Password successfully changed.'
            ], 200);
        } catch (\Exception $e) {
            // Rollback the transaction in case of any error
            DB::rollback();

            // Return an error response
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while changing the password.',
                'error' => $e->getMessage()
            ], 500); // Internal Server Error
        }
    }

    public function getDetailedWorkerShifts(Request $req)
    {
        $worker = Auth::guard('worker')->user();

        try {
            $shiftDetails = DB::table('worker_shift_site')
                ->join('sites', 'worker_shift_site.site_id', '=', 'sites.id')
                ->join('shifts', 'worker_shift_site.shift_id', '=', 'shifts.id')
                ->join('customers', 'sites.customer_id', '=', 'customers.id')
                ->select(
                    DB::raw('COALESCE(worker_shift_site.custom_start_time, shifts.default_start_time) as start_time'),
                    DB::raw('COALESCE(worker_shift_site.custom_end_time, shifts.default_end_time) as end_time'),
                    'sites.site_name as site_name',
                    'customers.customer_name as customer_name',
                    'shifts.days as days'
                )
                ->where('worker_shift_site.worker_id', $worker->id)
                ->get();

            if ($shiftDetails->isNotEmpty()) {
                $res = ['details' => $shiftDetails, 'status' => 'success'];
                return response()->json($res, 200);  // Return a 200 OK with the response
            } else {
                // No data found
                $res = ['details' => null, 'status' => 'not found'];
                return response()->json($res, 404);  // Return a 404 Not Found
            }
        } catch (\Exception $e) {
            // Log the exception
            Log::error('Error fetching detailed shifts: ' . $e->getMessage());

            // Return an error response
            $res = ['details' => null, 'status' => 'error', 'message' => 'Server error occurred: ' . $e];
            return response()->json($res, 500);  // Return a 500 Internal Server Error
        }
    }
}
