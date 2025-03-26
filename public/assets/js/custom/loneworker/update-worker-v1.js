"use strict";

// Class definition
var KTAppEcommerceSaveCategory = function () {
    var startDatepicker;
    var startFlatpickr;
    var kanbanEl;
    var kanban;
    var isViewMode = document.getElementById('isViewMode').value === 'y';
    let itiInstances = {};

    if (isViewMode) {
        var table = document.getElementById('workerCheckInsTable');
        var datatable;
    }
    // Private functions

    const initDropzone = () => {
        var myDropzone = new Dropzone("#add_worker_documents", {
            url: "/",
            paramName: "file", // The name that will be used to transfer the file
            maxFiles: 10,
            maxFilesize: 10, // MB
            addRemoveLinks: true,
            autoProcessQueue: false,
            acceptedFiles: 'image/*, .pdf, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        // const mockFile = {
        //     name: "Filename 2",
        //     size: 12345,
        //     accepted:true //this is required to set maxFiles count automatically
        // };
        // myDropzone.files.push(mockFile);
        // myDropzone.displayExistingFile(mockFile, "https://i.picsum.photos/id/959/600/600.jpg");
    }

    // Initialize intlTelInput for a given input field
    const initIntlTelInput = (inputId) => {
        const input = document.querySelector(`#${inputId}`);

        if (!input) return;

        const iti = window.intlTelInput(input, {
            initialCountry: "auto",
            geoIpLookup: function (callback) {
                fetch("http://ip-api.com/json", { headers: { 'Accept': 'application/json' } })
                    .then((res) => res.json())
                    .then((data) => callback(data.countryCode))
                    .catch(() => callback("us"));
            },
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
            strictMode: true,
        });

        itiInstances[inputId] = iti; // Store the instance for later use

        // Set initial value if it exists
        if (input.value) {
            iti.setNumber(input.value);
        }

        // Ensure the input is visible
        const itiElement = input.closest(".iti");
        if (itiElement) {
            itiElement.style.display = "block";
        }
    };

    const initDatepickers = (datePickerElement) => {
        flatpickr(datePickerElement, {
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
                    'worker_name': { validators: { notEmpty: { message: 'Worker name is required' } } },
                    'worker_status': { validators: { notEmpty: { message: 'Worker status is required' } } },
                    'phone_no': {
                        validators: {
                            notEmpty: { message: 'Phone Number is required' },
                            numeric: { message: 'The value is not a number'},
                            callback: {
                                message: 'Please enter a valid phone number',
                                callback: function (input) {
                                    return itiInstances['phone_no'].isValidNumber();
                                },
                            },
                        }
                    },
                    'email': {
                        validators: {
                            regexp: {
                                regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'The value is not a valid email address',
                            },
                            notEmpty: {
                                message: 'Email address is required'
                            }
                        }
                    },
                    'department': { validators: { notEmpty: { message: 'Department is required' } } },
                    'role': { validators: { notEmpty: { message: 'Role is required' } } },
                    'check_in_frequency': { validators: { notEmpty: { message: 'Check In Frequency is required' } } },
                    'check_in_visibility': { validators: { notEmpty: { message: 'Check In History Visibility is required' } } },
                    'phone_type': { validators: { notEmpty: { message: 'Phone Type is required' } } },
                    'sia_license_number': { validators: { notEmpty: { message: 'SIA Licence Number is required' } } },
                    'sia_license_expiry_date': { validators: { notEmpty: { message: 'SIA Licence Expiry Date is required' } } },
                    'emergency_contact_1': { 
                        validators: { 
                            notEmpty: { message: 'Primary Emergency Contact is required' },
                            numeric: { message: 'The value is not a number'},
                            callback: {
                                message: 'Please enter a valid phone number',
                                callback: function (input) {
                                    return itiInstances['emergency_contact_1'].isValidNumber();
                                },
                            },
                        }
                    },
                    'emergency_contact_2': { 
                        validators: { 
                            notEmpty: { message: 'Secondary Emergency Contact is required' },
                            numeric: { message: 'The value is not a number'},
                            callback: {
                                message: 'Please enter a valid phone number',
                                callback: function (input) {
                                    return itiInstances['emergency_contact_2'].isValidNumber();
                                },
                            },
                        }
                    },
                    'nok_name': { validators: { notEmpty: { message: 'Name is required' } } },
                    'nok_relation': { validators: { notEmpty: { message: 'Relation is required' } } },
                    'nok_address': { validators: { notEmpty: { message: 'Address is required' } } },
                    'nok_contact': { 
                        validators: { 
                            notEmpty: { message: 'Contact is required' },
                            numeric: { message: 'The value is not a number'},
                            callback: {
                                message: 'Please enter a valid phone number',
                                callback: function (input) {
                                    return itiInstances['nok_contact'].isValidNumber();
                                },
                            },
                        }
                    },
                    'site_id': { validators: { notEmpty: { message: 'Site is required' } } },
                    'shift_id': { validators: { notEmpty: { message: 'Shift is required' } } },
                    'start_date': { validators: { notEmpty: { message: 'Start Date is required' } } },
                    'end_date': { validators: { notEmpty: { message: 'End Date is required' } } },
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

        $('.form-select').on('change', function() {
            validator.validate(); // Revalidate entire form
        });
        
        // Handle submit button
        submitButton.addEventListener('click', e => {
            e.preventDefault();

            // Validate form before submit
            if (validator) {
                validator.validate().then(function (status) {
                    console.log('validated!');

                    if (status == 'Valid') {
                        // submitButton.setAttribute('data-kt-indicator', 'on');

                        // Disable submit button whilst loading
                        // submitButton.disabled = true;

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
                        console.log('itiInstances: ', itiInstances['phone_no'])
                        document.querySelector("#phone_no").value = itiInstances['phone_no'].getNumber();
                        document.querySelector("#nok_contact").value = itiInstances['nok_contact'].getNumber();
                        document.querySelector("#emergency_contact_1").value = itiInstances['emergency_contact_1'].getNumber();
                        document.querySelector("#emergency_contact_2").value = itiInstances['emergency_contact_2'].getNumber();

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
                const shiftStartDatepicker = $(this).find('.shift-start');
                const shiftEndDatepicker = $(this).find('.shift-end');
                populateSites(siteElement);
                populateTimings(startTimeEl);
                populateTimings(endTimeEl);

                // Initialize Select2 for the new select element
                initializeSelect2(siteElement);
                initializeSelect2(shiftElement);
                initializeSelect2(startTimeEl);
                initializeSelect2(endTimeEl);
                initDatepickers(shiftStartDatepicker);
                initDatepickers(shiftEndDatepicker);

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

        const shiftStartDatepicker = repeaterItem.find('.shift-start');

        const shiftEndDatepicker = repeaterItem.find('.shift-end');

        console.log(shiftStartDatepicker, shiftEndDatepicker)
        initDatepickers(shiftStartDatepicker);
        initDatepickers(shiftEndDatepicker);
        shiftEndDatepicker.val(shift.end_date).trigger('change');
        shiftStartDatepicker.val(shift.start_date).trigger('change');
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
                const shiftStartDatepicker = $(firstRepeaterItem).find('.shift-start');
                const shiftEndDatepicker = $(firstRepeaterItem).find('.shift-end');
                siteElement.on('change', function () {
                    // const repeaterItem = $(this).closest('[data-repeater-item]');
                    populateShifts(firstRepeaterItem);
                });
                initializeSelect2(shiftElement);
                initializeSelect2(siteElement);
                initializeSelect2(startTimeEl);
                initializeSelect2(endTimeEl);
                initDatepickers(shiftStartDatepicker);
                initDatepickers(shiftEndDatepicker);
            }

            $(document).on('change', '[data-repeater-item] .site-select', function () {
                const repeaterItem = $(this).closest('[data-repeater-item]');
                populateShifts(repeaterItem);
            });

            // Initialize intlTelInput for phone fields
            initIntlTelInput('phone_no');
            initIntlTelInput('nok_contact');
            initIntlTelInput('emergency_contact_1');
            initIntlTelInput('emergency_contact_2');

            if (!isViewMode) {
                startDatepicker = document.querySelector('#kt_calendar_datepicker_start_date');
                initDropzone();
                initConditionsSelect2();
                initDatepickers(startDatepicker);
                handleStatus();
                handleConditions();
                handleSubmit();
            }
            if (isViewMode) {
                initCheckinsTable();
                initDateRangePicker();
                $('a[data-repeater-delete]').addClass('disabled').attr('href', 'javascript:void(0);');
                // Optionally prevent the click event
                $('a[data-repeater-delete]').click(function (e) {
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
