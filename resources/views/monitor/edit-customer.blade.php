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
                            <h1 class="page-heading d-flex flex-column justify-content-center text-gray-900 lh-1 fw-bolder fs-2x my-0 me-5">Edit Customer</h1>
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
                                <li class="breadcrumb-item text-gray-700 fw-bold lh-1">Customer Management</li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item">
                                    <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                                </li>
                                <!--end::Item-->                                
                                <!--begin::Item-->
                                <li class="breadcrumb-item text-gray-700 fw-bold lh-1"><a href="/customers">Customers</a></li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item">
                                    <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                                </li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item text-gray-700">Edit Customer</li>
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
                    <form id="kt_ecommerce_add_form" class="form d-flex flex-column flex-lg-row" data-kt-redirect="{{ route('customers') }}" action="{{ route('customer.update') }}">
                        <input type="hidden" name="id" value="{{ $customer->id }}" />
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
                                        if(empty($customer->customer_image))
                                        {
                                            $image = 'assets/media/svg/files/blank-image.svg';
                                            $dark_image = 'assets/media/svg/files/blank-image-dark.svg';
                                        }
                                        else
                                        {
                                            $image = str_replace('public/', 'storage/', $customer->customer_image);
                                            $dark_image = '';
                                            echo '<input type="hidden" name="current_image" id="current_image" value="'.$customer->customer_image.'">';
                                        }
                                    @endphp	                                    


                                    <style>.image-input-placeholder { background-image: url($image); } [data-bs-theme="dark"] .image-input-placeholder { background-image: url($dark_image); }</style>
                                    <!--end::Image input placeholder-->
                                    <!--begin::Image input-->
                                    <div class="image-input image-input-empty image-input-outline image-input-placeholder mb-3" data-kt-image-input="true">
                                        <!--begin::Preview existing avatar-->
                                        <div class="image-input-wrapper w-150px h-150px"></div>
                                        <!--end::Preview existing avatar-->
                                        <!--begin::Label-->
                                        <label class="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow" data-kt-image-input-action="change" data-bs-toggle="tooltip" title="Change avatar">
                                            <!--begin::Icon-->
                                            <i class="ki-duotone ki-pencil fs-7">
                                                <span class="path1"></span>
                                                <span class="path2"></span>
                                            </i>
                                            <!--end::Icon-->
                                            <!--begin::Inputs-->
                                            <input type="file" name="customer_image" accept=".png, .jpg, .jpeg" />
                                            <!--end::Inputs-->
                                        </label>
                                        <!--end::Label-->
                                        <!--begin::Cancel-->
                                        <span class="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow" data-kt-image-input-action="cancel" data-bs-toggle="tooltip" title="Cancel avatar">
                                            <i class="ki-duotone ki-cross fs-2">
                                                <span class="path1"></span>
                                                <span class="path2"></span>
                                            </i>
                                        </span>
                                        <!--end::Cancel-->
                                        <!--begin::Remove-->
                                        <span class="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow" data-kt-image-input-action="remove" data-bs-toggle="tooltip" title="Remove avatar">
                                            <i class="ki-duotone ki-cross fs-2">
                                                <span class="path1"></span>
                                                <span class="path2"></span>
                                            </i>
                                        </span>
                                        <!--end::Remove-->
                                    </div>
                                    <!--end::Image input-->
                                    <!--begin::Description-->
                                    <div class="text-muted fs-7">Set the thumbnail image. Only *.png, *.jpg and *.jpeg image files are accepted</div>
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
        
                                        if ($customer->customer_status=='active')
                                        {
                                            $active_class = "selected='selected'";
                                            $status_class = "bg-success";
                                        }
                                        if ($customer->customer_status=='inactive')
                                        {
                                            $inactive_class = "selected='selected'";
                                            $status_class = "bg-danger";
                                        }
                                    @endphp                                    
                                    <!--begin::Card toolbar-->
                                    <div class="card-toolbar">
                                        <div class="rounded-circle {{ $status_class }} w-15px h-15px" id="kt_ecommerce_add_category_status"></div>
                                    </div>
                                    <!--begin::Card toolbar-->
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">
                                    <!--begin::Select2-->
                                    <select name="customer_status" class="form-select mb-2" data-control="select2" data-hide-search="true" data-placeholder="Select an option" id="kt_ecommerce_add_category_status_select">
                                        <option></option>
                                        <option value="active" {{ $active_class }}>Active</option>
                                        <option value="inactive" {{ $inactive_class }}>Inactive</option>
                                    </select>
                                    <!--end::Select2-->
                                    <!--begin::Description-->
                                    <div class="text-muted fs-7">Set customer status.</div>
                                    <!--end::Description-->
                                </div>
                                <!--end::Card body-->
                            </div>
                            <!--end::Status-->
                        </div>
                        <!--end::Aside column-->
                        <!--begin::Main column-->
                        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                            <!--begin::General options-->
                            <div class="card card-flush py-4">
                                <!--begin::Card header-->
                                <div class="card-header">
                                    <div class="card-title">
                                        <h2>Customer Detail</h2>
                                    </div>
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="required form-label">Customer Name</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="customer_name" class="form-control mb-2" placeholder="Customer name" value="{{ $customer->customer_name }}" />
                                        <!--end::Input-->
                                        <!--begin::Description-->
                                        <div class="text-muted fs-7">A customer name is required.</div>
                                        <!--end::Description-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="form-label">Phone Number</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="tel" id="phone_no" name="phone_no" class="form-control mb-2" value="{{ $customer->phone_no }}" />
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
                                        <input type="email" name="email" class="form-control mb-2" placeholder="Email address" value="{{ $customer->email }}" />
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
                                        <input type="text" name="department" class="form-control mb-2" placeholder="Department" value="{{ $customer->department }}" />
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
                                        <input type="text" name="role" class="form-control mb-2" placeholder="Role" value="{{ $customer->role }}" />
                                        <!--end::Input-->
                                        <!--begin::Description-->
                                        <div class="text-muted fs-7">Set role.</div>
                                        <!--end::Description-->
                                    </div>
                                    <!--end::Input group-->                                    
                                </div>
                                <!--end::Card header-->
                            </div>
                            <!--end::General options-->
                            <div class="d-flex justify-content-end">
                                <!--begin::Button-->
                                <a href="/customers" id="kt_ecommerce_add_product_cancel" class="btn btn-light me-5">Cancel</a>
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
    <script src="/assets/plugins/custom/formrepeater/formrepeater.bundle.js"></script>
    <!-- CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.css" />
    <!-- JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.35.3/es6-shim.min.js"></script>
    <script src="/assets/js/custom/loneworker/update-customer.js"></script>
    <script src="/assets/js/widgets.bundle.js"></script>
    <script src="/assets/js/custom/widgets.js"></script>
    <script src="/assets/js/custom/apps/chat/chat.js"></script>
    <script src="/assets/js/custom/utilities/modals/upgrade-plan.js"></script>
    <script src="/assets/js/custom/utilities/modals/create-app.js"></script>
    <script src="/assets/js/custom/utilities/modals/users-search.js"></script>

@endpush