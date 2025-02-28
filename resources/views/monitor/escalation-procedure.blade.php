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
                            <h1 class="page-heading d-flex flex-column justify-content-center text-gray-900 lh-1 fw-bolder fs-2x my-0 me-5">Escalation Procedure</h1>
                            <!--end::Title-->
                            <!--begin::Breadcrumb-->
                            {{-- <ul class="breadcrumb breadcrumb-separatorless fw-semibold">
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
                                <li class="breadcrumb-item text-gray-700 fw-bold lh-1">Escalation Procedure</li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item">
                                    <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                                </li>
                                <!--end::Item-->                                
                                <!--begin::Item-->
                                <li class="breadcrumb-item text-gray-700 fw-bold lh-1"><a href="{{ route('customers') }}">Customers</a></li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item">
                                    <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                                </li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item text-gray-700">Add Customer</li>
                                <!--end::Item-->
                            </ul> --}}
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
                    <form id="kt_ecommerce_add_form" class="form d-flex flex-column flex-lg-row" data-kt-redirect="{{ route('customers') }}" action="{{ route('customer.save') }}">
                        @csrf
                        <!--begin::Main column-->
                        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                            <!--begin::Worker details-->
                            <div class="card card-flush py-4">
                                <!--begin::Card header-->
                                <div class="card-header">
                                    <div class="card-title">
                                        <h2>Worker Details</h2>
                                    </div>
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">
                                    <div>
                                        <table class="table table-bordered table-striped text-center">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Name: </strong>{{ $worker->worker_name ?? 'N/A' }}</td>
                                                    <td><strong>Check In: </strong>{{ $worker->check_in_frequency_time ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Phone: </strong>{{ $worker->phone_no ?? 'N/A' }}</td>
                                                    <td><strong>Email: </strong>{{ $worker->email ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Emergency Contact 1: </strong>{{ $worker->emergency_contact_1 ?? 'N/A' }}</td>
                                                    <td><strong>Emergency Contact 2:  </strong>{{ $worker->emergency_contact_2 ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Shift Start: </strong>{{ $shiftStart }}</td>
                                                    <td><strong>Last Check In Completed: </strong>{{ $lastCheckInCompleted }}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Monitors: </strong>{{ $monitors }}</td>
                                                    <td><strong>Man Down:  </strong></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>                                
                                </div>
                                <!--end::Card header-->
                            </div>
                            <!--end::Worker details-->
                            <!--begin::NOK details-->
                            <div class="card card-flush py-4">
                                <!--begin::Card header-->
                                <div class="card-header">
                                    <div class="card-title">
                                        <h2>Next of Kin Details</h2>
                                    </div>
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">
                                    <div>
                                        <table class="table table-bordered table-striped text-center">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Name: </strong>{{ $worker->nok_name ?? 'N/A' }}</td>
                                                    <td><strong>Relation: </strong>{{ $worker->nok_relation ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Address: </strong>{{ $worker->nok_address ?? 'N/A' }}</td>
                                                    <td><strong>Phone: </strong>{{ $worker->nok_contact ?? 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>                                
                                </div>
                                <!--end::Card header-->
                            </div>
                            <!--end::NOK details-->
                            <!--begin::Customer details-->
                            <div class="card card-flush py-4">
                                <!--begin::Card header-->
                                <div class="card-header">
                                    <div class="card-title">
                                        <h2>Customer Details</h2>
                                    </div>
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">
                                    <div>
                                        <table class="table table-bordered table-striped text-center">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Name: </strong>{{ $workerShiftSiteDetails->customer_name ?? 'N/A' }}</td>
                                                    <td><strong>Role: </strong>{{ $workerShiftSiteDetails->customer_role ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Email: </strong>{{ $workerShiftSiteDetails->customer_email ?? 'N/A' }}</td>
                                                    <td><strong>Phone: </strong>{{ $workerShiftSiteDetails->customer_phone_no ?? 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>                                
                                </div>
                                <!--end::Card header-->
                            </div>
                            <!--end::Customer details-->
                            <!--begin::Site details-->
                            <div class="card card-flush py-4">
                                <!--begin::Card header-->
                                <div class="card-header">
                                    <div class="card-title">
                                        <h2>Site Details</h2>
                                    </div>
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">
                                    <div>
                                        <table class="table table-bordered table-striped text-center">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Name: </strong>{{ $workerShiftSiteDetails->site_name ?? 'N/A' }}</td>
                                                    <td><strong>Address: </strong>
                                                        {{ ($workerShiftSiteDetails?->site_address_1 ? $workerShiftSiteDetails?->site_address_1 : '') . ' , ' . ($workerShiftSiteDetails?->site_address_2 ? $workerShiftSiteDetails?->site_address_2 : '') }}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Country: </strong>{{ $workerShiftSiteDetails->country ?? 'N/A' }}</td>
                                                    <td><strong>Suburb/Town/City: </strong>{{ $workerShiftSiteDetails->suburb_town_city ?? 'N/A' }}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Postal Code: </strong>{{ $workerShiftSiteDetails->postal_code ?? 'N/A' }}</td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>                                
                                </div>
                                <!--end::Card header-->
                            </div>
                            <!--end::Site details-->
                            <!--begin::Incident details-->
                            <div class="card card-flush py-4">
                                <!--begin::Card header-->
                                <div class="card-header">
                                    <div class="card-title">
                                        <h2>Incident Details</h2>
                                    </div>
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">
                                    <div>
                                        <textarea class="form-control"></textarea>
                                    </div>                                
                                </div>
                                <!--end::Card header-->
                            </div>
                            <!--end::Incident details-->
                            {{-- <div class="d-flex justify-content-end">
                                <!--begin::Button-->
                                <a href="{{ route('customers') }}" id="kt_ecommerce_add_product_cancel" class="btn btn-light me-5">Cancel</a>
                                <!--end::Button-->
                                <!--begin::Button-->
                                <button type="submit" id="kt_ecommerce_add_submit" class="btn btn-primary">
                                    <span class="indicator-label">Save Changes</span>
                                    <span class="indicator-progress">Please wait... 
                                    <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                                </button>
                                <!--end::Button-->
                            </div> --}}
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

    <script src="{{ asset('assets/js/custom/loneworker/save-customer.js') }}"></script>

    <script src="{{ asset('/assets/plugins/custom/formrepeater/formrepeater.bundle.js') }}"></script>
    <script src="{{ asset('/assets/js/widgets.bundle.js') }}"></script>
    <script src="{{ asset('/assets/js/custom/apps/chat/chat.js') }}"></script>
    <script src="{{ asset('/assets/js/custom/utilities/modals/upgrade-plan.js') }}"></script>
    <script src="{{ asset('/assets/js/custom/utilities/modals/create-app.js') }}"></script>
    <script src="{{ asset('/assets/js/custom/utilities/modals/users-search.js') }}"></script>


@endpush