define([
    'jquery',
    'Magento_Ui/js/modal/modal',
    'mage/apply/main',
    'mage/validation',
    'mage/cookies'
], function ($, modal, mageInit) {
    'use strict';

    const WISH_POPUP_COOKIE_KEY = 'wishPopupClosed'; 
    const COOKIE_EXPIRY_DAYS = 7;

    return function (config, element) {
        const ajaxUrl = config.ajaxUrl;

        const setCookie = (name, value, days) => {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + days);
            $.mage.cookies.set(name, value, { expires: expiryDate, path: '/' });
        };

        const isCookieSet = (name) => {
            return $.mage.cookies.get(name) === 'true';
        };

        if (isCookieSet(WISH_POPUP_COOKIE_KEY)) {
            console.log('Popup is already closed. No action taken.');
            return;
        }

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
                    console.log('Modal closed.');
                    setCookie(WISH_POPUP_COOKIE_KEY, 'true', COOKIE_EXPIRY_DAYS);
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
