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
                            {{ $isViewMode === 'n' ? 'Edit Worker' : 'View Worker' }}</h1>
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
                            <li class="breadcrumb-item text-gray-700 fw-bold lh-1">Worker Management</li>
                            <!--end::Item-->
                            <!--begin::Item-->
                            <li class="breadcrumb-item">
                                <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                            </li>
                            <!--end::Item-->
                            <!--begin::Item-->
                            <li class="breadcrumb-item text-gray-700 fw-bold lh-1"><a href="{{ route('workers') }}">Workers</a></li>
                            <!--end::Item-->
                            <!--begin::Item-->
                            <li class="breadcrumb-item">
                                <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                            </li>
                            <!--end::Item-->
                            <!--begin::Item-->
                            <li class="breadcrumb-item text-gray-700">{{ $isViewMode === 'n' ? 'Edit Worker' : 'View
                                Worker'}}</li>
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
                <form id="kt_ecommerce_add_form" class="form d-flex flex-column flex-lg-row" data-kt-redirect="{{ route('workers') }}"
                    action="{{ route('worker.update') }}">
                    <input type="hidden" name="id" value="{{ $worker->id }}" />
                    @csrf
                    <!--begin::Aside column-->
                    <div class="d-flex flex-column gap-7 gap-lg-10 w-100 w-lg-300px mb-7 me-lg-10">
                        <!--begin::Thumbnail settings-->
                        <div class="card card-flush py-4">
                            <!--begin::Card header-->
                            <div class="card-header">
                                <!--begin::Card title-->
                                <div class="card-title">
                                    <h2>Thumbnail</h2>
                                </div>
                                <!--end::Card title-->
                            </div>
                            <!--end::Card header-->
                            <!--begin::Card body-->
                            <div class="card-body text-center pt-0">
                                <!--begin::Image input-->
                                <!--begin::Image input placeholder-->

                                @php
                                if (empty($worker->worker_image)) {
                                $image = asset('assets/media/svg/files/blank-image.svg');
                                $dark_image = asset('assets/media/svg/files/blank-image-dark.svg');
                                } else {
                                $image = asset('storage/' . $worker->worker_image);
                                $dark_image = ''; // Assuming no dark mode image for user uploaded images
                                echo '<input type="hidden" name="current_image" id="current_image"
                                    value="'.$worker->worker_image.'">';
                                }
                                @endphp


                                <style>
                                    .image-input-placeholder {
                                        background-image: url("{{ $image }}");
                                    }

                                    [data-bs-theme="dark"] .image-input-placeholder {
                                        background-image: url("{{ $dark_image }}");
                                    }
                                </style>
                                <!--end::Image input placeholder-->
                                <!--begin::Image input-->
                                <div class="image-input image-input-empty image-input-outline image-input-placeholder mb-3"
                                    data-kt-image-input="true">
                                    <!--begin::Preview existing avatar-->
                                    <div class="image-input-wrapper w-150px h-150px"
                                        style="background-image: url('{{ $image }}')"></div>
                                    <!--end::Preview existing avatar-->
                                    <!--begin::Label-->
                                    @if($isViewMode === 'n')
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
                                        <input type="file" name="worker_image" accept=".png, .jpg, .jpeg" />
                                        <!--end::Inputs-->
                                    </label>
                                    @endif
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
                                <!--end::Image input-->
                                <!--begin::Description-->
                                @if($isViewMode === 'n')
                                <div class="text-muted fs-7">Set the thumbnail image. Only *.png, *.jpg and *.jpeg image
                                    files are accepted</div>
                                @endif
                                <!--end::Description-->
                            </div>
                            <!--end::Card body-->
                        </div>
                        <!--end::Thumbnail settings-->
                        <!--begin::Status-->
                        <div class="card card-flush py-4">
                            <!--begin::Card header-->
                            <div class="card-header">
                                <!--begin::Card title-->
                                <div class="card-title">
                                    <h2>Status</h2>
                                </div>
                                <!--end::Card title-->
                                @php
                                $active_class = '';
                                $inactive_class = '';
                                $status_class = '';

                                if ($worker->worker_status=='active')
                                {
                                $active_class = "selected='selected'";
                                $status_class = "bg-success";
                                }
                                if ($worker->worker_status=='inactive')
                                {
                                $inactive_class = "selected='selected'";
                                $status_class = "bg-danger";
                                }
                                @endphp
                                <!--begin::Card toolbar-->
                                <div class="card-toolbar">
                                    <div class="rounded-circle {{ $status_class }} w-15px h-15px"
                                        id="kt_ecommerce_add_category_status"></div>
                                </div>
                                <!--begin::Card toolbar-->
                            </div>
                            <!--end::Card header-->
                            <!--begin::Card body-->
                            <div class="card-body pt-0">
                                <!--begin::Select2-->
                                <select name="worker_status" class="form-select mb-2" {{ $isViewMode==='y' ? 'disabled'
                                    : '' }} data-control="select2" data-hide-search="true"
                                    data-placeholder="Select an option" id="kt_ecommerce_add_category_status_select">
                                    <option></option>
                                    <option value="active" {{ $active_class }}>Active</option>
                                    <option value="inactive" {{ $inactive_class }}>Inactive</option>
                                </select>
                                <!--end::Select2-->
                                <!--begin::Description-->
                                @if($isViewMode === 'n')
                                <div class="text-muted fs-7">Set worker status.</div>
                                @endif
                                <!--end::Description-->
                            </div>
                            <!--end::Card body-->
                        </div>
                        <!--end::Status-->
                    </div>
                    <!--end::Aside column-->
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
                        </ul>
                        <!--end:::Tabs-->
                        <!--begin::Tab content-->
                        <div class="tab-content">
                            <!--begin::Tab pane (Worker Details)-->
                            <div class="tab-pane fade show active" id="worker_details_tab" role="tab-panel">
                                <div class="d-flex flex-column gap-7 gap-lg-10">
                                    <!--begin::General options-->
                                    <!--begin::Worker details-->
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
                                            <!--begin::Input group-->
                                            <div class="mb-10 fv-row">
                                                <!--begin::Label-->
                                                <label class="required form-label">Worker Name</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="worker_name" class="form-control mb-2"
                                                    placeholder="Worker name" value="{{ $worker->worker_name }}" {{
                                                    $isViewMode==='y' ? 'readonly' : '' }} />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                @if($isViewMode === 'n')
                                                <div class="text-muted fs-7">A worker name is required.</div>
                                                @endif
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10">
                                                <!--begin::Label-->
                                                <label class="form-label">Phone Number</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="phone_no" class="form-control mb-2"
                                                    placeholder="Phone number" value="{{ $worker->phone_no }}" {{
                                                    $isViewMode==='y' ? 'readonly' : '' }} />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                @if($isViewMode === 'n')
                                                <div class="text-muted fs-7">Set phone number.</div>
                                                @endif
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10">
                                                <!--begin::Label-->
                                                <label class="form-label">Email address</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="email" class="form-control mb-2"
                                                    placeholder="Email address" value="{{ $worker->email }}" {{
                                                    $isViewMode==='y' ? 'readonly' : '' }} />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                @if($isViewMode === 'n')
                                                <div class="text-muted fs-7">Set email address.</div>
                                                @endif
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10">
                                                <!--begin::Label-->
                                                <label class="form-label">Department</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="department" class="form-control mb-2"
                                                    placeholder="Department" value="{{ $worker->department }}" {{
                                                    $isViewMode==='y' ? 'readonly' : '' }} />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                @if($isViewMode === 'n')
                                                <div class="text-muted fs-7">Set department.</div>
                                                @endif
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10">
                                                <!--begin::Label-->
                                                <label class="form-label">Role</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="role" class="form-control mb-2"
                                                    placeholder="Role" value="{{ $worker->role }}" {{ $isViewMode==='y'
                                                    ? 'readonly' : '' }} />
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                @if($isViewMode === 'n')
                                                <div class="text-muted fs-7">Set role.</div>
                                                @endif
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10">
                                                <!--begin::Label-->
                                                <label class="form-label">Check In Frequency</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <select class="form-select mb-2" data-control="select2"
                                                    data-hide-search="true" data-placeholder="Select an option"
                                                    name="check_in_frequency" {{ $isViewMode==='y' ? 'disabled' : '' }}>
                                                    <option value="">Select frequency</option>
                                                    @foreach ($frequency as $f)
                                                    <option value="{{ $f->id }}" {{ $f->id ==
                                                        $worker->check_in_frequency ? 'selected' : '' }}>
                                                        {{ $f->time }}
                                                    </option>
                                                    @endforeach
                                                </select>

                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                @if($isViewMode === 'n')
                                                <div class="text-muted fs-7">Set Check In Frequency.</div>
                                                @endif
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10">
                                                <!--begin::Label-->
                                                <label class="form-label">Phone Type</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <select class="form-select mb-2" {{ $isViewMode==='y' ? 'disabled' : ''
                                                    }} data-control="select2" data-hide-search="true"
                                                    data-placeholder="Select an option" name="phone_type">
                                                    @php
                                                    $old_class = '';
                                                    $smart_class = '';

                                                    if ($worker->phone_type=='old')
                                                    $old_class = 'selected="selected"';
                                                    elseif ($worker->phone_type=='smart')
                                                    $smart_class = 'selected="selected"';
                                                    @endphp
                                                    <option>Select type</option>
                                                    <option {{ $old_class }} value="old">Old Phone</option>
                                                    <option {{ $smart_class }} value="smart">Smart Phone</option>
                                                </select>
                                                <!--end::Input-->
                                                <!--begin::Description-->
                                                @if($isViewMode === 'n')
                                                <div class="text-muted fs-7">Set phone type.</div>
                                                @endif
                                                <!--end::Description-->
                                            </div>
                                            <!--end::Input group-->
                                            
                                            <!--begin::Input group-->
                                            <div class="row mb-10">
                                                <div class="col-lg-6">
                                                    <!--begin::Label-->
                                                    <label class="form-label">SIA Licence Number</label>
                                                    <!--end::Label-->
                                                    <!--begin::Input-->
                                                    <input type="text" name="sia_license_number" class="form-control mb-2"
                                                        placeholder="SIA Licence Number" value="{{ $worker->sia_license_number }}" {{
                                                        $isViewMode==='y' ? 'readonly' : '' }} />
                                                    <!--end::Input-->
                                                    @if($isViewMode === 'n')
                                                    <!--begin::Description-->
                                                    <div class="text-muted fs-7">16 digit SIA Licence Number.</div>
                                                    <!--end::Description-->
                                                    @endif
                                                </div>
                                                <div class="col-lg-6">
                                                    <!--begin::Label-->
                                                    <label class="form-label">SIA Licence Expiry Date</label>
                                                    <!--end::Label-->
                                                    <!--begin::Input-->
                                                    <input class="form-control mb-2" name="sia_license_expiry_date" placeholder="Pick expiry date" 
                                                    value="{{ $worker->sia_license_expiry_date }}" {{ $isViewMode==='y' ? 'readonly' : '' }} id="kt_calendar_datepicker_start_date" />
                                                    <!--end::Input-->
                                                    @if($isViewMode === 'n')
                                                    <!--begin::Description-->
                                                    <div class="text-muted fs-7">Set SIA licence expiry date.</div>
                                                    <!--end::Description-->
                                                    @endif
                                                </div>
                                            </div>
                                            <!--end::Input group-->
                                            
                                            <!--begin::Input group-->
                                            <div class="row">
                                                <div class="col-lg-6">
                                                    <!--begin::Label-->
                                                    <label class="required form-label">Primary Emergency Contact</label>
                                                    <!--end::Label-->
                                                    <!--begin::Input-->
                                                    <input type="text" name="emergency_contact_1" class="form-control mb-2"
                                                        placeholder="Emergency phone number" value="{{ $worker->emergency_contact_1 }}" {{
                                                        $isViewMode==='y' ? 'readonly' : '' }} />
                                                    <!--end::Input-->
                                                    @if($isViewMode === 'n')
                                                    <!--begin::Description-->
                                                    <div class="text-muted fs-7">Set primary emergency phone number.</div>
                                                    <!--end::Description-->
                                                    @endif
                                                </div>
                                                <div class="col-lg-6">
                                                    <!--begin::Label-->
                                                    <label class="required form-label">Secondary Emergency Contact</label>
                                                    <!--end::Label-->
                                                    <!--begin::Input-->
                                                    <input type="text" name="emergency_contact_2" class="form-control mb-2"
                                                        placeholder="Emergency phone number" value="{{ $worker->emergency_contact_2 }}" {{
                                                        $isViewMode==='y' ? 'readonly' : '' }} />
                                                    <!--end::Input-->
                                                    @if($isViewMode === 'n')
                                                    <!--begin::Description-->
                                                    <div class="text-muted fs-7">Set secondary emergency phone number.</div>
                                                    <!--end::Description-->
                                                    @endif
                                                </div>
                                            </div>
                                            <!--end::Input group-->
                                        </div>
                                        <!--end::Card header-->
                                    </div>
                                    <!--end::Worker details-->
                                    <!--begin::NOK details-->
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
                                            <div class="mb-10 row">
                                                <!--begin::Label-->
                                                <label class="form-label">Name</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="nok_name" class="form-control mb-2"
                                                    placeholder="Name" value="{{ $worker->nok_name }}" {{
                                                    $isViewMode==='y' ? 'readonly' : '' }} />
                                                <!--end::Input-->
                                                @if($isViewMode === 'n')
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set Name.</div>
                                                <!--end::Description-->
                                                @endif
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 row">
                                                <!--begin::Label-->
                                                <label class="form-label">Relation</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="nok_relation" class="form-control mb-2"
                                                    placeholder="Relation" value="{{ $worker->nok_relation }}" {{
                                                    $isViewMode==='y' ? 'readonly' : '' }} />
                                                <!--end::Input-->
                                                @if($isViewMode === 'n')
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set Relation.</div>
                                                <!--end::Description-->
                                                @endif
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 row">
                                                <!--begin::Label-->
                                                <label class="form-label">Address</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="nok_address" class="form-control mb-2"
                                                    placeholder="Address" value="{{ $worker->nok_address }}" {{
                                                    $isViewMode==='y' ? 'readonly' : '' }} />
                                                <!--end::Input-->
                                                @if($isViewMode === 'n')
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set Address.</div>
                                                <!--end::Description-->
                                                @endif
                                            </div>
                                            <!--end::Input group-->
                                            <!--begin::Input group-->
                                            <div class="mb-10 row">
                                                <!--begin::Label-->
                                                <label class="form-label">Number</label>
                                                <!--end::Label-->
                                                <!--begin::Input-->
                                                <input type="text" name="nok_contact" class="form-control mb-2"
                                                    placeholder="Number" value="{{ $worker->nok_contact }}" {{
                                                    $isViewMode==='y' ? 'readonly' : '' }} />
                                                <!--end::Input-->
                                                @if($isViewMode === 'n')
                                                <!--begin::Description-->
                                                <div class="text-muted fs-7">Set Number.</div>
                                                <!--end::Description-->
                                                @endif
                                            </div>
                                            <!--end::Input group-->
                                        </div>
                                        <!--end::Card header-->
                                    </div>
                                    <!--end::NOK details-->
                                    <!--end::General options-->
                                </div>
                            </div>
                            <!--end::Tab pane-->
                            <!--begin::Tab pane (Worker Documents)-->
                            <div class="tab-pane fade" id="worker_documents_tab" role="tab-panel">
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
                                            @if($isViewMode === 'n')
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
                                            @else
                                                <div class="row g-6 g-xl-9 mb-6 mb-xl-9">
                                                    @forelse ($documents as $document)
                                                        <!--begin::Col-->
                                                        <div class="col-md-6 col-lg-4 col-xl-3">
                                                            <!--begin::Card-->
                                                            <div class="card h-100">
                                                                <!--begin::Card body-->
                                                                <div class="card-body d-flex justify-content-center text-center flex-column p-8">
                                                                    @php
                                                                        $extension = strtolower(pathinfo($document->file_path, PATHINFO_EXTENSION));
                                                                        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
                                                                        $isImage = in_array($extension, $imageExtensions);
                                                                        $fileUrl = $isImage ? asset('storage/' . $document->file_path) : route('downloadDocument', $document->id);
                                                                        $target = $isImage ? '_blank' : '_self';
                                                                        $download = $isImage ? '' : 'download';
                                                                        $imagePath = $isImage ? asset('storage/' . $document->file_path) : asset($fileTypeImages[$extension] ?? 'assets/media/svg/files/upload.svg');
                                                                    @endphp
                                                                    <!--begin::Name-->
                                                                    <a href="{{ $fileUrl }}" target="{{ $target }}" {{ $download }}
                                                                        class="text-gray-800 text-hover-primary d-flex flex-column">
                                                                        <div class="symbol symbol-60px mb-5">
                                                                            @if ($isImage)
                                                                                <img src="{{ asset('storage/' . $document->file_path) }}" alt="Document" />
                                                                            @else
                                                                                <img src="{{ $imagePath }}" alt="Document" />
                                                                            @endif
                                                                        </div>
                                                                        <div class="fs-5 fw-bold mb-2">{{ $document->file_name }}</div>
                                                                    </a>
                                                                    <!--end::Name-->
                                                                </div>
                                                                <!--end::Card body-->
                                                            </div>
                                                            <!--end::Card-->
                                                        </div>
                                                        <!--end::Col-->
                                                    @empty
                                                        <span>No documents found.</span>
                                                    @endforelse
                                                </div>
                                            @endif
                                            <!--end::Description-->
                                        </div>
                                        <!--end::Card header-->
                                    </div>
                                    <!--end::General options-->
                                </div>
                            </div>
                            <!--end::Tab pane-->
                        </div>
                        <!--end::Tab content-->
                        @if($isViewMode === 'n')
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
                        @endif
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

<script src="/assets/plugins/custom/formrepeater/formrepeater.bundle.js"></script>

<script src="/assets/js/custom/loneworker/update-worker.js"></script>
<script src="/assets/js/widgets.bundle.js"></script>
<script src="/assets/js/custom/widgets.js"></script>
<script src="/assets/js/custom/apps/chat/chat.js"></script>
<script src="/assets/js/custom/utilities/modals/upgrade-plan.js"></script>
<script src="/assets/js/custom/utilities/modals/create-app.js"></script>
<script src="/assets/js/custom/utilities/modals/users-search.js"></script>

@endpush