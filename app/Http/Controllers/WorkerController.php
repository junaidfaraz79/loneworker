<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Worker;
use App\Models\WorkerCheckIns;
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
        $workers = DB::table('workers')->get();
        return view('monitor.workers', ['workers' => $workers]);
    }

    public function add()
    {
        $frequency = DB::table('check_in_frequency')->get();
        return view('monitor.add-worker', ['frequency' => $frequency]);
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
            try {
                // Start transaction
                DB::beginTransaction();

                if ($req->file('worker_image')) {
                    if ($req->file('worker_image')->isValid())
                        $filename = time() . '_' . $req->file('worker_image')->getClientOriginalName();
                    $worker_image = $req->file('worker_image')->storeAs('worker_images', $filename);
                } else
                    $worker_image = '';

                $id = DB::table('workers')->insertGetId([
                    'worker_name' => $req->worker_name,
                    'phone_no' => $req->phone_no,
                    'email' => $req->email,
                    'pin' => '',
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
                ]);

                if ($req->hasFile('worker_documents')) {
                    foreach ($req->file('worker_documents') as $file) {
                        $filename = time() . '_' . $file->getClientOriginalName();
                        $filePath = $file->storeAs('worker_documents', $filename); // Store file in public/worker_documents

                        $files[] = [
                            'worker_id' => $id,
                            'file_path' => $filePath,
                            'file_name' => $filename,
                        ];
                    }
                    // dd($files);
                    DB::table('worker_documents')->insert($files);
                }

                DB::table('worker_monitor')->insert([
                    'monitor_id' => Auth::guard('monitor')->user()->id,
                    'worker_id' => $id,
                ]);

                DB::commit(); // Commit transaction

                $res = ['id' => $id, 'status' => 'success'];
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
        $isViewMode = 'n';
        $worker = DB::table('workers')->where('id', '=', $id)->get();
        if (count($worker)) {
            $frequency = DB::table('check_in_frequency')->get();
            return view('monitor.edit-worker', ['worker' => $worker[0], 'frequency' => $frequency, 'isViewMode' => $isViewMode]);
        } else
            return redirect(route('workers'));
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

        try {
            DB::beginTransaction();

            DB::table('workers')->where('id', $req->id)
                ->update([
                    'worker_name' => $req->worker_name,
                    'phone_no' => $req->phone_no,
                    'email' => $req->email,
                    'pin' => '',
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
                ]);

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

            $res = ['id' => $req->id, 'status' => 'success'];
            return json_encode($res);
        } catch (\Exception $e) {
            DB::rollback(); // Rollback transaction on error
            $res = ['id' => null, 'status' => 'error', 'message' => 'Failed to process the order: ' . $e->getMessage()];
            return json_encode($res);
            // return response()->json(['error' => 'Failed to process the order: ' . $e->getMessage()], 500);
        }


        // }

    }

    // public function view(Request $req, $id)
    // {
    //     $fileTypeImages = [
    //         'pdf' => 'assets/media/svg/files/pdf.svg',
    //         'doc' => 'assets/media/svg/files/doc.svg',
    //         'docx' => 'assets/media/svg/files/doc.svg',
    //     ];

    //     $isViewMode = 'y';
    //     $worker = DB::table('workers')->where('id', $id)->get();
    //     if (count($worker)) {
    //         $frequency = DB::table('check_in_frequency')->get();
    //         return view('edit-worker', ['worker' => $worker[0], 'frequency' => $frequency, 'isViewMode' => $isViewMode]);
    //     } else
    //         return redirect(route('workers'));
    // }
    public function view(Request $req, $id)
    {
        // Fetching the worker details
        $worker = Worker::find($id);

        // Paginate worker check-ins
        if ($req->ajax()) {
            $workerCheckIns = $worker->checkIns()->orderBy('created_at', 'desc')->paginate(10);

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
                'draw' => intval($req->input('draw')), // This value must come from the client side
                'recordsTotal' => $workerCheckIns->total(),
                'recordsFiltered' => $workerCheckIns->total(), // Adjust if you apply further filtering
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

        // Fetching check-in frequencies
        $frequency = DB::table('check_in_frequency')->get();

        // Joining worker_documents with workers to fetch all documents related to the worker
        $documents = DB::table('worker_documents')
            ->join('workers', 'worker_documents.worker_id', '=', 'workers.id')
            ->where('worker_documents.worker_id', $id)
            ->select('worker_documents.*')  // You can modify the select statement based on the columns you need
            ->get();

        return view('monitor.edit-worker', [
            'worker' => $worker,
            'frequency' => $frequency,
            'isViewMode' => $isViewMode,
            'documents' => $documents,  // Pass the documents to the view
            'fileTypeImages' => $fileTypeImages
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
    public function delete(Request $req)
    {

        DB::table('workers')->where('id', $req->id)->delete();
        $res = ['id' => $req->id, 'status' => 'success'];
        return json_encode($res);
    }

    public function authenticateWorker(Request $request)
    {
        $request->validate([
            'pin' => 'required',
            'password' => 'required',
        ]);

        // Start a transaction to ensure data integrity
        DB::beginTransaction();

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
}
