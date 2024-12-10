define(['jquery', 'Doroshko_WishReward/js/lotteryWheel'], function ($) {
    'use strict';

    return function (config, element) {
        const form = $(element);
        const wheelContainer = $('#wish-wheel-container');
        const wheelBox = $('#wish-wheel-box');
        const couponCode = $('#wish-coupon-code');
        const couponContainer = $('#wish-coupon-container');

        const spinButton = $('<button type="button" id="spin-button" class="action primary spin-button">')
            .text('Spin the Wheel')
            .hide()
            .appendTo(wheelContainer);

        initializeUI();

        form.on('submit', handleFormSubmit);

        function initializeUI() {
            wheelContainer.hide();
            couponContainer.hide();
            spinButton.hide();
        }

        function handleFormSubmit(event) {
            event.preventDefault();

            if (!form.valid()) {
                return;
            }

            const formData = form.serialize();

            // AJAX-запрос для отправки поздравления
            $.ajax({
                url: config.ajaxUrl,
                type: 'POST',
                data: formData,
                success: handleFormSubmitSuccess,
                error: handleAjaxError
            });
        }

        function handleFormSubmitSuccess(response) {
            if (response.error) {
                alert(response.message || 'An error occurred. Please try again.');
                return;
            }

            if (config.showWheel && response.showWheel) {
                displayWheel();
            } else if (response.coupon_code) {
                displayCoupon(response.coupon_code);
            } else {
                alert('Unexpected response from the server.');
            }
        }

        function displayWheel() {
            form.hide();
            couponContainer.hide();
            wheelContainer.show();
            spinButton.show();

            initializeWheel();

            spinButton.on('click', handleSpinButtonClick);
        }

        function initializeWheel() {
            console.log(config, 'config');
            wheelBox.lotteryWheel({
                items: config.wheelSectors,
                rotationDuration: config.rotationDuration || 5000
            });
        }

        function handleSpinButtonClick() {
            $.ajax({
                url: config.ajaxUrl,
                type: 'POST',
                data: { action: 'spin' },
                success: handleSpinSuccess,
                error: handleAjaxError
            });
        }

        function handleSpinSuccess(spinResponse) {
            if (spinResponse.error) {
                alert(spinResponse.message || 'An error occurred while spinning the wheel.');
                return;
            }

            const winningSectorId = spinResponse.sector_id;
            const coupon = spinResponse.coupon_code;

            wheelBox.lotteryWheel('spinToItem', winningSectorId);

            setTimeout(function () {
                debugger;
                wheelContainer.hide();
                spinButton.hide();
                displayCoupon(coupon);
            }, config.rotationDuration || 5000);
        }

        function displayCoupon(couponCodeValue) {
            couponContainer.show();
            couponCode.text(couponCodeValue);
        }

        function handleAjaxError(error) {
            console.error('AJAX error:', error);
            alert('An error occurred while processing your request. Please try again later.');
        }
    };
});
