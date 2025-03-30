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
                        <h1
                            class="page-heading d-flex flex-column justify-content-center text-gray-900 lh-1 fw-bolder fs-2x my-0 me-5">
                            My Subscription</h1>
                        <!--end::Title-->
                        <!--begin::Breadcrumb-->
                        <ul class="breadcrumb breadcrumb-separatorless fw-semibold">
                            <!--begin::Item-->
                            <li class="breadcrumb-item text-gray-700 fw-bold lh-1">
                                <a href="{{ route('subscriber.dashboard') }}" class="text-gray-500 text-hover-primary">
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
                            <li class="breadcrumb-item text-gray-700 fw-bold lh-1"><a
                                    href="{{ route('subscriber.dashboard') }}">Dashboard</a></li>
                            <!--end::Item-->
                            <!--begin::Item-->
                            <li class="breadcrumb-item">
                                <i class="ki-duotone ki-right fs-4 text-gray-700 mx-n1"></i>
                            </li>
                            <!--end::Item-->
                            <!--begin::Item-->
                            <li class="breadcrumb-item text-gray-700">Subscription</li>
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
                                <h2 align="center">Your current plan is for {{ $subscription->persons ?? '' }} Lone
                                    Workers</h2>
                                <br />
                                <p align="center">You have chosed the plan</p>
                                <h1 align="center">{{$subscription->plan_name}}</h1>
                                <!--end::Label-->
                            </div>
                            <!--end::Input group-->
                        </div>
                        <!--end::Card header-->
                    </div>
                    <!--end::General options-->
                </div>
                <!--end::Main column-->
            </div>
            <!--end::Content container-->
        </div>
        <!--end::Content-->
        <!--begin::Content-->
        <div id="kt_app_content" class="app-content px-lg-3">
            <!--begin::Content container-->
            <div id="kt_app_content_container" class="app-container container-fluid">
                <form id="kt_ecommerce_add_form" class="form d-flex flex-column flex-lg-row"
                    data-kt-redirect="{{ route('subscription') }}" action="{{ route('card.update') }}">
                    @csrf
                    <!--begin::Main column-->
                    <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                        <!--begin::General options-->
                        <div class="card card-flush py-4">
                            <!--begin::Card header-->
                            <div class="card-header">
                                <div class="card-title">
                                    <h2>Update your Credit Card Details</h2>
                                </div>
                            </div>
                            <!--end::Card header-->
                            <!--begin::Card body-->
                            <div class="card-body pt-0">
                                <!--begin::Input group-->
                                <div class="mb-10 fv-row">
                                    <!--begin::Label-->
                                    <label class="required form-label">Card Holder Name</label>
                                    <!--end::Label-->
                                    <!--begin::Input-->
                                    <input type="text" name="card_holder_name" class="form-control mb-2"
                                        placeholder="Card name" value="{{ $card->card_holder_name ?? '' }}" />
                                    <!--end::Input-->
                                </div>
                                <!--end::Input group-->
                                <!--begin::Input group-->
                                <div class="mb-10 fv-row">
                                    <!--begin::Label-->
                                    <label class="required form-label">Card Number</label>
                                    <!--end::Label-->
                                    <!--begin::Input-->
                                    <input type="text" name="card_number" class="form-control mb-2"
                                        placeholder="Card number" value="{{ $card->card_number ?? '' }}" />
                                    <!--end::Input-->
                                </div>
                                <!--end::Input group-->
                                <!--begin::Input group-->
                                <div class="mb-10 fv-row">
                                    <!--begin::Label-->
                                    <label class="required form-label">Expiry Month</label>
                                    <!--end::Label-->
                                    <!--begin::Select2-->
                                    <select name="expiry_month" class="form-select mb-2" data-control="select2"
                                            data-hide-search="true" data-placeholder="Select an option"
                                            id="kt_ecommerce_add_category_status_select">
                                        <option></option>
                                        <option value="01" <?php echo $card && $card->expiry_month === '01' ? 'selected' : ''; ?>>Jan</option>
                                        <option value="02" <?php echo $card && $card->expiry_month === '02' ? 'selected' : ''; ?>>Feb</option>
                                        <option value="03" <?php echo $card && $card->expiry_month === '03' ? 'selected' : ''; ?>>Mar</option>
                                        <option value="04" <?php echo $card && $card->expiry_month === '04' ? 'selected' : ''; ?>>Apr</option>
                                        <option value="05" <?php echo $card && $card->expiry_month === '05' ? 'selected' : ''; ?>>May</option>
                                        <option value="06" <?php echo $card && $card->expiry_month === '06' ? 'selected' : ''; ?>>Jun</option>
                                        <option value="07" <?php echo $card && $card->expiry_month === '07' ? 'selected' : ''; ?>>Jul</option>
                                        <option value="08" <?php echo $card && $card->expiry_month === '08' ? 'selected' : ''; ?>>Aug</option>
                                        <option value="09" <?php echo $card && $card->expiry_month === '09' ? 'selected' : ''; ?>>Sep</option>
                                        <option value="10" <?php echo $card && $card->expiry_month === '10' ? 'selected' : ''; ?>>Oct</option>
                                        <option value="11" <?php echo $card && $card->expiry_month === '11' ? 'selected' : ''; ?>>Nov</option>
                                        <option value="12" <?php echo $card && $card->expiry_month === '12' ? 'selected' : ''; ?>>Dec</option>
                                    </select>
                                    <!--end::Select2-->
                                </div>
                                
                                <!--end::Input group-->
                                <!--begin::Input group-->
                                <div class="mb-10 fv-row">
                                    <!--begin::Label-->
                                    <label class="required form-label">Expity Year</label> <!-- Note: There might be a typo here; consider changing "Expity" to "Expiry" -->
                                    <!--end::Label-->
                                    <!--begin::Select2-->
                                    <select name="expiry_year" class="form-select mb-2" data-control="select2"
                                            data-hide-search="true" data-placeholder="Select an option"
                                            id="kt_ecommerce_add_category_status_select1">
                                        <option></option>
                                        <option value="2025" <?php echo $card && $card->expiry_year === '2025' ? 'selected' : ''; ?>>2025</option>
                                        <option value="2026" <?php echo $card && $card->expiry_year === '2026' ? 'selected' : ''; ?>>2026</option>
                                        <option value="2027" <?php echo $card && $card->expiry_year === '2027' ? 'selected' : ''; ?>>2027</option>
                                        <option value="2028" <?php echo $card && $card->expiry_year === '2028' ? 'selected' : ''; ?>>2028</option>
                                        <option value="2029" <?php echo $card && $card->expiry_year === '2029' ? 'selected' : ''; ?>>2029</option>
                                        <option value="2030" <?php echo $card && $card->expiry_year === '2030' ? 'selected' : ''; ?>>2030</option>
                                    </select>
                                    <!--end::Select2-->
                                </div>
                                
                                <!--end::Input group-->
                                <!--begin::Input group-->
                                <div class="mb-10 fv-row">
                                    <!--begin::Label-->
                                    <label class="required form-label">CVV/CVC</label>
                                    <!--end::Label-->
                                    <!--begin::Input-->
                                    <input type="text" name="cvv_cvc" class="form-control mb-2" placeholder="CVV/CVC" value="{{ $card->cvv_cvc ?? '' }}" />
                                    <!--end::Input-->
                                </div>
                                <!--end::Input group-->
                                <div class="d-flex justify-content-end">
                                    <!--begin::Button-->
                                    <a href="{{ route('customers') }}" id="kt_ecommerce_add_product_cancel"
                                        class="btn btn-light me-5">Cancel</a>
                                    <!--end::Button-->
                                    <!--begin::Button-->
                                    <button type="submit" id="kt_ecommerce_add_submit" class="btn btn-primary">
                                        <span class="indicator-label">Update Information</span>
                                        <span class="indicator-progress">Please wait...
                                            <span
                                                class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
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

<script src="/assets/js/custom/loneworker/update-card.js"></script>
<script src="/assets/js/widgets.bundle.js"></script>
<script src="/assets/js/custom/widgets.js"></script>
<script src="/assets/js/custom/apps/chat/chat.js"></script>
<script src="/assets/js/custom/utilities/modals/upgrade-plan.js"></script>
<script src="/assets/js/custom/utilities/modals/create-app.js"></script>
<script src="/assets/js/custom/utilities/modals/users-search.js"></script>

@endpush