"use strict";

// Class definition
var KTAppEcommerceSaveCategory = function () {
    var startDatepicker;
    var startFlatpickr;
    var kanbanEl;
    var kanban;
    var isViewMode = document.getElementById('isViewMode').value === 'y';
    if (isViewMode) {
        var table = document.getElementById('workerCheckInsTable');
        var datatable;
    }
    // Private functions

    const initDatepickers = () => {
        startFlatpickr = flatpickr(startDatepicker, {
            enableTime: false,
            dateFormat: "Y-m-d",
        });
    }

    var initCheckinsTable = function (startDate = null, endDate = null) {
        if (startDate && endDate) { console.log(startDate.format('YYYY-MM-DD HH:mm:ss'), endDate.format('YYYY-MM-DD HH:mm:ss')); }
        datatable = $(table).DataTable({
            pageLength: 10,
            processing: true,
            serverSide: true,
            ajax: {
                url: workerViewUrl,
                type: 'GET',
                data: function (d) {
                    // Add date range parameters to the request if they are provided
                    if (startDate && endDate) {
                        d.startDate = startDate.format('YYYY-MM-DD HH:mm:ss');
                        d.endDate = endDate.format('YYYY-MM-DD HH:mm:ss');
                    }
                },
                dataSrc: 'data',
                error: function (xhr, status, error) {
                    console.log("AJAX Error: ", status, error);
                }
            },
            columns: [
                { data: 'date' },
                { data: 'scheduled_time' },
                { data: 'actual_time' },
                { data: 'grace_period_end' },
                { data: 'location' },
                { data: 'status' }
            ]
        });
    };

    var handleSearchDatatable = () => {
        const filterSearch = document.querySelector('[data-kt-user-table-filter="search"]');
        filterSearch.addEventListener('keyup', function (e) {
            datatable.search(e.target.value).draw();
        });
    }

    // DATE RANGE PICKER FOR CHECKIN FILTERING
    var initDateRangePicker = () => {
        var start = moment().subtract(29, "days");
        var end = moment();

        function cb(start, end) {
            $("#kt_daterangepicker_2").html(start.format("MMMM D, YYYY") + " - " + end.format("MMMM D, YYYY"));

            // Destroy the existing DataTable (if it exists) and reinitialize it with the new date range
            if (datatable) {
                datatable.destroy();
            }
            initCheckinsTable(start, end); // Pass the selected date range to initCheckinsTable
        }

        $("#kt_daterangepicker_2").daterangepicker({
            startDate: start,
            endDate: end,
            ranges: {
                "Today": [moment(), moment()],
                "Yesterday": [moment().subtract(1, "days"), moment().subtract(1, "days")],
                "Last 7 Days": [moment().subtract(6, "days"), moment()],
                "Last 30 Days": [moment().subtract(29, "days"), moment()],
                "This Month": [moment().startOf("month"), moment().endOf("month")],
                "Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")]
            }
        }, cb);

        cb(start, end); // Initialize with the default date range
    };

    // Init condition select2
    const initConditionsSelect2 = () => {
        // Tnit new repeating condition types
        const allConditionTypes = document.querySelectorAll('[data-kt-ecommerce-catalog-add-category="condition_type"]');
        allConditionTypes.forEach(type => {
            if ($(type).hasClass("select2-hidden-accessible")) {
                return;
            } else {
                $(type).select2({
                    minimumResultsForSearch: -1
                });
            }
        });

        // Tnit new repeating condition equals
        const allConditionEquals = document.querySelectorAll('[data-kt-ecommerce-catalog-add-category="condition_equals"]');
        allConditionEquals.forEach(equal => {
            if ($(equal).hasClass("select2-hidden-accessible")) {
                return;
            } else {
                $(equal).select2({
                    minimumResultsForSearch: -1
                });
            }
        });
    }

    // Category status handler
    const handleStatus = () => {
        const target = document.getElementById('kt_ecommerce_add_category_status');
        const select = document.getElementById('kt_ecommerce_add_category_status_select');
        const statusClasses = ['bg-success', 'bg-warning', 'bg-danger'];

        $(select).on('change', function (e) {
            const value = e.target.value;

            switch (value) {
                case "active": {
                    target.classList.remove(...statusClasses);
                    target.classList.add('bg-success');
                    hideDatepicker();
                    break;
                }
                case "scheduled": {
                    target.classList.remove(...statusClasses);
                    target.classList.add('bg-warning');
                    showDatepicker();
                    break;
                }
                case "inactive": {
                    target.classList.remove(...statusClasses);
                    target.classList.add('bg-danger');
                    hideDatepicker();
                    break;
                }
                default:
                    break;
            }
        });


        // Handle datepicker
        const datepicker = document.getElementById('kt_ecommerce_add_category_status_datepicker');

        // Init flatpickr --- more info: https://flatpickr.js.org/
        $('#kt_ecommerce_add_category_status_datepicker').flatpickr({
            enableTime: true,
            dateFormat: "Y-m-d H:i",
        });

        const showDatepicker = () => {
            datepicker.parentNode.classList.remove('d-none');
        }

        const hideDatepicker = () => {
            datepicker.parentNode.classList.add('d-none');
        }
    }

    // Condition type handler
    const handleConditions = () => {
        const allConditions = document.querySelectorAll('[name="method"][type="radio"]');
        const conditionMatch = document.querySelector('[data-kt-ecommerce-catalog-add-category="auto-options"]');
        allConditions.forEach(radio => {
            radio.addEventListener('change', e => {
                if (e.target.value === '1') {
                    conditionMatch.classList.remove('d-none');
                } else {
                    conditionMatch.classList.add('d-none');
                }
            });
        })
    }

    // Submit form handler
    const handleSubmit = () => {
        // Define variables
        let validator;

        // Get elements
        const form = document.getElementById('kt_ecommerce_add_form');
        const submitButton = document.getElementById('kt_ecommerce_add_submit');

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'worker_name': {
                        validators: {
                            notEmpty: {
                                message: 'Worker name is required'
                            }
                        }
                    }
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                        eleInvalidClass: '',
                        eleValidClass: ''
                    })
                }
            }
        );

        // Handle submit button
        submitButton.addEventListener('click', e => {
            e.preventDefault();

            // Validate form before submit
            if (validator) {
                validator.validate().then(function (status) {
                    console.log('validated!');

                    if (status == 'Valid') {
                        submitButton.setAttribute('data-kt-indicator', 'on');

                        // Disable submit button whilst loading
                        submitButton.disabled = true;

                        const assignedMonitors = [];
                        const unassignedMonitors = [];

                        // Get assigned monitors
                        const assignedBoard = kanban.getBoardElements('_assigned_monitors');
                        assignedBoard.forEach(item => {
                            assignedMonitors.push(item.getAttribute('data-eid'));
                        });

                        // Get unassigned monitors
                        const unassignedBoard = kanban.getBoardElements('_unassigned_monitors');
                        unassignedBoard.forEach(item => {
                            unassignedMonitors.push(item.getAttribute('data-eid'));
                        });

                        let form = document.getElementById("kt_ecommerce_add_form");
                        let formData = new FormData(form);

                        // Add serialized data to formData
                        formData.append('assignedMonitors', JSON.stringify(assignedMonitors));
                        formData.append('unassignedMonitors', JSON.stringify(unassignedMonitors));

                        console.log(JSON.stringify(assignedMonitors), JSON.stringify(unassignedMonitors))
                        const dropzoneElement = document.querySelector('#add_worker_documents');
                        if (dropzoneElement.dropzone) {
                            const files = dropzoneElement.dropzone.files;
                            files.forEach((file) => {
                                formData.append('worker_documents[]', file, file.name);
                            });
                        }

                        $.ajax({
                            type: 'POST',
                            url: form.getAttribute("action"),
                            data: formData,
                            contentType: false,
                            processData: false,
                        })
                            .done((data) => {
                                console.log(data);
                                let res = JSON.parse(data);
                                if (res.status == "duplicate") {

                                    Swal.fire({
                                        html:
                                            "Sorry, this email / phone number already exists in the database.",
                                        icon: "error",
                                        buttonsStyling: !1,
                                        confirmButtonText: "Ok, got it!",
                                        customClass: { confirmButton: "btn btn-primary" },
                                    });

                                    submitButton.setAttribute('data-kt-indicator', 'off');
                                    submitButton.disabled = false;

                                }
                                else if (res.status == "success") {

                                    setTimeout(function () {
                                        submitButton.removeAttribute('data-kt-indicator');

                                        Swal.fire({
                                            text: "Details have been successfully submitted!",
                                            icon: "success",
                                            buttonsStyling: false,
                                            confirmButtonText: "Ok, got it!",
                                            customClass: {
                                                confirmButton: "btn btn-primary"
                                            }
                                        }).then(function (result) {
                                            if (result.isConfirmed) {
                                                // Enable submit button after loading
                                                submitButton.disabled = false;

                                                // Redirect to customers list page
                                                window.location = form.getAttribute("data-kt-redirect");
                                            }
                                        });
                                    }, 2000);

                                }
                                else {

                                }

                            })

                    } else {
                        Swal.fire({
                            text: "Sorry, looks like there are some errors detected, please try again.",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    }
                });
            }
        })
    }

    // Private functions
    var initKanban = function () {
        kanban = new jKanban({
            element: '#kt_docs_jkanban_restricted',
            gutter: '0',
            widthBoard: '250px',
            dragItems: isViewMode ? false : true,
            boards: [
                {
                    'id': '_assigned_monitors',
                    'title': 'Current Monitors',
                    'dragTo': ['_unassigned_monitors'],
                    'item': assignedMonitors.map(function (monitor) {
                        return {
                            'id': monitor.id,
                            'title': monitor.username,
                            'class': 'kanban-item', // Add custom class if needed
                            'drag': true, // Ensure drag is enabled
                            'data-id': monitor.id // Important for identifying the item uniquely
                        }
                    })
                },
                {
                    'id': '_unassigned_monitors',
                    'title': 'Available Monitors',
                    'dragTo': ['_assigned_monitors'],
                    'item': unassignedMonitors.map(function (monitor) {
                        return {
                            'id': monitor.id,
                            'title': monitor.username,
                            'class': 'kanban-item', // Add custom class if needed
                            'drag': true, // Ensure drag is enabled
                            'data-id': monitor.id // Important for identifying the item uniquely
                        }
                    })
                }
            ]
        });

        // Set jKanban max height
        const allItems = kanbanEl.querySelectorAll('.kanban-item');
        allItems.forEach(item => {
            item.style.padding = '8px';
        });
    }

    const initFormRepeater = () => {
        $('#shifts_site_repeater').repeater({
            initEmpty: false,
            defaultValues: {
                'text-input': 'foo'
            },
            show: function () {
                $(this).slideDown();

                const siteElement = $(this).find('.site-select');
                const shiftElement = $(this).find('.shift-select');
                const startTimeEl = $(this).find('.custom-start-time');
                const endTimeEl = $(this).find('.custom-end-time');
                populateSites(siteElement);
                populateTimings(startTimeEl);
                populateTimings(endTimeEl);

                // Initialize Select2 for the new select element
                initializeSelect2(siteElement);
                initializeSelect2(shiftElement);
                initializeSelect2(startTimeEl);
                initializeSelect2(endTimeEl);

                // Attach event listeners for the new repeater item
                const repeaterItem = $(this);
                repeaterItem.find('.site-select').on('change', function () {
                    populateShifts(repeaterItem);
                });
            },
            hide: function (deleteElement) {
                $(this).slideUp(deleteElement);
            }
        });

        const workerId = document.getElementById('workerId').value;
        if (workerId) {
            const url = `/monitor/worker/shifts/${workerId}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log('Worker data fetched:', data);
                    populateRepeater(data.shifts); // Call a function to populate the repeater
                })
                .catch(error => {
                    console.error('Error fetching worker data:', error);
                });
        }
    };

    const populateRepeater = async (shifts) => {
        // Clear existing repeater items (if any)
        $('#shifts_site_repeater').find('[data-repeater-item]').remove();
    
        // Loop through the shifts and add repeater items
        for (const shift of shifts) {
            // Add a new repeater item
            $('[data-repeater-create]').click();
    
            // Get the newly added repeater item
            const newRepeaterItem = $('#shifts_site_repeater').find('[data-repeater-item]').last();
    
            // Populate the fields in the new repeater item
            await populateRepeaterItem(newRepeaterItem, shift);
        }
    };

    const populateRepeaterItem = async (repeaterItem, shift) => {
        // Populate site select
        const siteElement = repeaterItem.find('.site-select');
        siteElement.val(shift.site_id).trigger('change');
    
        // Wait for the shifts dropdown to be populated
        await populateShifts(repeaterItem);
    
        // Populate shift select
        const shiftElement = repeaterItem.find('.shift-select');
        shiftElement.val(shift.shift_id).trigger('change');
    
        // Populate start time
        const startTimeEl = repeaterItem.find('.custom-start-time');
        startTimeEl.val(shift.custom_start_time).trigger('change');
    
        // Populate end time
        const endTimeEl = repeaterItem.find('.custom-end-time');
        endTimeEl.val(shift.custom_end_time).trigger('change');
    
        // Initialize Select2 for the new repeater item
        initializeSelect2(siteElement);
        initializeSelect2(shiftElement);
        initializeSelect2(startTimeEl);
        initializeSelect2(endTimeEl);
    };

    const populateShifts = (repeaterItem) => {
        return new Promise((resolve, reject) => {
            const selectedSite = repeaterItem.find('.site-select option:selected').val();
            const shiftElement = repeaterItem.find('.shift-select');
    
            if (selectedSite) {
                // Construct the URL with the site ID
                const url = `/monitor/shifts/site/${selectedSite}`;
    
                // Fetch API call
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok: ' + response.statusText);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.shifts && data.shifts.length > 0) {
                            // Clear existing options
                            $(shiftElement).empty();
    
                            // Add default option
                            $(shiftElement).append($('<option>', {
                                value: '',
                                text: 'Select Shift',
                                selected: true
                            }));
    
                            // Add shift options
                            data.shifts.forEach(shift => {
                                $(shiftElement).append($('<option>', {
                                    value: shift.id,
                                    text: `${shift.name} (${shift.default_start_time} - ${shift.default_end_time})`
                                }));
                            });
    
                            // Initialize Select2
                            $(shiftElement).select2();
                            resolve(); // Resolve the promise after shifts are populated
                        } else {
                            console.log('No shifts found for the given site.');
                            resolve(); // Resolve even if no shifts are found
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        reject(error); // Reject the promise on error
                    });
            } else {
                // Clear existing options
                $(shiftElement).empty();
                $(shiftElement).append($('<option>', {
                    value: '',
                    text: 'Select Shift',
                    selected: true
                }));
                resolve(); // Resolve the promise if no site is selected
            }
        });
    };

    // Function to populate product options in a select element
    const populateSites = (selectElement) => {
        // Clear existing options
        $(selectElement).empty();

        $(selectElement).append($('<option>', {
            value: '',
            text: 'Select Site',
            selected: true
        }));

        // Loop through the sites data
        Object.entries(sites).forEach(([customerId, customerSites]) => {
            // Create an optgroup element
            var optgroup = $('<optgroup>', {
                label: customerSites[0].customer_name // Set the optgroup label
            });

            // Loop through the sites under this customer
            customerSites.forEach(site => {
                // Create an option element
                var option = $('<option>', {
                    value: site.id, // Set the option value
                    text: site.site_name // Set the option text
                });

                // Append the option to the optgroup
                optgroup.append(option);
            });

            // Append the optgroup to the select element
            $(selectElement).append(optgroup);
        });
    };

    // Function to populate product options in a select element
    const populateTimings = (selectElement) => {
        // Clear existing options
        $(selectElement).empty();

        // Add default option
        $(selectElement).append($('<option>', {
            value: '',
            text: 'Select timing'
        }));

        // Add product options
        timings.forEach(timing => {
            $(selectElement).append($('<option>', {
                value: timing.time,
                text: timing.time,
            }));
        });
    };

    var initializeSelect2 = (selectElement) => {
        if (!$(selectElement).hasClass("select2-hidden-accessible")) {
            $(selectElement).select2({
                placeholder: "Select an option",
                allowClear: true
            });
        }
    };

    // Public methods
    return {
        init: function () {
            initFormRepeater();
            // Manually initialize select 2 for first additional order repeater item 
            const firstRepeaterItem = $('#shifts_site_repeater').find('[data-repeater-item]').first();
            if (firstRepeaterItem.length) {
                const shiftElement = $(firstRepeaterItem).find('.shift-select');
                const siteElement = $(firstRepeaterItem).find('.site-select');
                const startTimeEl = $(firstRepeaterItem).find('.custom-start-time');
                const endTimeEl = $(firstRepeaterItem).find('.custom-end-time');
                siteElement.on('change', function () {
                    // const repeaterItem = $(this).closest('[data-repeater-item]');
                    populateShifts(firstRepeaterItem);
                });
                initializeSelect2(shiftElement);
                initializeSelect2(siteElement);
                initializeSelect2(startTimeEl);
                initializeSelect2(endTimeEl);
            }

            $(document).on('change', '[data-repeater-item] .site-select', function () {
                const repeaterItem = $(this).closest('[data-repeater-item]');
                populateShifts(repeaterItem);
            });

            if (!isViewMode) {
                startDatepicker = document.querySelector('#kt_calendar_datepicker_start_date');
                initConditionsSelect2();
                initDatepickers();
                handleStatus();
                handleConditions();
                handleSubmit();
            }
            if (isViewMode) {
                initCheckinsTable();
                initDateRangePicker();
                $('a[data-repeater-delete]').addClass('disabled').attr('href', 'javascript:void(0);');
                // Optionally prevent the click event
                $('a[data-repeater-delete]').click(function(e) {
                    e.preventDefault();
                });
            }
            kanbanEl = document.querySelector('#kt_docs_jkanban_restricted');
            initKanban();
            // handleSearchDatatable();
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    KTAppEcommerceSaveCategory.init();
});
