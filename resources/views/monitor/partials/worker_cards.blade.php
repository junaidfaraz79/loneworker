@foreach($workers as $worker)
    @php
        // Safely fetch the latest attendance and check-in
        $latestAttendance = $worker->attendance->first() ?? null;
        $latestCheckin = $latestAttendance?->workerCheckIns->first() ?? null;
        $isAlertRequired = false; // To handle the alert for the grace period check

        // Calculate the remaining time for the check-in
        $isCheckinDue = false;
        $overdueTime = null;
        if ($latestCheckin?->scheduled_time) {
            $scheduledTime = \Carbon\Carbon::parse($latestCheckin->scheduled_time);
            $remainingSeconds = now()->diffInSeconds($scheduledTime, false); // false ensures negative values if overdue
            $gracePeriodEnd = \Carbon\Carbon::parse($latestCheckin->grace_period_end);

            // Check if overdue
            if ($remainingSeconds < 0) {
                $isCheckinDue = true;
                $overdueTime = now()->diffForHumans($scheduledTime, [
                    'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE,
                    'parts' => 2, // Show only 2 parts (e.g., "5 minutes 10 seconds")
                    'short' => false, // Use full words (e.g., "minutes" instead of "min")
                ]);
            }

            // Check for alert requirement based on grace period and status
            if (now()->greaterThan($gracePeriodEnd) && $latestCheckin->status === 'pending') {
                $isAlertRequired = true;
            }
        }
        // Fetch the latest alert for the worker
        $latestAlert = $worker->alerts->first() ?? null;
    @endphp

    <!--begin::Row-->
    <div class="row">
        <!--begin::Col-->
        <div class="col-xl-12 mb-5 mb-xl-10">
            <!--begin::Chart widget 4-->
            <div class="card overflow-hidden h-md-100">
                <!--begin::Header-->
                <div class="card-header align-items-center justify-content-between py-0 
                    {{ $latestAttendance?->status === 'active' ? ($isCheckinDue ? 'bg-danger' : 'bg-success') : '' }}">
                    <!--begin::Title-->
                    <h2 class="card-title align-items-start flex-column py-0">
                        {{ $worker->pin . ' - ' . $worker->worker_name }}
                    </h2>
                    <!--end::Title-->

                    <!--begin::Actions-->
                    <a target="_blank" href="{{ route('worker.view', ['parameter' => $worker->id]) }}">
                        <i class="fas fa-info-circle fs-1 text-black"></i>
                    </a>
                    <!--end::Actions-->
                </div>
                <!--end::Header-->

                <!--begin::Card body-->
                <div class="card-body d-flex justify-content-between flex-column pb-1 px-0">
                    <!--begin::Info-->
                    <div class="col-xl-8 px-3">
                        @if($latestAttendance && $latestAttendance->status === 'active')
                            <!--begin::Alert-->
                            <div class="alert {{ $isCheckinDue ? 'alert-danger' : 'alert-success' }} d-flex align-items-center">
                                <!--begin::Wrapper-->
                                <div class="d-flex flex-column">
                                    <!--begin::Content-->
                                    <span>
                                        @if($isCheckinDue)
                                            Check-in overdue by {{ $overdueTime }}
                                        @else
                                            Check in due in {{ $worker->check_in_frequency_time }} at
                                            @if($latestCheckin?->scheduled_time)
                                                {{ \Carbon\Carbon::parse($latestCheckin->scheduled_time)->format('d M Y g:i a') }}
                                            @else
                                                [Time not set]
                                            @endif
                                        @endif
                                    </span>
                                    <!--end::Content-->
                                </div>
                                <!--end::Wrapper-->
                            </div>
                            <!--end::Alert-->
                        @endif
                        <!-- If the alert condition is true, show an alert button -->
                        @if($isAlertRequired && $latestAlert)
                            <a class="btn btn-danger mb-2" style="width: 100%;" href="{{ route('worker.escalation', ['parameter' => $worker->id]) }}">
                                Alert!
                            </a>
                        @endif
                        <!--end::Actions-->
                        <!--begin::Worker Information-->
                        <div>
                            <table class="table table-bordered table-striped text-center">
                                <tbody>
                                    <tr>
                                        <td><strong>Phone: </strong>{{ $worker->phone_no ?? 'N/A' }}</td>
                                        <td><strong>Check In: </strong>{{ $worker->check_in_frequency_time ?? 'N/A' }}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Email: </strong>{{ $worker->email ?? 'N/A' }}</td>
                                        <td><strong>Man Down: </strong>Off</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Monitors: </strong></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <!--end::Worker Information-->
                    </div>
                    <!--end::Info-->
                </div>
                <!--end::Card body-->
            </div>
            <!--end::Chart widget 4-->
        </div>
        <!--end::Col-->
    </div>
    <!--end::Row-->
@endforeach