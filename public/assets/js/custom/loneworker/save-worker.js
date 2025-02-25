"use strict";

// Class definition
var KTAppEcommerceSaveCategory = function () {
    var startDatepicker;
    var startFlatpickr;
    var kanbanEl;
    var kanban;
    // Private functions

    // Init quill editor
    const initQuill = () => {
        // Define all elements for quill editor
        const elements = [
            '#plan_description'
        ];

        // Loop all elements
        elements.forEach(element => {
            // Get quill element
            let quill = document.querySelector(element);

            // Break if element not found
            if (!quill) {
                return;
            }

            // Init quill --- more info: https://quilljs.com/docs/quickstart/
            quill = new Quill(element, {
                modules: {
                    toolbar: [
                        [{
                            header: [1, 2, false]
                        }],
                        ['bold', 'italic', 'underline'],
                        ['image', 'code-block']
                    ]
                },
                placeholder: 'Type your text here...',
                theme: 'snow' // or 'bubble'
            });
        });

    }

    // Init DropzoneJS --- more info:
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
    }

    const initDatepickers = () => {
        startFlatpickr = flatpickr(startDatepicker, {
            enableTime: false,
            dateFormat: "Y-m-d",
        });
    }

    // Init tagify
    const initTagify = () => {
        // Define all elements for tagify
        const elements = [
            '#kt_ecommerce_add_category_meta_keywords'
        ];

        // Loop all elements
        elements.forEach(element => {
            // Get tagify element
            const tagify = document.querySelector(element);

            // Break if element not found
            if (!tagify) {
                return;
            }

            // Init tagify --- more info: https://yaireo.github.io/tagify/
            new Tagify(tagify);
        });
    }

    // Init form repeater --- more info: https://github.com/DubFriend/jquery.repeater
    const initFormRepeater = () => {
        $('#kt_ecommerce_add_category_conditions').repeater({
            initEmpty: false,

            defaultValues: {
                'text-input': 'foo'
            },

            show: function () {
                $(this).slideDown();

                // Init select2 on new repeated items
                initConditionsSelect2();
            },

            hide: function (deleteElement) {
                $(this).slideUp(deleteElement);
            }
        });

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
                    console.log('site selected')
                    populateShifts(repeaterItem);
                });
            },

            hide: function (deleteElement) {
                $(this).slideUp(deleteElement);
            }
        });
    }

    // Function to populate shifts
    const populateShifts = (repeaterItem) => {
        const selectedSite = repeaterItem.find('.site-select option:selected').val();
        const shiftElement = repeaterItem.find('.shift-select');

        if (selectedSite) {
            // Construct the URL with the site ID
            const url = `/monitor/shifts/site/${selectedSite}`;

            // Fetch API call
            fetch(url)
                .then(response => {
                    // Check if the response is successful
                    if (!response.ok) {
                        // Handle non-successful responses
                        throw new Error('Network response was not ok: ' + response.statusText);
                    }
                    return response.json();  // Convert response to JSON
                })
                .then(data => {
                    // Handle the data received from the server
                    console.log('Success:', data);
                    if (data.shifts && data.shifts.length > 0) {
                        // Process the shifts data
                        const shifts= data.shifts;
                        // Clear existing options
                        $(shiftElement).empty();

                        // Add default option
                        $(shiftElement).append($('<option>', {
                            value: '',
                            text: 'Select Shift',
                            selected: true
                        }));

                        // Add product options
                        shifts.forEach(shift => {
                            $(shiftElement).append($('<option>', {
                                value: shift.id,
                                text: `${shift.name} (${shift.default_start_time} - ${shift.default_end_time})`,
                                selected: false,

                            }));
                        });

                        $(shiftElement).select2(); 

                    } else {
                        console.log('No shifts found for the given site.');
                    }
                })
                .catch(error => {
                    // Handle any errors that occurred during the fetch
                    console.error('Error:', error);
                });
        } 
        else {
            // Clear existing options
            $(shiftElement).empty();
            // Add default option
            $(shiftElement).append($('<option>', {
                value: '',
                text: 'Select Shift',
                selected: true
            }));
        }

        // const productPrice = parseFloat(selectedProduct.data('price'));
        // const numberOfTablets = parseFloat(selectedProduct.data('number-of-tablets'));

        // if (productPrice && numberOfTablets) {
        //     const pricePu = productPrice / numberOfTablets;
        //     pricePuInput.val(pricePu.toFixed(2));

        //     const quantity = parseFloat(quantityInput.val()) || 0;
        //     const itemTotalPrice = pricePu * quantity;
        //     itemTotalPriceInput.val(itemTotalPrice.toFixed(2));
        // } else {
        //     pricePuInput.val('');
        //     itemTotalPriceInput.val('');
        // }
    };

    var initializeSelect2 = (selectElement) => {
        if (!$(selectElement).hasClass("select2-hidden-accessible")) {
            $(selectElement).select2({
                placeholder: "Select an option",
                allowClear: true
            });
        }
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

                        // Get assigned monitors
                        const assignedBoard = kanban.getBoardElements('_assigned_monitors');
                        assignedBoard.forEach(item => {
                            assignedMonitors.push(item.getAttribute('data-eid'));
                        });

                        // const startDate = moment(startFlatpickr.selectedDates[0]).format('YYYY-MM-DD');
                        let form = document.getElementById("kt_ecommerce_add_form");
                        let formData = new FormData(form);

                        for (let [key, value] of formData.entries()) {
                            console.log(key, value);
                        }

                        // Add serialized data to formData
                        formData.append('assignedMonitors', JSON.stringify(assignedMonitors));

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
                                console.log(res.message);
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

    var initKanban = function () {
        kanban = new jKanban({
            element: '#kt_docs_jkanban_restricted',
            gutter: '0',
            widthBoard: '250px',
            click: function (el) {
                alert(el.innerHTML);
            },
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

    // Public methods
    return {
        init: function () {
            startDatepicker = document.querySelector('#kt_calendar_datepicker_start_date');

            // Attach event listeners to existing repeater items
            // $(document).on('change', '[data-repeater-item] .site-select', function () {
            //     const repeaterItem = $(this).closest('[data-repeater-item]');
            //     populateShifts(repeaterItem);
            // });
            // Init forms
            initQuill();
            initTagify();
            initFormRepeater();
            initConditionsSelect2();
            initDropzone();
            initDatepickers();
            kanbanEl = document.querySelector('#kt_docs_jkanban_restricted');
            initKanban();

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
            // Handle forms
            handleStatus();
            handleConditions();
            handleSubmit();
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    KTAppEcommerceSaveCategory.init();
});
