@extends('admin.layout.layout')

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
                            <h1 class="page-heading d-flex flex-column justify-content-center text-gray-900 lh-1 fw-bolder fs-2x my-0 me-5">Edit Subscription</h1>
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
                                <li class="breadcrumb-item text-gray-700 fw-bold lh-1">Subscription Management</li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item">
                                    <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                                </li>
                                <!--end::Item-->                                
                                <!--begin::Item-->
                                <li class="breadcrumb-item text-gray-700 fw-bold lh-1"><a href="/lwadmin/subscriptions">Subscriptions</a></li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item">
                                    <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                                </li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item text-gray-700">Edit Subscription</li>
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
                    <form id="kt_ecommerce_update_subscription" class="form d-flex flex-column flex-lg-row" data-kt-redirect="/lwadmin/subscriptions" action="/lwadmin/subscription/update">
                        <input type="hidden" name="id" value="{{ $subscription->subscription_id }}" />
                        @csrf
                        <!--begin::Main column-->
                        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                            <!--begin::General options-->
                            <div class="card card-flush py-4">
                                <!--begin::Card header-->
                                <div class="card-header">
                                    <div class="card-title">
                                        <h2>Subscription Detail</h2>
                                    </div>
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="form-label">Current Subsctiption Plan</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="plan_name" class="form-control mb-2" value="{{ $subscription->plan_name }}" disabled />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="form-label">Subsctiption Type</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="plan_type" class="form-control mb-2"  value="{{ $subscription->plan_type }}" disabled />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="form-label">Duration</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="duration" class="form-control mb-2"  value="{{ $subscription->duration }}" disabled />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="form-label">No. of Persons allowed</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="persons" class="form-control mb-2"  value="{{ $subscription->persons }}" disabled />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->                                     
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="form-label">User Name</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="username" class="form-control mb-2" value="{{ $subscription->username }}" disabled />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label">Phone Number</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="phone_no" class="form-control mb-2" placeholder="Phone number" value="{{ $subscription->phone_no }}" disabled />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label">Email address</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="email" class="form-control mb-2" placeholder="Email address" value="{{ $subscription->email }}" disabled />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label">Designation</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="designation" class="form-control mb-2" placeholder="Department" value="{{ $subscription->designation }}" disabled />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        @php 
                                            $active_class = '';
                                            $inactive_class = '';
                                            $cancelled_class = '';
                                            $status_class = '';
            
                                            if ($subscription->status=='active')
                                            {
                                                $active_class = "selected='selected'";
                                                $status_class = "bg-success";
                                            }
                                            else if ($subscription->status==='inactive')
                                            {
                                                $inactive_class = "selected='selected'";
                                                $status_class = "bg-warning";
                                            }
                                            else if ($subscription->status==='cancelled')
                                            {
                                                $cancelled_class = "selected='selected'";
                                                $status_class = "bg-danger";
                                            }                                            

                                            if($subscription->status=="active")
                                                $badge = "success";
                                            else if($subscription->status=="inactive")
                                                $badge = "warning";
                                            else if($subscription->status=="cancelled")
                                                $badge = "danger";
                                        @endphp 

                                        <!--begin::Label-->
                                        <label class="form-label">Subscription Status</label> <span class="badge badge-light-{{$badge}} fw-bold fs-8 px-2 py-1 ms-2"> 
                                            {{ ucfirst($subscription->status) }}
                                        </span>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <select name="status" class="form-select mb-2" data-control="select2" data-hide-search="true" data-placeholder="Select an option" id="kt_ecommerce_add_category_status_select">
                                            <option></option>
                                            <option value="active" {{$active_class}}>Active</option>
                                            <option value="inactive" {{$inactive_class}}>Inactive</option>
                                            <option value="cancelled" {{$cancelled_class}}>Cancelled</option>
                                        </select>
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <div class="d-flex justify-content-end">
                                        <!--begin::Button-->
                                        <a href="/lwadmin/subscriptions" id="kt_ecommerce_add_product_cancel" class="btn btn-light me-5">Cancel</a>
                                        <!--end::Button-->
                                        <!--begin::Button-->
                                        <button type="submit" id="kt_ecommerce_add_submit" class="btn btn-primary">
                                            <span class="indicator-label">Update Subscription</span>
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
            <!--begin::Content-->
            <div id="kt_app_content" class="app-content px-lg-3">
                <!--begin::Content container-->
                <div id="kt_app_content_container" class="app-container container-fluid">
                    <form id="kt_ecommerce_add_form" class="form d-flex flex-column flex-lg-row" data-kt-redirect="/lwadmin/subscriptions" action="/lwadmin/subscription/update">
                        <input type="hidden" name="id" value="{{ $subscription->subscription_id }}" />
                        @csrf
                        <!--begin::Main column-->
                        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                            <!--begin::General options-->
                            <div class="card card-flush py-4">
                                <!--begin::Card header-->
                                <div class="card-header">
                                    <div class="card-title">
                                        <h2>Change Subscription Plan</h2>
                                    </div>
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">

                                    <div class="alert alert-danger d-flex align-items-center p-5 mb-10">
                                        <i class="ki-duotone ki-shield-tick fs-2hx text-danger me-4"><span class="path1"></span><span class="path2"></span></i>                    <div class="d-flex flex-column">
                                            <h4 class="mb-1 text-danger">Alert: This action can't not undone</h4>
                                            <span>Please note that this action will change the user's current plan. The existing plan will be marked as cancelled.</span>
                                        </div>
                                    </div>

                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label">Select subscription plan</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <select name="plan" class="form-select mb-2" data-control="select2" data-hide-search="true" data-placeholder="Select an option" id="kt_ecommerce_add_category_status_plan">
                                            <option></option>
                                            @foreach ($plans as $key => $plan)
                                                <option value="{{$plan->id}}">{{$plan->plan_name}}</option>                                                
                                            @endforeach
                                        </select>
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <div class="d-flex justify-content-end">
                                        <!--begin::Button-->
                                        <a href="/lwadmin/subscriptions" id="kt_ecommerce_add_product_cancel" class="btn btn-light me-5">Cancel</a>
                                        <!--end::Button-->
                                        <!--begin::Button-->
                                        <button type="submit" id="kt_ecommerce_add_submit" class="btn btn-danger">
                                            <span class="indicator-label">Change Subscription Plan</span>
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

    <script src="/assets/js/custom/loneworker/update-subscription.js"></script>
    <script src="/assets/js/widgets.bundle.js"></script>
    <script src="/assets/js/custom/widgets.js"></script>
    <script src="/assets/js/custom/apps/chat/chat.js"></script>
    <script src="/assets/js/custom/utilities/modals/upgrade-plan.js"></script>
    <script src="/assets/js/custom/utilities/modals/create-app.js"></script>
    <script src="/assets/js/custom/utilities/modals/users-search.js"></script>

@endpush