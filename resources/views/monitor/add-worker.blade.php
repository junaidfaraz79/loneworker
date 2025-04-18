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
                        <h1
                            class="page-heading d-flex flex-column justify-content-center text-gray-900 lh-1 fw-bolder fs-2x my-0 me-5">
                            Add Worker</h1>
                        <!--end::Title-->
                        <!--begin::Breadcrumb-->
                        <ul class="breadcrumb breadcrumb-separatorless fw-semibold">
                            <!--begin::Item-->
                            <li class="breadcrumb-item text-gray-700 fw-bold lh-1">
                                <a href="{{ route('monitor.dashboard') }}" class="text-gray-500 text-hover-primary">
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
                            <li class="breadcrumb-item text-gray-700 fw-bold lh-1">Worker Management</li>
                            <!--end::Item-->
                            <!--begin::Item-->
                            <li class="breadcrumb-item">
                                <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                            </li>
                            <!--end::Item-->
                            <!--begin::Item-->
                            <li class="breadcrumb-item text-gray-700 fw-bold lh-1"><a
                                    href="{{ route('workers') }}">Workers</a></li>
                            <!--end::Item-->
                            <!--begin::Item-->
                            <li class="breadcrumb-item">
                                <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                            </li>
                            <!--end::Item-->
                            <!--begin::Item-->
                            <li class="breadcrumb-item text-gray-700">Add Worker</li>
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
                <form id="kt_ecommerce_add_form" class="form d-flex flex-column flex-lg-row"
                    data-kt-redirect="{{ route('workers') }}">
                    @csrf
                    <!--begin::Main column-->
                    <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                        <!--begin:::Tabs-->
                        <ul
                            class="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-semibold mb-n2">
                            <!--begin:::Tab item-->
                            <li class="nav-item">
                                <a class="nav-link text-active-primary pb-4 active" data-bs-toggle="tab"
                                    href="#worker_details_tab">Details</a>
                            </li>
                            <!--end:::Tab item-->
                            <!--begin:::Tab item-->
                            <li class="nav-item">
                                <a class="nav-link text-active-primary pb-4" data-bs-toggle="tab"
                                    href="#worker_documents_tab">Documents</a>
                            </li>
                            <!--end:::Tab item-->
                            <!--begin:::Tab item-->
                            <li class="nav-item">
                                <a class="nav-link text-active-primary pb-4" data-bs-toggle="tab"
                                    href="#monitors_tab">Monitors</a>
                            </li>
                            <!--end:::Tab item-->
                            <!--begin:::Tab item-->
                            <li class="nav-item">
                                <a class="nav-link text-active-primary pb-4" data-bs-toggle="tab"
                                    href="#sites_shifts_tab">Sites and Shifts</a>
                            </li>
                            <!--end:::Tab item-->
                        </ul>
                        <!--end:::Tabs-->
                        <!--begin::Tab content-->
                        <div class="tab-content">
                            <!--begin::Tab pane-->
                            <div class="tab-pane fade show active" id="worker_details_tab" role="tabpanel">
                                <div class="d-flex flex-column gap-7 gap-lg-10">
                                    <!--begin::General options-->
                                    <div class="card card-flush py-4">
                                        <!--begin::Card header-->
                                        <div class="card-header">
                                            <div class="card-title">
                                                <h2>Worker Detail</h2>
                                            </div>
                                        </div>
                                        <!--end::Card header-->
                                        <!--begin::Card body-->
                                        <div class="card-body pt-0">
                                            <!--begin::Image input-->
                                            <!--begin::Input group-->
                                            <div class="mb-10">
                                                <!--begin::Image input placeholder-->
                                                <style>
                                                    .image-input-placeholder {
                                                        background-image: url('assets/media/svg/files/blank-image.svg');
                                                    }

                                                    [data-bs-theme="dark"] .image-input-placeholder {
                                                        background-image: url('assets/media/svg/files/blank-image-dark.svg');
                                                    }
                                                </style>
                                                <!--end::Image input placeholder-->
                                                <!--begin::Image input-->
                                                <div class="image-input image-input-empty image-input-outline image-input-placeholder mb-3"
                                                    data-kt-image-input="true">
                                                    <!--begin::Preview existing avatar-->
                                                    <div class="image-input-wrapper w-150px h-150px"></div>
                                                    <!--end::Preview existing avatar-->
                                                    <!--begin::Label-->
                                                    <label
                                                        class="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
                                                        data-kt-image-input-action="change" data-bs-toggle="tooltip"
                                                        title="Change avatar">
                                                        <!--begin::Icon-->
                                                        <i class="ki-duotone ki-pencil fs-7">
                                                            <span class="path1"></span>
                                                            <span class="path2"></span>
                                                        </i>
                                                        <!--end::Icon-->
                                                        <!--begin::Inputs-->
                                                        <input type="file" name="worker_image"
                                                            accept=".png, .jpg, .jpeg" />
                                                        <input type="hidden" name="current_image" />
                                                        <!--end::Inputs-->
                                                    </label>
                                                    <!--end::Label-->
                                                    <!--begin::Cancel-->
                                                    <span
                                                        class="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
                                                        data-kt-image-input-action="cancel" data-bs-toggle="tooltip"
                                                        title="Cancel avatar">
                                                        <i class="ki-duotone ki-cross fs-2">
                                                            <span class="path1"></span>
                                                            <span class="path2"></span>
                                                        </i>
                                                    </span>
                                                    <!--end::Cancel-->
                                                    <!--begin::Remove-->
                                                    <span
                                                        class="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
                                                        data-kt-image-input-action="remove" data-bs-toggle="tooltip"
                                                        title="Remove avatar">
                                                        <i class="ki-duotone ki-cross fs-2">
                                                            <span class="path1"></span>
                                                            <span class="path2"></span>
                                                        </i>
                                                    </span>
                                                    <!--end::Remove-->
                                                </div>
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set the thumbnail image. Only *.png, *.jpg
                                                    and
                                                    *.jpeg image
                                                    files are accepted</div>
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Image input-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 fv-row">
                                                <div class="d-flex">
                                                    <div class="rounded-circle bg-success w-15px h-15px"
                                                        id="kt_ecommerce_add_category_status"></div>
                                                    <!--begin::Label-->
                                                    {{-- <div style="width:100%"><label class="form-label">Status</label></div> --}}
                                                    <label class="form-label ms-2">Status</label>
                                                    <!--end::Label-->
                                                </div>
                                                <!--begin::Select2-->
                                                <select name="worker_status" class="form-select mb-2"
                                                    data-control="select2" data-hide-search="true"
                                                    data-placeholder="Select an option"
                                                    id="kt_ecommerce_add_category_status_select">
                                                    <option></option>
                                                    <option value="active" selected="selected">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                                <!--end::Select2-->
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set worker status.</div>
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 fv-row">
                                                <!--begin::Label-->
                                                <label class="required form-label">Worker Name</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="worker_name" class="form-control mb-2"
                                                    placeholder="Worker name" value="" />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">A worker name is required.</div>
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 fv-row">
                                                <!--begin::Label-->
                                                <label class="form-label">Phone Number</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="tel" id="phone_no" name="phone_no" class="form-control mb-2"/>
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set phone number.</div>
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 fv-row">
                                                <!--begin::Label-->
                                                <label class="form-label">Email address</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="email" name="email" class="form-control mb-2"
                                                    placeholder="Email address" value="" />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set email address.</div>
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 fv-row">
                                                <!--begin::Label-->
                                                <label class="form-label">Department</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="department" class="form-control mb-2"
                                                    placeholder="Department" value="" />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set department.</div>
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 fv-row">
                                                <!--begin::Label-->
                                                <label class="form-label">Role</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="role" class="form-control mb-2"
                                                    placeholder="Role" value="" />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set role.</div>
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="row mb-10">
                                                <div class="col-lg-6 fv-row">
                                                    <!--begin::Label-->
                                                    <label class="form-label">Check In Frequency</label>
                                                    <!--end::Label-->
                                                    <!--begin::Input-->
                                                    <select class="form-select mb-2" data-control="select2"
                                                        data-placeholder="Select an option" name="check_in_frequency">
                                                        <option value="">Select frequency</option>
                                                        @foreach ($frequency as $key => $f)
                                                        <option value="{{$f->id}}">{{$f->time}}</option>
                                                        @endforeach

                                                    </select>
                                                    <!--end::Input-->
                                                    <!--begin::Description-->
                                                    <div class="text-muted fs-7">Set Check In Frequency.</div>
                                                    <!--end::Description-->
                                                </div>
                                                <div class="col-lg-6 fv-row">
                                                    <!--begin::Label-->
                                                    <label class="form-label">Check In History Visibility</label>
                                                    <!--end::Label-->
                                                    <!--begin::Input-->
                                                    <select class="form-select mb-2" data-control="select2"
                                                        data-placeholder="Select an option" name="check_in_visibility">
                                                        <option value="">Select visibility</option>
                                                        <option value="today">Today</option>
                                                        <option value="7days">Last 7 Days</option>
                                                        <option value="30days">Last 30 Days</option>
                                                        <option value="this_month">This Month</option>
                                                        <option value="last_month">Last Month</option>
                                                    </select>
                                                    <!--end::Input-->
                                                    <!--begin::Description-->
                                                    <div class="text-muted fs-7">Set Check In History Visibility.</div>
                                                    <!--end::Description-->
                                                </div>
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 fv-row">
                                                <!--begin::Label-->
                                                <label class="form-label">Phone Type</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <select class="form-select mb-2" data-control="select2"
                                                    data-hide-search="true" data-placeholder="Select an option"
                                                    name="phone_type">
                                                    <option value="">Select type</option>
                                                    <option value="old">Old Phone</option>
                                                    <option value="smart">Smart Phone</option>
                                                </select>
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set phone type.</div>
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="row mb-10">
                                                <div class="col-lg-6 fv-row">
                                                    <!--begin::Label-->
                                                    <label class="form-label">SIA Licence Number</label>
                                                    <!--end::Label-->
                                                    <!--begin::Input-->
                                                    <input type="text" name="sia_license_number"
                                                        class="form-control mb-2" placeholder="SIA Licence Number"
                                                        value="" />
                                                    <!--end::Input-->
                                                    <!--begin::Description-->
                                                    <div class="text-muted fs-7">16 digit SIA Licence Number.</div>
                                                    <!--end::Description-->
                                                </div>
                                                <div class="col-lg-6 fv-row">
                                                    <!--begin::Label-->
                                                    <label class="form-label">SIA Licence Expiry Date</label>
                                                    <!--end::Label-->
                                                    <!--begin::Input-->
                                                    <input class="form-control mb-2" name="sia_license_expiry_date"
                                                        placeholder="Pick expiry date"
                                                        id="kt_calendar_datepicker_start_date" />
                                                    <!--end::Input-->
                                                    <!--begin::Description-->
                                                    <div class="text-muted fs-7">Set SIA licence expiry date.</div>
                                                    <!--end::Description-->
                                                </div>
                                            </div>
                                            <!--end::Input group-->

                                            <!--begin::Input group-->
                                            <div class="row">
                                                <div class="col-lg-6 fv-row">
                                                    <!--begin::Label-->
                                                    <label class="required form-label">Primary Emergency Contact</label>
                                                    <!--end::Label-->
                                                    <!--begin::Input-->
                                                    <input type="tel" name="emergency_contact_1" id="emergency_contact_1"
                                                        class="form-control mb-2"/>
                                                    <!--end::Input-->
                                                    <!--begin::Description-->
                                                    <div class="text-muted fs-7">Set primary emergency phone number.
                                                    </div>
                                                    <!--end::Description-->
                                                </div>
                                                <div class="col-lg-6 fv-row">
                                                    <!--begin::Label-->
                                                    <label class="required form-label">Secondary Emergency
                                                        Contact</label>
                                                    <!--end::Label-->
                                                    <!--begin::Input-->
                                                    <input type="tel" name="emergency_contact_2" id="emergency_contact_2"
                                                        class="form-control mb-2"/>
                                                    <!--end::Input-->
                                                    <!--begin::Description-->
                                                    <div class="text-muted fs-7">Set secondary emergency phone number.
                                                    </div>
                                                    <!--end::Description-->
                                                </div>
                                            </div>
                                            <!--end::Input group-->
                                        </div>
                                        <!--end::Card header-->
                                    </div>
                                    <div class="card card-flush py-4">
                                        <!--begin::Card header-->
                                        <div class="card-header">
                                            <div class="card-title">
                                                <h2>Next of Kin Detail</h2>
                                            </div>
                                        </div>
                                        <!--end::Card header-->
                                        <!--begin::Card body-->
                                        <div class="card-body pt-0">
                                            <!--begin::Input group-->
                                            <div class="mb-10 fv-row">
                                                <!--begin::Label-->
                                                <label class="form-label">Name</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="nok_name" class="form-control mb-2"
                                                    placeholder="Name" value="" />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set Name.</div>
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 fv-row">
                                                <!--begin::Label-->
                                                <label class="form-label">Relation</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="nok_relation" class="form-control mb-2"
                                                    placeholder="Relation" value="" />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set Relation.</div>
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 fv-row">
                                                <!--begin::Label-->
                                                <label class="form-label">Address</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="nok_address" class="form-control mb-2"
                                                    placeholder="Address" value="" />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set Address.</div>
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 fv-row">
                                                <!--begin::Label-->
                                                <label class="form-label">Contact</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="tel" name="nok_contact" class="form-control mb-2" id="nok_contact" />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set Contact.</div>
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                        </div>
                                        <!--end::Card header-->
                                    </div>
                                    <!--end::General options-->
                                </div>
                            </div>
                            <!--end::Tab pane-->
                            <!--begin::Tab pane-->
                            <div class="tab-pane fade" id="worker_documents_tab" role="tabpanel">
                                <div class="d-flex flex-column gap-7 gap-lg-10">
                                    <!--begin::General options-->
                                    <div class="card card-flush py-4">
                                        <!--begin::Card header-->
                                        <div class="card-header">
                                            <div class="card-title">
                                                <h2>Worker Documents</h2>
                                            </div>
                                        </div>
                                        <!--end::Card header-->
                                        <!--begin::Card body-->
                                        <div class="card-body pt-0">
                                            <!--begin::Input group-->
                                            <div class="fv-row mb-2">
                                                <!--begin::Dropzone-->
                                                <div class="dropzone" id="add_worker_documents">
                                                    <!--begin::Message-->
                                                    <div class="dz-message needsclick">
                                                        <!--begin::Icon-->
                                                        <i class="ki-duotone ki-file-up text-primary fs-3x">
                                                            <span class="path1"></span>
                                                            <span class="path2"></span>
                                                        </i>
                                                        <!--end::Icon-->
                                                        <!--begin::Info-->
                                                        <div class="ms-4">
                                                            <h3 class="fs-5 fw-bold text-gray-900 mb-1">Drop files here
                                                                or click to upload.</h3>
                                                            <span class="fs-7 fw-semibold text-gray-500">Upload up to 10
                                                                files</span>
                                                        </div>
                                                        <!--end::Info-->
                                                    </div>
                                                </div>
                                                <!--end::Dropzone-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Description-->
                                            <div class="text-muted fs-7">Set the worker documents (License, ID Card,
                                                Training Certificates).</div>
                                            <!--end::Description-->
                                        </div>
                                        <!--end::Card header-->
                                    </div>
                                    <!--end::General options-->
                                </div>
                            </div>
                            <!--end::Tab pane-->
                            <!--begin::Tab pane (Worker Monitors)-->
                            <div class="tab-pane fade" id="monitors_tab" role="tabpanel">
                                <div class="d-flex flex-column gap-7 gap-lg-10">
                                    <!--begin::General options-->
                                    <!--begin::Worker details-->
                                    <div class="card card-flush py-4">
                                        <!--begin::Card header-->
                                        <div class="card-header">
                                            <div class="card-title col-lg-4">
                                                <h2>Worker Monitors</h2>
                                            </div>
                                        </div>
                                        <!--end::Card header-->
                                        <!--begin::Card body-->
                                        <div class="card-body pt-0">
                                            <div id="kt_docs_jkanban_restricted"></div>
                                        </div>
                                        <!--end::Card header-->
                                    </div>
                                </div>
                            </div>
                            <!--end::Tab pane-->
                            <!--begin::Tab pane (Worker Sites and Shifts)-->
                            <div class="tab-pane fade" id="sites_shifts_tab" role="tabpanel">
                                <div class="d-flex flex-column gap-7 gap-lg-10">
                                    <!--begin::General options-->
                                    <!--begin::Worker details-->
                                    <div class="card card-flush py-4">
                                        <!--begin::Card header-->
                                        <div class="card-header">
                                            <div class="card-title col-lg-4">
                                                <h2>Worker Monitors</h2>
                                            </div>
                                        </div>
                                        <!--end::Card header-->
                                        <!--begin::Card body-->
                                        <div class="card-body pt-0">
                                            <div class="form-group row">
                                                <div class="col-md-2">
                                                    <label class="form-label">Site</label>
                                                </div>
                                                <div class="col-md-3">
                                                    <label class="form-label">Shift</label>
                                                </div>
                                                <div class="col-md-2">
                                                    <label class="form-label">Custom Start Time</label>
                                                </div>
                                                <div class="col-md-2">
                                                    <label class="form-label">Custom End Time</label>
                                                </div>
                                                <div class="col-md-1">
                                                    <label class="form-label">Start Date</label>
                                                </div>
                                                <div class="col-md-1">
                                                    <label class="form-label">End Date</label>
                                                </div>
                                                <div class="col-md-1">
                                                </div>
                                            </div>
                                            <!--begin::Repeater-->
                                            <div id="shifts_site_repeater">
                                                <!--begin::Form group-->
                                                <div class="form-group">
                                                    <div data-repeater-list="shifts_site_repeater">
                                                        <div data-repeater-item>
                                                            <div class="form-group row">
                                                                <div class="col-md-2 fv-row">
                                                                    <select class="form-select mb-2 site-select"
                                                                        data-placeholder="Select an option"
                                                                        name="site_id" id="site_id">
                                                                        <option value="">Select Site..</option>
                                                                        @foreach ($sites as $customerId =>
                                                                        $customerSites)
                                                                        <optgroup
                                                                            label="{{ $customerSites->first()->customer_name }}">
                                                                            @foreach ($customerSites as $site)
                                                                            <option value="{{ $site->id }}">{{
                                                                                $site->site_name }}</option>
                                                                            @endforeach
                                                                        </optgroup>
                                                                        @endforeach
                                                                    </select>
                                                                </div>
                                                                <div class="col-md-3 fv-row">
                                                                    <select class="form-select mb-2 shift-select"
                                                                        data-placeholder="Select an option"
                                                                        name="shift_id" id="shift_id"></select>
                                                                </div>
                                                                <div class="col-md-2">
                                                                    <!--begin::Input-->
                                                                    <select name="custom_start_time" class="form-select mb-2 custom-start-time" data-placeholder="Select start time"
                                                                        id="custom_start_time">
                                                                        <option></option>
                                                                        @foreach ($timings as $key => $timing)
                                                                        <option value="{{$timing->time}}">
                                                                            {{$timing->time}}</option>
                                                                        @endforeach
                                                                    </select>
                                                                    <!--end::Input-->
                                                                </div>
                                                                <div class="col-md-2">
                                                                    <!--begin::Input-->
                                                                    <select name="custom_end_time" class="form-select mb-2 custom-end-time" 
                                                                        data-placeholder="Select end time"
                                                                        id="custom_end_time">
                                                                        <option></option>
                                                                        @foreach ($timings as $key => $timing)
                                                                        <option value="{{$timing->time}}">
                                                                            {{$timing->time}}</option>
                                                                        @endforeach
                                                                    </select>
                                                                    <!--end::Input-->
                                                                </div>
                                                                <div class="col-md-1 fv-row">
                                                                    <!--begin::Input-->
                                                                    <input class="form-control mb-2 shift-start" name="start_date"
                                                                        placeholder="Pick start date"
                                                                        id="kt_calendar_datepicker_shift_start_date" />
                                                                    <!--end::Input-->
                                                                </div>
                                                                <div class="col-md-1 fv-row">
                                                                    <!--begin::Input-->
                                                                    <input class="form-control mb-2 shift-end" name="end_date"
                                                                        placeholder="Pick start date"
                                                                        id="kt_calendar_datepicker_shift_end_date" />
                                                                    <!--end::Input-->
                                                                </div>
                                                                <div class="col-md-1">
                                                                    <a href="javascript:;" data-repeater-delete
                                                                        class="btn btn-sm btn-light-danger mt-1">
                                                                        <i class="ki-duotone ki-trash fs-5"><span
                                                                                class="path1"></span><span
                                                                                class="path2"></span><span
                                                                                class="path3"></span><span
                                                                                class="path4"></span><span
                                                                                class="path5"></span></i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <!--end::Form group-->
                                                <!--begin::Form group-->
                                                <div class="form-group mt-5">
                                                    <a href="javascript:;" data-repeater-create
                                                        class="btn btn-light-primary">
                                                        <i class="ki-duotone ki-plus fs-3"></i>
                                                        Add
                                                    </a>
                                                </div>
                                                <!--end::Form group-->
                                            </div>
                                            <!--end::Repeater-->
                                        </div>
                                        <!--end::Card header-->
                                    </div>
                                </div>
                            </div>
                            <!--end::Tab pane-->
                        </div>
                        <!--end::Tab content-->
                        <div class="d-flex justify-content-end">
                            <!--begin::Button-->
                            <a href="{{ route('workers') }}" id="kt_ecommerce_add_product_cancel"
                                class="btn btn-light me-5">Cancel</a>
                            <!--end::Button-->
                            <!--begin::Button-->
                            <button type="submit" id="kt_ecommerce_add_submit" class="btn btn-primary">
                                <span class="indicator-label">Save Changes</span>
                                <span class="indicator-progress">Please wait...
                                    <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                            </button>
                            <!--end::Button-->
                        </div>
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
<script src="{{ asset('/assets/js/custom/loneworker/save-worker-v2.js') }}"></script>
<!-- CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.css" />
<!-- JS -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.35.3/es6-shim.min.js"></script>
{{-- <script src="/assets/js/widgets.bundle.js"></script>
<script src="/assets/js/custom/widgets.js"></script>
<script src="/assets/js/custom/apps/chat/chat.js"></script>
<script src="/assets/js/custom/utilities/modals/upgrade-plan.js"></script>
<script src="/assets/js/custom/utilities/modals/create-app.js"></script> --}}
{{-- <script src="/assets/js/custom/utilities/modals/users-search.js"></script> --}}
<link href="{{ asset('assets/plugins/custom/jkanban/jkanban.bundle.css') }}" rel="stylesheet" type="text/css" />
<script src="{{ asset('assets/plugins/custom/jkanban/jkanban.bundle.js') }}"></script>
<script src="{{ asset('/assets/plugins/custom/formrepeater/formrepeater.bundle.js') }}"></script>
<script>
    var assignedMonitors = @json($assignedMonitors);
    var unassignedMonitors = @json($unassignedMonitors);
    var sites = @json($sites);
    var timings = @json($timings);
    var utils_url = '/assets/js/utils.js';
</script>
@endpush