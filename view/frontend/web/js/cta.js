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
        const ajaxUrl = config.ajaxUrl;

        const closePopup = () => {
            customerData.set(WISH_POPUP_STORAGE_KEY, true);
        };

        const initializePopup = () => {
            const isPopupClosed = customerData.get(WISH_POPUP_STORAGE_KEY);

            if (isPopupClosed() === true) return;

            $(element).addClass('wish-popup-visible');
        };

        const handleCloseClick = () => {
            closePopup();
            $(element).hide();
        };

        const handleOpenWishModalClick = () => {
            if (!$('#wish-modal').length) {
                $('body').append('<div id="wish-modal" class="wish-modal" style="display: none;"></div>');
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

            const wishModal = modal(modalOptions, $('#wish-modal'));

            $.ajax({
                url: ajaxUrl,
                type: 'GET',
                success: (response) => {
                    $('#wish-modal').html(response.html);
                    $('#wish-modal').trigger('contentUpdated');

                    if ($('#wish-form').length > 0) {
                        $('#wish-form').validation();
                    }

                    $('#wish-modal').modal('openModal');
                },
                error: () => {
                    alert($.mage.__('Failed to load the form. Please try again.'));
                }
            });
        };

        initializePopup();

        $(element).find('.wish-cta__close').on('click', handleCloseClick);
        $(element).find('#open-wish-modal').on('click', handleOpenWishModalClick);
    };
});
