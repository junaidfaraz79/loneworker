"use strict";

// Class definition
var KTAppEcommerceCategories = function () {
    // Shared variables
    var table;
    var datatable;

    // Private functions
    var initDatatable = function () {
        // Init datatable --- more info on datatables: https://datatables.net/manual/
        datatable = $(table).DataTable({
            "info": false,
            'order': [],
            'pageLength': 10,
            'columnDefs': [
                { orderable: false, targets: 0 }, // Disable ordering on column 0 (checkbox)
                { orderable: false, targets: 3 }, // Disable ordering on column 3 (actions)
            ]
        });

        // Re-init functions on datatable re-draws
        datatable.on('draw', function () {
            handleDeleteRows();
        });
    }

    // Search Datatable --- official docs reference: https://datatables.net/reference/api/search()
    var handleSearchDatatable = () => {
        const filterSearch = document.querySelector('[data-kt-ecommerce-category-filter="search"]');
        filterSearch.addEventListener('keyup', function (e) {
            datatable.search(e.target.value).draw();
        });
    }

    // Delete cateogry
    var handleDeleteRows = () => {
        const deleteButtons = document.querySelectorAll('[data-kt-users-table-filter="delete_row"]');
        console.log(deleteButtons)
    
        deleteButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                console.log('deletingggg')
                e.preventDefault();
                console.log(this.dataset.workerId)
                const workerId = this.dataset.workerId;
                console.log(this.closest('tr'))
                const workerName = this.closest('tr').querySelector('[data-kt-ecommerce-category-filter="worker_name"]').innerText;
    
                Swal.fire({
                    text: "Are you sure you want to delete " + workerName + "?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete!",
                    cancelButtonText: "No, cancel",
                    reverseButtons: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        fetch(`/monitor/worker/delete/${workerId}`, {
                            method: 'GET', // or 'POST'
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'success') {
                                Swal.fire("Deleted!", `You have deleted ${workerName}.`, "success");
                                // Remove the row visually
                                button.closest('tr').remove();
                            } else {
                                Swal.fire("Error!", "There was an issue deleting the worker.", "error");
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            Swal.fire("Error!", "Network error or server is unreachable.", "error");
                        });
                    }
                });
            });
        });
    };
    


    // Public methods
    return {
        init: function () {
            table = document.querySelector('#kt_table_users');

            if (!table) {
                return;
            }

            initDatatable();
            // handleSearchDatatable();
            handleDeleteRows();
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    KTAppEcommerceCategories.init();
});
