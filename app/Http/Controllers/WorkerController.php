<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class WorkerController extends Controller
{
    public function list()
    {
        $workers = DB::table('workers')->get();
        return view('workers', ['workers' => $workers]);
    }

    public function add()
    {
        $frequency = DB::table('check_in_frequency')->get();
        return view('add-worker', ['frequency' => $frequency]);
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
                'worker_status' => $req->worker_status
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

            DB::commit(); // Commit transaction

            $res = ['id' => $id, 'status' => 'success'];
            return json_encode($res);
        } catch (\Exception $e) {
            DB::rollback(); // Rollback transaction on error
            $res = ['id' => null, 'status' => 'error', 'message' => 'Failed to process the order: ' . $e->getMessage()];
            return json_encode($res);
            // return response()->json(['error' => 'Failed to process the order: ' . $e->getMessage()], 500);
        }

        // }

    }

    public function edit(Request $req, string $id)
    {
        $isViewMode = 'n';
        $worker = DB::table('workers')->where('id', '=', $id)->get();
        if (count($worker)) {
            $frequency = DB::table('check_in_frequency')->get();
            return view('edit-worker', ['worker' => $worker[0], 'frequency' => $frequency, 'isViewMode' => $isViewMode]);
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
                    'worker_status' => $req->worker_status
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
        $fileTypeImages = [
            'pdf' => 'assets/media/svg/files/pdf.svg',
            'doc' => 'assets/media/svg/files/doc.svg',
            'docx' => 'assets/media/svg/files/doc.svg',
        ];

        $isViewMode = 'y';

        // Fetching the worker details
        $worker = DB::table('workers')->where('id', $id)->first();
        if ($worker) {
            // Fetching check-in frequencies
            $frequency = DB::table('check_in_frequency')->get();

            // Joining worker_documents with workers to fetch all documents related to the worker
            $documents = DB::table('worker_documents')
                ->join('workers', 'worker_documents.worker_id', '=', 'workers.id')
                ->where('worker_documents.worker_id', $id)
                ->select('worker_documents.*')  // You can modify the select statement based on the columns you need
                ->get();

            return view('edit-worker', [
                'worker' => $worker,
                'frequency' => $frequency,
                'isViewMode' => $isViewMode,
                'documents' => $documents,  // Pass the documents to the view
                'fileTypeImages' => $fileTypeImages
            ]);
        } else {
            return redirect(route('workers'));
        }
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
        $validated = $request->validate([
            'pin' => 'required',
            'password' => 'required',
        ]);

        $worker = Worker::where('pin', $request->pin)->first();

        // if (! $worker || ! Hash::check($request->password, $worker->password)) {
        if (!$worker || $request->password !== $worker->password) {
            throw ValidationException::withMessages([
                'pin' => ['The provided credentials are incorrect.']
            ]);
        }

        return $worker->createToken($worker->id)->plainTextToken;
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
}
