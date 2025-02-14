@extends('monitor.layout.layout')

@section('content')
<style>
    .border-bottom-1px {
        border-bottom: 1px solid #000;
    }
</style>
<div class="app-main flex-column flex-row-fluid" id="kt_app_main">
    <!--begin::Content wrapper-->
    <div class="d-flex flex-column flex-column-fluid">
        <!--begin::Toolbar-->
        <div id="kt_app_toolbar" class="app-toolbar pt-3 px-lg-3">
            <!--begin::Toolbar container-->
            <div id="kt_app_toolbar_container" class="app-container container-fluid d-flex flex-stack flex-wrap">
                <!--begin::Toolbar wrapper-->
                <div class="app-toolbar-wrapper d-flex flex-stack flex-wrap gap-4 w-100 justify-content-between">
                    <!--begin::Page title-->
                    <div class="page-title d-flex align-items-center gap-1 me-3">
                        <!--begin::Title-->
                        <h1
                            class="page-heading d-flex flex-column justify-content-center text-gray-900 lh-1 fw-bolder fs-2x my-0 me-5">
                            Dashboard</h1>
                        <!--end::Title-->
                        <!--begin::Breadcrumb-->
                        <ul class="breadcrumb breadcrumb-separatorless fw-semibold">
                            <!--begin::Item-->
                            <li class="breadcrumb-item text-gray-700 fw-bold lh-1">
                                <a href="/dashboard" class="text-gray-500 text-hover-primary">
                                    <i class="ki-duotone ki-home fs-3 text-gray-500 mx-n1"></i>
                                </a>
                            </li>
                            <!--end::Item-->
                            <!--begin::Item-->
                            <li class="breadcrumb-item">
                                <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                            </li>
                            <!--end::Item-->
                            <!--begin::Item-->
                            <li class="breadcrumb-item text-gray-700">Default</li>
                            <!--end::Item-->
                        </ul>
                        <!--end::Breadcrumb-->
                    </div>
                    <!--end::Page title-->
                    <button type="button" class="btn btn-light">Refresh</button>
                </div>
                <!--end::Toolbar wrapper-->
            </div>
            <!--end::Toolbar container-->
        </div>
        <!--end::Toolbar-->
        <!--begin::Content-->
        <div id="kt_app_content" class="app-content px-lg-3">
            <!--begin::Content container-->
            <div id="kt_app_content_container" class="app-container container-fluid">
                @foreach($workers as $worker)
                @php
                // Safely fetch the latest attendance and check-in
                $latestAttendance = $worker->attendance->first() ?? null;
                $latestCheckin = $latestAttendance?->workerCheckIns->first() ?? null;

                // Calculate the remaining time for the check-in
                $isCheckinDue = false;
                if ($latestCheckin?->scheduled_time) {
                    $scheduledTime = \Carbon\Carbon::parse($latestCheckin->scheduled_time);
                    $remainingSeconds = now()->diffInSeconds($scheduledTime, false); // false ensures negative values if overdue
                    // dd($remainingSeconds);
                    $isCheckinDue = $remainingSeconds <= 60; // Check if due in 1 minute or less
                }
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
                                <div class="col-xl-8">
                                    @if($latestAttendance && $latestAttendance->status === 'active')
                                    <!--begin::Alert-->
                                    <div class="alert alert-success d-flex align-items-center ms-3">
                                        <!--begin::Wrapper-->
                                        <div class="d-flex flex-column">
                                            <!--begin::Content-->
                                            <span>
                                                Check in due in {{ $worker->check_in_frequency_time }} at
                                                @if($latestCheckin?->scheduled_time)
                                                {{ \Carbon\Carbon::parse($latestCheckin->scheduled_time)->format('d M Y
                                                g:i a') }}
                                                @else
                                                [Time not set]
                                                @endif
                                            </span>
                                            <!--end::Content-->
                                        </div>
                                        <!--end::Wrapper-->
                                    </div>
                                    <!--end::Alert-->
                                    @endif

                                    <!--begin::Worker Information-->
                                    <div class="ms-3">
                                        <table class="table table-bordered table-striped text-center">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Phone: </strong>{{ $worker->phone_no ?? 'N/A' }}</td>
                                                    <td><strong>Check In: </strong>{{ $worker->check_in_frequency_time
                                                        ?? 'N/A' }}</td>
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
            </div>
            <!--end::Content container-->
        </div>
        <!--end::Content-->
    </div>
    <!--end::Content wrapper-->
    <!--begin::Footer-->

    @include('footer')

    <!--end::Footer-->
</div>

@endsection