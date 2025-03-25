<?php

namespace App\Http\Controllers;

use App\Mail\MonitorRegistrationMail;
use App\Models\Monitor;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class MonitorController extends Controller
{
    //
    public function list()
    {
        $monitors = DB::table('user')->where('subscriber_id', Auth::guard('subscriber')->user()->id)->get();
        return view('users', ['users' => $monitors]);
    }

    public function add()
    {
        return view('add-monitor');
    }

    function generateRandomPassword($length = 12)
    {
        // Define the characters that can be used in the password
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-_=+';

        // Ensure the password is sufficiently complex
        $password = Str::random(3) . // 3 random alphabets
            Str::upper(Str::random(3)) . // 3 uppercase alphabets
            rand(100, 999) . // 3 digits
            substr(str_shuffle($characters), 0, 3); // 3 special characters or mixed

        // Shuffle the password to mix the types
        return substr(str_shuffle($password), 0, $length);
    }

    public function save(Request $req)
    {

        $duplicate = DB::table('user')->where('email', '=', $req->email)->get();

        if (count($duplicate)) {
            $res = ['id' => '', 'status' => 'duplicate'];
        } else {
            $password = $this->generateRandomPassword();
            $monitor = Monitor::create([
                'username' => $req->username,
                'role' => 'monitor',
                'email' => $req->email,
                'password' => $password, // This will be hashed if you've set the mutator
                // 'password' => bcrypt($password), // This will be hashed if you've set the mutator
                'cell_no' => $req->cell_no,
                'phone_no' => $req->phone_no,
                'designation' => $req->designation,
                'home_address' => $req->home_address,
                'gender' => $req->gender,
                'emergency_contact_1' => $req->emergency_contact_1,
                'emergency_contact_2' => $req->emergency_contact_2,
                'user_type' => 'monitor',
                'subscriber_id' => Auth::guard('subscriber')->user()->id
            ]);

            $id = $monitor->id;

            // Send the email
            Mail::to($req->email)->send(new MonitorRegistrationMail($monitor, $password));

            $res = ['id' => $id, 'status' => 'success'];
        }

        return json_encode($res);
    }

    public function update(Request $req)
    {
        DB::beginTransaction(); // Start transaction

        try {
            // Check if the monitor exists
            $monitor = Monitor::findOrFail($req->id);

            // Update the monitor details
            $monitor->update([
                'username' => $req->username,
                'role' => 'monitor',
                'email' => $req->email,
                'password' => 'monitor', // This will be hashed if you've set the mutator
                'cell_no' => $req->cell_no,
                'phone_no' => $req->phone_no,
                'home_address' => $req->home_address,
                'gender' => $req->gender,
                'emergency_contact_1' => $req->emergency_contact_1,
                'emergency_contact_2' => $req->emergency_contact_2,
                'designation' => $req->designation,
            ]);

            DB::commit(); // Commit the transaction

            return json_encode(['id' => $monitor->id, 'status' => 'success']);
        } catch (\Exception $e) {
            DB::rollBack(); // Rollback the transaction on error
            // Log error or handle it as per your logging policy
            return json_encode(['error' => 'Server error']); // Internal Server Error
        }
    }

    public function edit(Request $req, string $id)
    {
        $monitor = Monitor::where('id', $id)->first();

        if ($monitor) {
            return view('edit-monitor', ['monitor' => $monitor]);
        } else
            return redirect(route('monitors'));
    }

    public function login()
    {
        return view('monitor.signin');  // Return the login view for admins
    }

    public function authenticateMonitor(Request $request)
    {
        $request->validate([
            'email' => 'email|required',
            'password' => 'required',
        ]);

        // Start a transaction to ensure data integrity
        DB::beginTransaction();

        try {
            $monitor = Monitor::where('email', $request->email)->first();

            // Check if monitor exists and password is correct
            if (!$monitor || $request->password !== $monitor->password) {
                // if (!$monitor || !Hash::check($request->password, $monitor->password)) {
                // If authentication fails, we rollback any changes and return an error
                DB::rollback();
                return response()->json([
                    'success' => false,
                    'message' => 'The provided credentials are incorrect.'
                ], 422); // HTTP 422 Unprocessable Entity
            }

            Auth::guard('monitor')->login($monitor);

            // dd('Monitor login attempt', ['user' => Auth::user()]);
            // If authentication is successful, commit the transaction
            DB::commit();

            // Return the token and success message
            return "success";
        } catch (\Exception $e) {
            // If an exception occurs, rollback and return an error
            DB::rollback();
            return "fail";
        }
    }

    public function logout(Request $request)
    {
        Log::info('Logging out user: ' . Auth::guard('monitor')->user()->email);

        // Using the 'monitor' guard to log out the user
        Auth::guard('monitor')->logout();

        // Optionally, you might want to invalidate the user's session completely.
        $request->session()->invalidate();

        // Regenerate the session ID to avoid session fixation attacks
        $request->session()->regenerateToken();

        // Redirect the user to the monitor's login page or the homepage
        return redirect()->route('monitor.login')->with('status', 'You have been successfully logged out.');
    }

    // public function dashboard()
    // {
    //     // dd('redirecting to dashboard');
    //     $total_monitors = DB::table('user')->where('user_type', 'monitor')->get()->count();
    //     $total_workers = DB::table('workers')->get()->count();
    //     $total_customers = DB::table('customers')->get()->count();
    //     $total_sites = DB::table('sites')->get()->count();

    //     return view('monitor.dashboard', ['total_monitors' => $total_monitors, 'total_workers' => $total_workers, 'total_customers' => $total_customers, 'total_sites' => $total_sites]);
    // }

    public function editPassword(Request $req)
    {
        return view('monitor.edit-password');
    }

    public function updatePassword(Request $req)
    {
        // Validate the input
        $req->validate([
            'password' => 'required|min:8|confirmed',
        ]);

        try {
            // Assuming email is stored in session and the user is authenticated
            // Type-hint the $monitor variable
            /** @var Monitor $monitor */
            $monitor = Auth::guard('monitor')->user(); // or use Auth::user()->email if using built-in Auth

            // Update the user's password
            $monitor->password = $req->password;
            $updated = $monitor->save();

            // Check if the update was successful
            if ($updated) {
                $res = ['status' => 'success'];
                return response()->json($res, 200);
            } else {
                // If no rows were updated, handle the case
                $res = ['status' => 'error'];
                return response()->json($res, 500);
            }
        } catch (\Exception $e) {
            // Log the error
            // \Log::error('Password update failed: ' . $e->getMessage());
            // Redirect back with error message
            $res = ['status' => 'error'];
            return response()->json($res, 500);
        }
    }

    public function profile()
    {
        $profile = DB::table('user')->where('email', Auth::guard('monitor')->user()->email)->get();
        return view('monitor.edit-profile', ['profile' => $profile[0]]);
    }

    public function profileUpdate(Request $req)
    {
        // Type-hint the $monitor variable
        /** @var Monitor $monitor */
        $monitor = Auth::guard('monitor')->user();

        if ($req->file('user_image')) {
            if ($req->file('user_image')->isValid())
                $user_image = $req->file('user_image')->store('public');

            if ($req->current_image)
                Storage::delete($req->current_image);
        } elseif ($req->current_image) {
            $user_image = $req->current_image;
        } else {
            $user_image = '';
        }

        $monitor->update([
            'username' => $req->username,
            'email' => $req->email,
            'cell_no' => $req->cell_no,
            'phone_no' => $req->phone_no,
            'designation' => $req->designation,
            'company_name' => $req->company_name,
            'official_address' => $req->official_address,
            'user_image' => $user_image
        ]);

        $res = ['id' => $req->id, 'status' => 'success'];

        return json_encode($res);
    }

    // Fetch all workers for the logged-in monitor without filtering by active attendance status
    public function dashboard(Request $req)
    {
        // Fetch all workers associated with the current monitor
        $monitorId = Auth::guard('monitor')->user()->id;

        $workers = Worker::with(['attendance' => function ($query) {
            $query->latest() // Fetch the latest attendance record, if any
                ->with(['workerCheckIns' => function ($query) {
                    $query->latest() // Fetch the latest WorkerCheckIns record, if any
                        ->with(['alerts' => function ($query) {
                            $query->latest(); // Fetch the latest WorkerCheckIns record, if any
                        }]);
                }]);
        }])
            ->join('worker_monitor', 'workers.id', '=', 'worker_monitor.worker_id') // Join with worker_monitor
            ->leftJoin('check_in_frequency', 'workers.check_in_frequency', '=', 'check_in_frequency.id') // Join with check_in_frequency
            ->where('worker_monitor.monitor_id', $monitorId) // Filter by monitor_id
            ->select('workers.*', 'check_in_frequency.time as check_in_frequency_time')
            ->get();

        return view('monitor.dashboard', ['workers' => $workers]);
    }
}
