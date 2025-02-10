@extends('monitor.layout.layout')

@section('content')    

    <div class="app-main flex-column flex-row-fluid" id="kt_app_main">
        <!--begin::Content wrapper-->
        <div class="d-flex flex-column flex-column-fluid">
            <!--begin::Toolbar-->
            <div id="kt_app_toolbar" class="app-toolbar pt-3 px-lg-3">
                <!--begin::Toolbar container-->
                <div id="kt_app_toolbar_container" class="app-container container-fluid d-flex flex-stack flex-wrap">
                    <!--begin::Toolbar wrapper-->
                    <div class="app-toolbar-wrapper d-flex flex-stack flex-wrap gap-4 w-100">
                        <!--begin::Page title-->
                        <div class="page-title d-flex align-items-center gap-1 me-3">
                            <!--begin::Title-->
                            <h1 class="page-heading d-flex flex-column justify-content-center text-gray-900 lh-1 fw-bolder fs-2x my-0 me-5">Shift Management</h1>
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
                                <li class="breadcrumb-item text-gray-700 fw-bold lh-1">Shift Management</li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item">
                                    <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                                </li>
                                <!--end::Item-->                                
                                <!--begin::Item-->
                                <li class="breadcrumb-item text-gray-700 fw-bold lh-1"><a href="/shifts">Shifts</a></li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item">
                                    <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                                </li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item text-gray-700">Add Shift</li>
                                <!--end::Item-->
                            </ul>
                            <!--end::Breadcrumb-->
                        </div>
                        <!--end::Page title-->
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
                    <form id="kt_ecommerce_add_shift_form" class="form d-flex flex-column flex-lg-row" data-kt-redirect="{{ route('shifts') }}" action="{{ route('shift.save') }}">
                        @csrf
                        <!--begin::Main column-->
                        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                            <!--begin::General options-->
                            <div class="card card-flush py-4">
                                <!--begin::Card header-->
                                <div class="card-header">
                                    <div class="card-title">
                                        <h2>Add Shift</h2>
                                    </div>
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="required form-label">Shift Name</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="name" class="form-control mb-2" placeholder="Shift name" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="required form-label">Start Time</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <select name="start_time" class="form-select mb-2" data-control="select2" data-placeholder="Select start time" id="start_time">
                                            <option></option>
                                            @foreach ($timings as $key => $timing)
                                                <option value="{{ $timing->time }}">{{ $timing->time }}</option>                                                
                                            @endforeach
                                        </select>
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="required form-label">End Time</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <select name="end_time" class="form-select mb-2" data-control="select2" data-placeholder="Select end time" id="end_time">
                                            <option></option>
                                            @foreach ($timings as $key => $timing)
                                                <option value="{{$timing->time}}">{{$timing->time}}</option>                                                
                                            @endforeach
                                        </select>
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label">Alert Frequency</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <select class="form-select mb-2" data-control="select2"
                                            data-hide-search="true" data-placeholder="Select an option"
                                            name="alert_frequency">
                                            <option>Select frequency</option>
                                            @foreach ($frequency as $key => $f)
                                                <option value="{{$f->value}}">{{$f->time}}</option>
                                            @endforeach

                                        </select>
                                        <!--end::Input-->
                                        <!--begin::Description-->
                                        <div class="text-muted fs-7">After how many minutes the worker will be sent alert.</div>
                                        <!--end::Description-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label">Site</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <select class="form-select mb-2" data-control="select2"
                                            data-hide-search="true" data-placeholder="Select an option"
                                            name="site_id">
                                            <option>Select site</option>
                                            @foreach ($sites as $key => $site)
                                                <option value="{{$site->id}}">{{$site->site_name}}</option>
                                            @endforeach

                                        </select>
                                        <!--end::Input-->
                                        <!--begin::Description-->
                                        <div class="text-muted fs-7">Set the site for this shift.</div>
                                        <!--end::Description-->
                                    </div>
                                    <!--end::Input group-->                                    
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="required form-label">Status</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <select name="status" class="form-select mb-2" data-control="select2" data-placeholder="Select status" id="status">
                                            <option></option>
                                            <option value="active">Active</option> 
                                            <option value="inactive">Inactive</option> 
                                        </select>
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <div class="d-flex justify-content-end">
                                        <!--begin::Button-->
                                        <a href="/shifts" id="kt_ecommerce_add_shift_cancel" class="btn btn-light me-5">Cancel</a>
                                        <!--end::Button-->
                                        <!--begin::Button-->
                                        <button type="submit" id="kt_ecommerce_add_shift_submit" class="btn btn-primary">
                                            <span class="indicator-label">Add Shift</span>
                                            <span class="indicator-progress">Please wait... 
                                            <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                                        </button>
                                        <!--end::Button-->
                                    </div>                                    
                                </div>
                                <!--end::Card header-->
                            </div>
                            <!--end::General options-->
                        </div>
                        <!--end::Main column-->
                    </form>
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

@push('scripts')
    <script src="/assets/js/custom/loneworker/save-shift.js"></script>
    {{-- <script src="/assets/js/widgets.bundle.js"></script>
    <script src="/assets/js/custom/widgets.js"></script>
    <script src="/assets/js/custom/apps/chat/chat.js"></script>
    <script src="/assets/js/custom/utilities/modals/upgrade-plan.js"></script>
    <script src="/assets/js/custom/utilities/modals/create-app.js"></script>
    <script src="/assets/js/custom/utilities/modals/users-search.js"></script> --}}

@endpush