define(['jquery', 'Doroshko_WishReward/js/lotteryWheel', 'mage/validation'], function ($) {
    'use strict';

    return function (config, element) {
        console.log(element, 'element');
        const form = $(element).find('form');
        const wheelContainer = $('#wish-wheel-container');
        const wheelBox = $('#wish-wheel-box');
        const couponCode = $('#wish-coupon-code');
        const couponContainer = $('#wish-coupon-container');
        const mainContainer = $('.wish-popup.expanded');

        initializeUI();

        form.on('submit', handleFormSubmit);

        function initializeUI() {
            couponContainer.hide();

            addButtonEffect();
            displayWheel();
        }

        function handleFormSubmit(event) {
            event.preventDefault();

            // if (!form.valid()) {
            //     return;
            // }

            const formData = form.serialize();

            // AJAX-запрос для отправки поздравления
            $.ajax({
                url: config.ajaxUrl,
                type: 'POST',
                data: formData,
                success: handleFormSubmitSuccess,
                error: handleAjaxError,
            });
        }

        function handleFormSubmitSuccess(response) {
            console.log(response, form);
            if (response.success === false) {
                $(form).find('input').addClass('mage-error');
                $(form).find('input').after('<div class="mage-error">Custom error message</div>');

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

            wheelContainer.show();
            couponContainer.hide();
        }

        function initializeWheel() {
            console.log(config, mainContainer.height(), 'config');
            wheelBox.lotteryWheel({
                items: config.wheelSectors,
                rotationDuration: config.rotationDuration || 5000,
                wheelRadius: 250,
                onSpinEnd: function (result) {
                    displayCoupon(result.data.coupon, result.label);
                },
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

        function handleSpinSuccess(spinResponse) {
            if (spinResponse.error) {
                alert(spinResponse.message || 'An error occurred while spinning the wheel.');
                return;
            }

            const winningSectorId = spinResponse.sector_id;
            const coupon = spinResponse.coupon_code;

            wheelBox.lotteryWheel('spinToItem', winningSectorId, {
                coupon,
            });
        }

        function displayCoupon(couponCodeValue) {
            console.log(couponCodeValue);
            couponCode.text(couponCodeValue);

            form.hide();
            wheelContainer.hide();

            couponContainer.show();
        }

        function handleAjaxError(error) {
            console.error('AJAX error:', error);
        }

        function addButtonEffect() {
            const $parentBlock = $(element);

            $parentBlock.on('mouseenter', '.the-primary-button', function (event) {
                const $button = $(this);
                const $item = $button.find('.round');

                $button.addClass('animate');
                console.log('ENTERED');

                let buttonX = event.offsetX;
                let buttonY = event.offsetY;

                $item.css({
                    top: buttonY < 24 ? '0px' : '48px',
                    left: `${buttonX}px`,
                    width: '1px',
                    height: '1px'
                });
            });

            $parentBlock.on('mouseleave', '.the-primary-button', function (event) {
                const $button = $(this);
                const $item = $button.find('.round');

                $button.removeClass('animate');

                let buttonX = event.offsetX;
                let buttonY = event.offsetY;

                $item.css({
                    top: buttonY < 24 ? '0px' : '48px',
                    left: `${buttonX}px`
                });
            });

        }
    };
});
