"use strict";

// Class definition
var KTAppEcommerceSaveCategory = function () {
    let itiInstances = {};

    // Private functions
    const initIntlTelInput = (inputId) => {
        const input = document.querySelector(`#${inputId}`);

        if (!input) return;

        const iti = intlTelInput(input, {
            initialCountry: "auto",
            geoIpLookup: function (callback) {
                fetch("http://ip-api.com/json", { headers: { 'Accept': 'application/json' } })
                    .then((res) => res.json())
                    .then((data) => callback(data.countryCode))
                    .catch(() => callback("us"));
            },
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
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
    }

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
                    'site_name': { validators: { notEmpty: { message: 'Site name is required' } } },
                    'country': { validators: { notEmpty: { message: 'Country is required' } } },
                    'site_address_1': { validators: { notEmpty: { message: 'Address Line 1 is required' } } },
                    'site_address_2': { validators: { notEmpty: { message: 'Address Line 2 is required' } } },
                    'suburb_town_city': { validators: { notEmpty: { message: 'Suburb/ Town/ City is required' } } },
                    'postal_code': { validators: { notEmpty: { message: 'Postal Code/ ZIP Code is required' } } },
                    'longitude': { validators: { notEmpty: { message: 'Longitude is required' } } },
                    'latitude': { validators: { notEmpty: { message: 'Latitude is required' } } },
                    'week_start': { validators: { notEmpty: { message: 'Week Start is required' } } },
                    'customer_id': { validators: { notEmpty: { message: 'Customer is required' } } },
                    'site_manager_name': { validators: { notEmpty: { message: 'Site Manager Name is required' } } },
                    'site_manager_contact': {
                        validators: {
                            notEmpty: { message: 'Site Manager Contact is required' },
                            callback: {
                                message: 'Please enter a valid phone number',
                                callback: function (input) {
                                    return itiInstances['site_manager_contact'].isValidNumber();
                                },
                            },
                        }
                    },
                    'national_emergency_number': { validators: { notEmpty: { message: 'National Emergency Number is required' } } },
                    'local_police_contact': { validators: { notEmpty: { message: 'Local Police Contact is required' } } },
                    'local_firebrigade_contact': { validators: { notEmpty: { message: 'Local Fire Brigade Contact is required' } } },
                    'local_hospital_contact': { validators: { notEmpty: { message: 'Local Hospital/Medical Contact is required' } } },
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
                        document.querySelector("#site_manager_contact").value = itiInstances['site_manager_contact'].getNumber();

                        // Disable submit button whilst loading
                        submitButton.disabled = true;

                        let form = document.getElementById("kt_ecommerce_add_form");
                        let formData = new FormData(form);

                        $.ajax({
                            type: 'POST',
                            url: form.getAttribute("action"),
                            data: formData,
                            contentType: false,
                            processData:false,                 
                          })
                            .done((data) => {
                                console.log(data);
                                let res = JSON.parse(data);        
                                if(res.status == "duplicate") {

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
                                else if(res.status == "success") {

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

    // Public methods
    return {
        init: function () {
            // Init forms
            // initQuill();
            // initTagify();
            // initFormRepeater();
            initConditionsSelect2();
            initIntlTelInput('site_manager_contact');

            // Handle forms
            handleStatus();
            // handleConditions();
            handleSubmit();
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    KTAppEcommerceSaveCategory.init();
});
