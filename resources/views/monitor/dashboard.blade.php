@extends('monitor.layout.layout')

@section('content')
<style>
    .border-bottom-1px {
        border-bottom: 1px solid #000;
    }

    .spinner-border {
        vertical-align: middle;
        margin-left: 5px;
    }
</style>
<div class="app-main flex-column flex-row-fluid" id="kt_app_main">
    <!--begin::Content wrapper-->
    <div class="d-flex flex-column flex-column-fluid">
        <!--begin::Toolbar-->
        <div id="kt_app_toolbar" class="app-toolbar pt-3 px-lg-3">
            <!--begin::Toolbar container-->
            <div id="kt_app_toolbar_container" class="app-container container-fluid d-flex flex-stack flex-wrap">
                <!--begin::Toolbar wrapper-->
                <div class="app-toolbar-wrapper d-flex flex-stack flex-wrap gap-4 w-100 justify-content-between">
                    <!--begin::Page title-->
                    <div class="page-title d-flex align-items-center gap-1 me-3">
                        <!--begin::Title-->
                        <h1
                            class="page-heading d-flex flex-column justify-content-center text-gray-900 lh-1 fw-bolder fs-2x my-0 me-5">
                            Dashboard</h1>
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
                            <li class="breadcrumb-item text-gray-700">Default</li>
                            <!--end::Item-->
                        </ul>
                        <!--end::Breadcrumb-->
                    </div>
                    <!--end::Page title-->
                    <button id="refreshButton" type="button" class="btn btn-light">
                        <span id="refreshText">Refresh</span>
                        <span id="refreshSpinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                    </button>
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
                <!-- Worker Cards -->
                <div id="workerCards">
                    @include('monitor.partials.worker_cards', ['workers' => $workers])
                </div>
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

<script>
    // Function to refresh the worker cards
    function refreshWorkerCards() {
        // Show spinner and disable button
        const refreshButton = document.getElementById('refreshButton');
        const refreshText = document.getElementById('refreshText');
        const refreshSpinner = document.getElementById('refreshSpinner');

        refreshText.textContent = 'Refreshing...'; // Change button text
        refreshSpinner.classList.remove('d-none'); // Show spinner
        refreshButton.disabled = true; // Disable button to prevent multiple clicks

        fetch("{{ route('monitor.dashboard') }}")
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const newWorkerCards = doc.getElementById('workerCards').innerHTML;
                document.getElementById('workerCards').innerHTML = newWorkerCards;
            })
            .catch(error => console.error('Error fetching worker cards:', error))
            .finally(() => {
                // Hide spinner and re-enable button
                refreshText.textContent = 'Refresh'; // Reset button text
                refreshSpinner.classList.add('d-none'); // Hide spinner
                refreshButton.disabled = false; // Re-enable button
            });
    }

    // Auto-refresh every 5 minutes
    setInterval(refreshWorkerCards, 5 * 60 * 1000);

    // Manual refresh button
    document.getElementById('refreshButton').addEventListener('click', refreshWorkerCards);
</script>

@endsection