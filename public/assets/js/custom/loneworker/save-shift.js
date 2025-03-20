"use strict";

// Class definition
var KTAppSaveShift = function () {
    // Private functions
    // Submit form handler
    const handleSubmit = () => {
        // Define variables
        let validator;

        // Get elements
        const form = document.getElementById('kt_ecommerce_add_shift_form');
        const submitButton = document.getElementById('kt_ecommerce_add_shift_submit');

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'name': { validators: { notEmpty: { message: 'Shift name is required' } } },
                    'start_time': { validators: { notEmpty: { message: 'Start Time is required' } } },
                    'end_time': { validators: { notEmpty: { message: 'End Time is required' } } },
                    'days[]': { validators: { notEmpty: { message: 'Day(s) are required' } } },
                    'site_id': { validators: { notEmpty: { message: 'Site is required' } } },
                    'status': { validators: { notEmpty: { message: 'Status is required' } } },
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

                        let form = document.getElementById("kt_ecommerce_add_shift_form");
                        let formData = new FormData(form);

                        $.ajax({
                            type: 'POST',
                            url: form.getAttribute("action"),
                            data: formData,
                            contentType: false,
                            processData: false,
                        })
                            .done((res) => {
                                console.log(res);
                                if (res.status == "success") {
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
                                }
                                else {
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
            $('.form-select').select2();
            handleSubmit(); // Ensure this is called after Select2 init
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    KTAppSaveShift.init();
});
