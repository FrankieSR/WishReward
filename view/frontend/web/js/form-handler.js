define(['jquery', 'mage/translate', 'Doroshko_WishReward/js/lotteryWheelWidget', 'mage/validation'], function ($, $t) {
    'use strict';

    return function (config, element) {
        const HIDE_ERROR_DURATION = 4000;
        const ROTATION_DURATION = 5000;
        const WHEEL_RADIUS = 210;

        const form = $(element).find('form');
        const wheelBox = $('#wish-wheel-box');
        const couponCodeBlock = $('#wish-coupon-code');
        const nocouponCodeBlock = $('#wish-nocoupon-code');
        const couponContainer = $('#wish-coupon-container');
        const mainContainer = $('.wish-content-container');

        initializeUI();

        form.on('submit', handleFormSubmit);

        function initializeUI() {
            couponContainer.hide();

            displayWheel();
        }

        function handleFormSubmit(event) {
            event.preventDefault();

            if (!form.valid()) {
                return;
            }

            const formData = form.serialize();

            $.ajax({
                url: config.ajaxUrl,
                type: 'POST',
                data: formData,
                success: handleFormSubmitSuccess,
                error: handleAjaxError,
            });
        }

        function handleFormSubmitSuccess(response) {
            console.log(response);
            if (response.success === false) {
                $(form).find('textarea').addClass('mage-error');
                $(form).find('textarea').after(`<div class="mage-error message">${$t("This is not a Christmas greeting")}</div>`);

                setTimeout(() => {
                    $(form).find('.mage-error.message').remove();
                    $(form).find('textarea').removeClass('mage-error');
                }, HIDE_ERROR_DURATION);

                return;
            } else {
                $(form).find('input').removeClass('mage-error');
                $(form).find('mage-error').remove();
            }

            if (config.showWheel && response.canSpinWheel) {
                handleSpinButtonClick();
            } else if (response.coupon_code) {
                displayCoupon(response.coupon_code);
            } else {
                alert('Unexpected response from the server.');
            }
        }

        function displayWheel() {
            initializeWheel();
            couponContainer.hide();
        }

        function initializeWheel() {
            wheelBox.lotteryWheel({
                items: config.wheelSectors,
                rotationDuration: config.rotationDuration || ROTATION_DURATION,
                wheelRadius: config.wheelRadius || WHEEL_RADIUS
            });
        }

        function handleSpinButtonClick() {
            $.ajax({
                url: config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'spin'
                },
                success: handleSpinSuccess,
                error: handleAjaxError,
            });
        }

        function handleSpinSuccess({coupon_code, message, success, sector_id = null, error = null}) {
            console.log(coupon_code, message, success, sector_id, 'spinResponse');
            if (error) {
                alert(message || 'An error occurred while spinning the wheel.');
                return;
            }

            const winningSectorId = sector_id;
            const coupon = coupon_code;

            wheelBox.lotteryWheel('spinToItem', winningSectorId, {
                coupon,
            }, (result) => {
                if (!result.data.coupon) {
                    displayNoCoupon()
                }

                displayCoupon(result.data.coupon, result.label);
            },);
        }

        function displayCoupon(couponCodeValue) {
            console.log(couponCodeValue);
            couponCodeBlock.text(couponCodeValue);
            mainContainer.hide();
            couponContainer.show();
        }

        function displayNoCoupon() {
            mainContainer.hide();
            nocouponCodeBlock.show();
        }

        function handleAjaxError(error) {
            console.error('AJAX error:', error);
        }
    };
});
