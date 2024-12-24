define([
    'jquery',
    'Magento_Ui/js/modal/modal',
    'mage/apply/main',
    'mage/validation',
    'Magento_Customer/js/customer-data',
    'domReady!'
], function ($, modal, mageInit) {
    'use strict';

    const WISH_POPUP_COOKIE_KEY = 'wishPopupClosed';

    return function (config, element) {
        const ajaxUrl = config.ajaxUrl;

        function closePopup() {
            customerData.set(WISH_POPUP_COOKIE_KEY, true);
        }

        function initializePopup() {
            $(element).addClass('wish-popup-visible');
        }

        initializePopup();

        $(element).find('#open-wish-modal').on('click', function () {
            if ($('#wish-modal').length === 0) {
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
                closed: function () {
                    closePopup();
                }
            };

            const wishModal = modal(modalOptions, $('#wish-modal'));

            $.ajax({
                url: ajaxUrl,
                type: 'GET',
                success: function (response) {
                    console.log(response, 'response');
                    $('#wish-modal').html(response.html);
                    $('#wish-modal').trigger('contentUpdated');

                    if ($('#wish-form').length > 0) {
                        $('#wish-form').validation();
                    }

                    $('#wish-modal').modal('openModal');
                },
                error: function (error) {
                    console.log(error);
                    alert($.mage.__('Failed to load the form. Please try again.'));
                }
            });
        });
    };
});
