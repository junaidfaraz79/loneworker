@extends('layout')

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
                            <h1 class="page-heading d-flex flex-column justify-content-center text-gray-900 lh-1 fw-bolder fs-2x my-0 me-5">Add Monitor</h1>
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
                                <li class="breadcrumb-item text-gray-700 fw-bold lh-1">User Management</li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item">
                                    <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                                </li>
                                <!--end::Item-->                                
                                <!--begin::Item-->
                                <li class="breadcrumb-item text-gray-700 fw-bold lh-1"><a href="{{ route('monitors') }}">Monitors</a></li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item">
                                    <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                                </li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item text-gray-700">Add Monitor</li>
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
                    <form id="kt_ecommerce_add_user" class="form d-flex flex-column flex-lg-row" data-kt-redirect="{{ route('monitors') }}" action="{{ route('monitor.save') }}" method="post">
                        @csrf
                        <!--begin::Main column-->
                        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                            <!--begin::General options-->
                            <div class="card card-flush py-4">
                                <!--begin::Card header-->
                                <div class="card-header">
                                    <div class="card-title">
                                        <h2>Monitor Detail</h2>
                                    </div>
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="required form-label">Full Name</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="username" class="form-control mb-2" placeholder="Full name" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="required form-label">Cell Number</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="cell_no" class="form-control mb-2" placeholder="Cell number" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->                                    
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="required form-label">Phone Number</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="phone_no" class="form-control mb-2" placeholder="Phone number" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="required form-label">Email address</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="email" name="email" class="form-control mb-2" placeholder="Email address" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="required form-label">Designation</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="designation" class="form-control mb-2" placeholder="Designation" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="required form-label">Company Name</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="company_name" class="form-control mb-2" placeholder="Company name" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="required form-label">Official Address</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="official_address" class="form-control mb-2" placeholder="Official address" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <div class="d-flex justify-content-end">
                                        <!--begin::Button-->
                                        <a href="{{ route('monitors') }}" id="kt_ecommerce_add_product_cancel" class="btn btn-light me-5">Cancel</a>
                                        <!--end::Button-->
                                        <!--begin::Button-->
                                        <button type="submit" id="kt_ecommerce_add_submit" class="btn btn-primary">
                                            <span class="indicator-label">Add Monitor</span>
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

    <script src="/assets/plugins/custom/formrepeater/formrepeater.bundle.js"></script>
    <script src="/assets/js/widgets.bundle.js"></script>
    <script src="/assets/js/custom/widgets.js"></script>
    <script src="/assets/js/custom/apps/chat/chat.js"></script>
    <script src="/assets/js/custom/utilities/modals/upgrade-plan.js"></script>
    <script src="/assets/js/custom/utilities/modals/create-app.js"></script>
    <script src="/assets/js/custom/utilities/modals/users-search.js"></script>
    <script src="{{ asset('assets/js/custom/loneworker/save-user.js') }}"></script>

@endpush