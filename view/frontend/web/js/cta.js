define([
    'jquery',
    'Magento_Ui/js/modal/modal',
    'Magento_Customer/js/customer-data',
    'underscore',
    'mage/validation',
    'domReady!'
], function ($, modal, customerData, _) {
    'use strict';

    const WISH_POPUP_STORAGE_KEY = 'wishPopupClosed';

    return (config, element) => {
        const { ajaxUrl, errorMessage } = config;

        /**
         * Closes the popup and stores its state in customerData
         */
        const closePopup = () => {
            customerData.set(WISH_POPUP_STORAGE_KEY, true);
            $(element).hide();
        };

        /**
         * Initializes the popup by checking its state in customerData
         */
        const initializePopup = () => {
            const isPopupClosed = customerData.get(WISH_POPUP_STORAGE_KEY);

            if (isPopupClosed() === true) {
                return;
            }

            $(element).addClass('wish-popup-visible');
        };

        /**
         * Opens the "Wish" modal with a form
         */
        const openWishModal = () => {
            const modalContainerId = 'wish-modal';
            let $wishModal = $(`#${modalContainerId}`);

            if (!$wishModal.length) {
                $wishModal = $('<div>', {
                    id: modalContainerId,
                    class: 'wish-modal',
                    style: 'display: none;'
                }).appendTo('body');
            }

            $(element).hide();

            const modalOptions = {
                type: 'popup',
                title: null,
                modalClass: 'wish-form-modal',
                responsive: true,
                outerClickHandler: false,
                innerScroll: true,
                responsiveClass: false,
                buttons: false,
                closed: closePopup
            };

            modal(modalOptions, $wishModal);

            loadWishForm($wishModal);
        };

        /**
         * Loads the wish form into the modal via AJAX
         * @param {jQuery} $wishModal - the modal container
         */
        const loadWishForm = ($wishModal) => {
            $.ajax({
                url: ajaxUrl,
                type: 'GET',
                success: (response) => {
                    $wishModal.html(response.html);
                    $wishModal.trigger('contentUpdated');

                    const $wishForm = $('#wish-form');

                    if ($wishForm.length > 0) {
                        $wishForm.validation();
                    }

                    $wishModal.modal('openModal');
                },
                error: () => {
                    alert(errorMessage || $.mage.__('Failed to load the form. Please try again.'));
                }
            });
        };

        /**
         * Handles the popup close button click event
         */
        const handleCloseClick = () => {
            closePopup();
        };

        /**
         * Handles the "Open Wish Modal" button click event
         */
        const handleOpenWishModalClick = () => {
            openWishModal();
        };

        // Initialize the popup when the page loads
        initializePopup();

        $(element).find('.wish-cta__close').on('click', handleCloseClick);
        $(element).find('#open-wish-modal').on('click', handleOpenWishModalClick);
    };
});
