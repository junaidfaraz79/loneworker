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
                            <h1 class="page-heading d-flex flex-column justify-content-center text-gray-900 lh-1 fw-bolder fs-2x my-0 me-5">Edit Site</h1>
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
                                <li class="breadcrumb-item text-gray-700 fw-bold lh-1">Site Management</li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item">
                                    <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                                </li>
                                <!--end::Item-->                                
                                <!--begin::Item-->
                                <li class="breadcrumb-item text-gray-700 fw-bold lh-1"><a href="{{ route('sites') }}">Sites</a></li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item">
                                    <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                                </li>
                                <!--end::Item-->
                                <!--begin::Item-->
                                <li class="breadcrumb-item text-gray-700">Edit Site</li>
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
                    <form id="kt_ecommerce_add_form" class="form d-flex flex-column flex-lg-row" data-kt-redirect="{{ route('sites') }}" action="{{ route('site.update') }}">
                        @csrf
                        <input type="hidden" name="id" value="{{ $site->id }}" />
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
                                        if(empty($site->site_image))
                                        {
                                            $image = 'assets/media/svg/files/blank-image.svg';
                                            $dark_image = 'assets/media/svg/files/blank-image-dark.svg';
                                        }
                                        else
                                        {
                                            $image = str_replace('public/', 'storage/', $site->site_image);
                                            $dark_image = '';
                                            echo '<input type="hidden" name="current_image" id="current_image" value="'.$site->site_image.'">';
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
                                            <input type="file" name="site_image" accept=".png, .jpg, .jpeg" />
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
        
                                        if ($site->site_status=='active')
                                        {
                                            $active_class = "selected='selected'";
                                            $status_class = "bg-success";
                                        }
                                        if ($site->site_status=='inactive')
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
                                    <select name="site_status" class="form-select mb-2" data-control="select2" data-hide-search="true" data-placeholder="Select an option" id="kt_ecommerce_add_category_status_select">
                                        <option></option>
                                        <option value="active" {{ $active_class }}>Active</option>
                                        <option value="inactive" {{ $inactive_class }}>Inactive</option>
                                    </select>
                                    <!--end::Select2-->
                                    <!--begin::Description-->
                                    <div class="text-muted fs-7">Set site status.</div>
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
                                        <h2>Site Detail</h2>
                                    </div>
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="required form-label">Site Name</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="site_name" class="form-control mb-2" placeholder="Site name" value="{{ $site->site_name }}" />
                                        <!--end::Input-->
                                        <!--begin::Description-->
                                        <div class="text-muted fs-7">A site name is required.</div>
                                        <!--end::Description-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="required form-label">Country</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <select name="country" class="form-select mb-2" data-control="select2"
                                            data-placeholder="Select country" id="country">
                                            <option></option>
                                            @foreach ($countries as $key => $country)
                                                <option value="{{ $country }}" {{ $site->country === $country ? 'selected' : '' }}>
                                                    {{ $country }}
                                                </option>
                                            </option>
                                            @endforeach
                                        </select>
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label">Address Line 1</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="site_address_1" class="form-control mb-2" placeholder="Site Address" value="{{ $site->site_address_1 }}" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label required">Address Line 2</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="site_address_2" class="form-control mb-2" placeholder="Address Line 2" value="{{ $site->site_address_2 }}" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label required">Suburb/ Town/ City</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="suburb_town_city" class="form-control mb-2" placeholder="Enter your suburb, town, or city" value="{{ $site->suburb_town_city }}" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label required">Postal Code/ ZIP Code</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="postal_code" class="form-control mb-2" placeholder="Enter postal/zip code" value="{{ $site->postal_code }}" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label required">Longitude</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="longitude" class="form-control mb-2"
                                            placeholder="e.g., -180.00000000 to +180.00000000"  value="{{ $site->longitude }}" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label required">Latitude</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="latitude" class="form-control mb-2"
                                            placeholder="e.g., -90.00000000 to +90.00000000"  value="{{ $site->latitude }}" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="required form-label">This Site's Week Starts On</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <select name="week_start" class="form-select mb-2" data-control="select2" data-placeholder="Select day" id="week_start">
                                            <option></option>
                                            <option value="Monday" @if($site->week_start == 'Monday') selected @endif>Monday</option>
                                            <option value="Tuesday" @if($site->week_start == 'Tuesday') selected @endif>Tuesday</option>
                                            <option value="Wednesday" @if($site->week_start == 'Wednesday') selected @endif>Wednesday</option>
                                            <option value="Thursday" @if($site->week_start == 'Thursday') selected @endif>Thursday</option>
                                            <option value="Friday" @if($site->week_start == 'Friday') selected @endif>Friday</option>
                                            <option value="Saturday" @if($site->week_start == 'Saturday') selected @endif>Saturday</option>
                                            <option value="Sunday" @if($site->week_start == 'Sunday') selected @endif>Sunday</option>
                                        </select>                                        
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <div class="mb-10 fv-row">
                                        <!--begin::Label-->
                                        <label class="form-label">Customer</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <select name="customer_id" class="form-select mb-2" data-control="select2" data-placeholder="Select customer" id="country">
                                            <option></option>
                                            @foreach ($customers as $customer)
                                                <option value="{{ $customer->id }}" @if($site->customer_id == $customer->id) selected @endif>
                                                    {{ $customer->customer_name }}
                                                </option>
                                            @endforeach
                                        </select>                                        
                                        <!--end::Input-->
                                    </div>
                                </div>
                                <!--end::Card header-->
                            </div>
                            <!--end::General options-->
                            <!--begin::Site contact options-->
                            <div class="card card-flush py-4">
                                <!--begin::Card header-->
                                <div class="card-header">
                                    <div class="card-title">
                                        <h2>Site Contacts</h2>
                                    </div>
                                </div>
                                <!--end::Card header-->
                                <!--begin::Card body-->
                                <div class="card-body pt-0">
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label required">Site Manager Name</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="site_manager_name" class="form-control mb-2"
                                            placeholder="Enter site manager name" value="{{ $site->site_manager_name }}" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label required">Site Manager Contact</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="site_manager_contact" class="form-control mb-2"
                                            placeholder="Enter site manager contact" value="{{ $site->site_manager_contact }}" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label required">National Emergency Number</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="national_emergency_number" class="form-control mb-2"
                                            placeholder="Enter national emergency number" value="{{ $site->national_emergency_number }}" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label required">Local Police Contact</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="local_police_contact" class="form-control mb-2"
                                            placeholder="Enter local police contact" value="{{ $site->local_police_contact }}" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label required">Local Fire Brigade Contact</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="local_firebrigade_contact" class="form-control mb-2"
                                            placeholder="Enter local fire brigade contact" value="{{ $site->local_firebrigade_contact }}" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                    <!--begin::Input group-->
                                    <div class="mb-10">
                                        <!--begin::Label-->
                                        <label class="form-label required">Local Hospital/Medical Contact</label>
                                        <!--end::Label-->
                                        <!--begin::Input-->
                                        <input type="text" name="local_hospital_contact" class="form-control mb-2"
                                            placeholder="Enter local hospital/medical contact" value="{{ $site->local_hospital_contact }}" />
                                        <!--end::Input-->
                                    </div>
                                    <!--end::Input group-->
                                </div>
                                <!--end::Card body-->
                            </div>
                            <!--end::Site contact options-->
                            <div class="d-flex justify-content-end">
                                <!--begin::Button-->
                                <a href="{{ route('sites') }}" id="kt_ecommerce_add_product_cancel" class="btn btn-light me-5">Cancel</a>
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

    <script src="/assets/js/custom/loneworker/update-site.js"></script>
    <script src="/assets/js/widgets.bundle.js"></script>
    <script src="/assets/js/custom/widgets.js"></script>
    <script src="/assets/js/custom/apps/chat/chat.js"></script>
    <script src="/assets/js/custom/utilities/modals/upgrade-plan.js"></script>
    <script src="/assets/js/custom/utilities/modals/create-app.js"></script>
    <script src="/assets/js/custom/utilities/modals/users-search.js"></script>

@endpush