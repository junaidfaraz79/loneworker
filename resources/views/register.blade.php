<!DOCTYPE html>
<!--
Author: Keenthemes
Product Name: StarProduct Version: 1.0.4
Purchase: https://keenthemes.com/products/star-html-pro
Website: http://www.keenthemes.com
Contact: support@keenthemes.com
Follow: www.twitter.com/keenthemes
Dribbble: www.dribbble.com/keenthemes
Like: www.facebook.com/keenthemes
License: For each use you must have a valid license purchased only from above link in order to legally use the theme for your project.
-->
<html lang="en">
<!--begin::Head-->

<head>
	<base href="../../" />
	<title>Star Theme by KeenThemes</title>
	<meta charset="utf-8" />
	<meta name="description"
		content="Star HTML Pro - Bootstrap 5 HTML & Asp.net Core 7 Multipurpose Admin Dashboard Theme" />
	<meta name="keywords"
		content="Star, bootstrap, bootstrap 5, asp.net core 7, admin themes, free admin themes, bootstrap admin, bootstrap dashboard" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:type" content="article" />
	<meta property="og:title" content="Star Theme by KeenThemes" />
	<meta property="og:url" content="https://keenthemes.com/products/star-html-pro" />
	<meta property="og:site_name" content="Star HTML Pro by Keenthemes" />
	<link rel="canonical" href="http://preview.keenthemes.comauthentication/sign-up/basic.html" />
	<link rel="shortcut icon" href="assets/media/logos/favicon.ico" />
	<!--begin::Fonts(mandatory for all pages)-->
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" />
	<!--end::Fonts-->
	<!--begin::Global Stylesheets Bundle(mandatory for all pages)-->
	<link href="assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
	<link href="assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
	<!--end::Global Stylesheets Bundle-->
	<script>
		// Frame-busting to prevent site from being loaded within a frame without permission (click-jacking) if (window.top != window.self) { window.top.location.replace(window.self.location.href); }
	</script>
</head>
<!--end::Head-->
<!--begin::Body-->

<body id="kt_body" class="app-blank">
	<!--begin::Theme mode setup on page load-->
	<script>
		var defaultThemeMode = "light"; var themeMode; if ( document.documentElement ) { if ( document.documentElement.hasAttribute("data-bs-theme-mode")) { themeMode = document.documentElement.getAttribute("data-bs-theme-mode"); } else { if ( localStorage.getItem("data-bs-theme") !== null ) { themeMode = localStorage.getItem("data-bs-theme"); } else { themeMode = defaultThemeMode; } } if (themeMode === "system") { themeMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; } document.documentElement.setAttribute("data-bs-theme", themeMode); }
	</script>
	<!--end::Theme mode setup on page load-->
	<!--begin::Root-->
	<div class="d-flex flex-column flex-root" id="kt_app_root">
		<!--begin::Authentication - Sign-up -->
		<div class="d-flex flex-column flex-lg-row flex-column-fluid">
			<!--begin::Body-->
			<div class="d-flex flex-column flex-lg-row-fluid py-10">
				<!--begin::Content-->
				<div class="d-flex flex-center flex-column flex-column-fluid">
					<!--begin::Wrapper-->
					<div class="w-100 p-2 p-lg-15 mx-auto">
						<!--begin::Form-->
						<form class="form w-100" id="kt_sign_up_form" method="POST" action="{{ route('register') }}" id="">
							@csrf
							<!--begin::Heading-->
							<div class="mb-10 text-center">
								<!--begin::Title-->
								<h1 class="text-gray-900 mb-3">Create an Account</h1>
								<!--end::Title-->
								<!--begin::Link-->
								<div class="text-gray-500 fw-semibold fs-4">Already have an account?
									<a href="authentication/sign-in/basic.html" class="link-primary fw-bold">Sign in
										here</a>
								</div>
								<!--end::Link-->
							</div>
							<!--end::Heading-->
							<!--begin::Action-->

							<!--end::Action-->
							<!--begin::Separator-->
							<div class="d-flex align-items-center mb-10">
								<div class="border-bottom border-gray-300 mw-50 w-100"></div>
								<span class="fw-semibold text-gray-500 fs-7 mx-2">OR</span>
								<div class="border-bottom border-gray-300 mw-50 w-100"></div>
							</div>
							<!--end::Separator-->
							<!--begin::Input group-->
							<div class="row fv-row mb-7">
								<!--begin::Col-->
								<div class="col-xl-12">
									<label class="form-label fw-bold text-gray-900 fs-6">Subscription</label>
									<select class="form-select mb-2" data-control="select2"
										data-placeholder="Select a plan" name="subscription_id">
										<option value="">Select subscription</option>
										@foreach ($subscriptions as $key => $s)
                                            <option value="{{$s->id}}">{{$s->plan_name}}</option>
                                        @endforeach
									</select>
								</div>
								<!--end::Col-->
								<!--begin::Col-->

								<!--end::Col-->
							</div>
							<!--end::Input group-->
							<!--begin::Input group-->
							<div class="col-xl-12">
								<label class="form-label fw-bold text-gray-900 fs-6">Are you registered with Companies House?</label>
							</div>
							<div class="mb-7 d-flex">
								<div class="form-check form-check-custom form-check-solid me-5">
									<input class="form-check-input" type="radio" name="is_registered" value="yes"
										id="isRegisteredYes" />
									<label class="form-check-label" for="isRegisteredYes">
										Yes
									</label>
								</div>

								<div class="form-check form-check-custom form-check-solid">
									<input class="form-check-input" type="radio" name="is_registered" value="no"
										id="isRegisteredNo" />
									<label class="form-check-label" for="isRegisteredNo">
										No
									</label>
								</div>
							</div>
							<!--end::Input group-->
							<!--begin::Input group-->
							<select class="companies-house form-select mb-7" disabled data-control="select2" data-placeholder="Search by company name or number" title="Search for your company"></select>
							<!--end::Input group-->
							<!--begin::Input group-->
							<div class="row fv-row mb-7">
								<!--begin::Col-->
								<div class="col-sm-6">
									<label class="form-label fw-bold text-gray-900 fs-6 required">Company Name</label>
									<input class="form-control form-control-lg form-control-solid" type="text"
										placeholder="" name="company_name" id="company_name" />
								</div>
								<!--end::Col-->
								<!--begin::Col-->
								<div class="col-sm-6">
									<label class="form-label fw-bold text-gray-900 fs-6 required">Company Number</label>
									<input class="form-control form-control-lg form-control-solid" type="text"
										placeholder="" name="company_number" id="company_number" />
								</div>
								<!--end::Col-->
							</div>
							<!--end::Input group-->
							<!--begin::Input group-->
							<div class="row fv-row mb-7">
								<!--begin::Col-->
								<div class="col-sm-6">
									<label class="form-label fw-bold text-gray-900 fs-6 required">Address Line 1</label>
									<input class="form-control form-control-lg form-control-solid" type="text"
										placeholder="" name="address_line_1" id="address_line_1" />
								</div>
								<!--end::Col-->
								<!--begin::Col-->
								<div class="col-sm-6">
									<label class="form-label fw-bold text-gray-900 fs-6 required">Address Line 2</label>
									<input class="form-control form-control-lg form-control-solid" type="text"
										placeholder="" name="address_line_2" id="address_line_2" />
								</div>
								<!--end::Col-->
							</div>
							<!--end::Input group-->
							<!--begin::Input group-->
							<div class="row fv-row mb-7">
								<!--begin::Col-->
								<div class="col-sm-6">
									<label class="form-label fw-bold text-gray-900 fs-6 required">Country</label>
									<input class="form-control form-control-lg form-control-solid" type="text"
										placeholder="" name="country" id="country" />
								</div>
								<!--end::Col-->
								<!--begin::Col-->
								<div class="col-sm-6">
									<label class="form-label fw-bold text-gray-900 fs-6 required">Locality</label>
									<input class="form-control form-control-lg form-control-solid" type="text"
										placeholder="" name="locality" id="locality" />
								</div>
								<!--end::Col-->
							</div>
							<!--end::Input group-->
							<!--begin::Input group-->
							<div class="row fv-row mb-7">
								<!--begin::Col-->
								<div class="col-sm-6">
									<label class="form-label fw-bold text-gray-900 fs-6 required">Region</label>
									<input class="form-control form-control-lg form-control-solid" type="text"
										placeholder="" name="region" id="region" />
								</div>
								<!--end::Col-->
								<!--begin::Col-->
								<div class="col-sm-6">
									<label class="form-label fw-bold text-gray-900 fs-6 required">Postal Code</label>
									<input class="form-control form-control-lg form-control-solid" type="text"
										placeholder="" name="postal_code" id="postal_code" />
								</div>
								<!--end::Col-->
							</div>
							<!--end::Input group-->
							<div class="row fv-row mb-7">
								<!--begin::Col-->
								<div class="col-xl-12">
									<label class="form-label fw-bold text-gray-900 fs-6">Full Name</label>
									<input class="form-control form-control-lg form-control-solid" type="text"
										placeholder="" name="name" autocomplete="off" />
								</div>
								<!--end::Col-->
								<!--begin::Col-->

								<!--end::Col-->
							</div>
							<!--end::Input group-->
							<!--begin::Input group-->
							<div class="fv-row mb-7">
								<label class="form-label fw-bold text-gray-900 fs-6">Email</label>
								<input class="form-control form-control-lg form-control-solid" type="email"
									placeholder="" name="email" autocomplete="off" />
							</div>
							<!--end::Input group-->
							<!--begin::Input group-->
							<div class="mb-10 fv-row" data-kt-password-meter="true">
								<!--begin::Wrapper-->
								<div class="mb-1">
									<!--begin::Label-->
									<label class="form-label fw-bold text-gray-900 fs-6">Password</label>
									<!--end::Label-->
									<!--begin::Input wrapper-->
									<div class="position-relative mb-3">
										<input class="form-control form-control-lg form-control-solid" type="password"
											placeholder="" name="password" autocomplete="off" />
										<span
											class="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2"
											data-kt-password-meter-control="visibility">
											<i class="ki-duotone ki-eye-slash fs-2"></i>
											<i class="ki-duotone ki-eye fs-2 d-none"></i>
										</span>
									</div>
									<!--end::Input wrapper-->
									<!--begin::Meter-->
									<div class="d-flex align-items-center mb-3"
										data-kt-password-meter-control="highlight">
										<div class="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2">
										</div>
										<div class="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2">
										</div>
										<div class="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2">
										</div>
										<div class="flex-grow-1 bg-secondary bg-active-success rounded h-5px"></div>
									</div>
									<!--end::Meter-->
								</div>
								<!--end::Wrapper-->
								<!--begin::Hint-->
								<div class="text-muted">Use 8 or more characters with a mix of letters, numbers &
									symbols.</div>
								<!--end::Hint-->
							</div>
							<!--end::Input group=-->
							<!--begin::Input group-->
							<div class="fv-row mb-5">
								<label class="form-label fw-bold text-gray-900 fs-6">Confirm Password</label>
								<input class="form-control form-control-lg form-control-solid" type="password"
									placeholder="" name="password_confirmation" autocomplete="off" />
							</div>
							<!--end::Input group-->
							<!--begin::Input group-->

							<!--end::Input group-->
							<!--begin::Actions-->
							<div class="text-center">
								<button type="submit" id="kt_sign_up_submit" class="btn btn-lg btn-primary">
									<span class="indicator-label">Submit</span>
									<span class="indicator-progress">Please wait...
										<span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
								</button>
							</div>
							<!--end::Actions-->
						</form>
						<!--end::Form-->
					</div>
					<!--end::Wrapper-->
				</div>
				<!--end::Content-->
				<!--begin::Footer-->
				<div class="d-flex flex-center flex-wrap fs-6 p-5 pb-0">
					<!--begin::Links-->
					<div class="d-flex flex-center fw-semibold fs-6">
						<a href="https://keenthemes.com" class="text-muted text-hover-primary px-2"
							target="_blank">About</a>
						<a href="https://devs.keenthemes.com" class="text-muted text-hover-primary px-2"
							target="_blank">Support</a>
						<a href="https://keenthemes.com/products/star-html-pro"
							class="text-muted text-hover-primary px-2" target="_blank">Purchase</a>
					</div>
					<!--end::Links-->
				</div>
				<!--end::Footer-->
			</div>
			<!--end::Body-->
		</div>
		<!--end::Authentication - Sign-up-->
	</div>
	<!--end::Root-->
	<!--begin::Javascript-->
	<script>
		var hostUrl = "assets/";
	</script>
	<!--begin::Global Javascript Bundle(mandatory for all pages)-->
	<script src="assets/plugins/global/plugins.bundle.js"></script>
	<script src="assets/js/scripts.bundle.js"></script>
	<!--end::Global Javascript Bundle-->
	<!--begin::Custom Javascript(used for this page only)-->
	<script src="assets/js/custom/loneworker/sign-up.js"></script>
	<!--end::Custom Javascript-->
	<!--end::Javascript-->
</body>
<!--end::Body-->

</html>