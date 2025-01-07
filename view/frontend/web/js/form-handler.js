define([
    'jquery', 
    'mage/translate',
    'Doroshko_WishReward/js/lotteryWheelWidget',
    'mage/validation'
], function ($, $t) {
    'use strict';

    return function (config, element) {
        const DEFAULTS = {
            hideErrorDuration: 4000,
            rotationDuration: 5000,
            wheelRadius: 210,
        };
        
        const selectors = {
            form: $(element).find('form'),
            wheelBox: $('#wish-wheel-box'),
            couponCodeBlock: $('#wish-coupon-code'),
            noCouponCodeBlock: $('#wish-nocoupon-container'),
            couponContainer: $('#wish-coupon-container'),
            mainContainer: $('.wish-content-container'),
        };

        init();

        /**
         * Initializes the widget and sets up event listeners.
         * This function checks if the wheel should be displayed and attaches form submission handler.
         */
        function init() {
            if (config.showWheel) {
                displayWheel();
            }
            selectors.form.on('submit', handleFormSubmit);
        }

        /**
         * Handles the form submission event.
         * Prevents default form behavior, validates the form, and makes an AJAX request.
         *
         * @param {Event} event The submit event.
         */
        function handleFormSubmit(event) {
            event.preventDefault();
            if (!selectors.form.valid()) return;

            $.post(config.ajaxUrl, selectors.form.serialize())
                .done(handleFormSubmitSuccess)
                .fail(handleError);
        }

        /**
         * Handles a successful form submission response.
         * Displays either a coupon code, an error message, or triggers the wheel spin.
         *
         * @param {Object} response The AJAX response object.
         */
        function handleFormSubmitSuccess(response) {
            if (!response.success) {
                showFormError(
                    selectors.form.find('textarea'), 
                    $t("This is not a Christmas greeting")
                );

                return;
            }

            clearFormErrors();

            if (config.showWheel && response.canSpinWheel) {
                handleSpinButtonClick();
            } else if (response.coupon_code) {
                displayCoupon(response.coupon_code);
            } else {
                displayNoCoupon();
            }
        }

        /**
         * Handles the spin button click event.
         * Makes an AJAX request to spin the wheel.
         */
        function handleSpinButtonClick() {
            $.post(config.ajaxUrl, { action: 'spin' })
                .done(handleSpinSuccess)
                .fail(handleError);
        }

        /**
         * Handles a successful spin response.
         * Spins the wheel to a selected item and displays the result.
         *
         * @param {Object} response The spin response object containing the coupon code and sector ID.
         */
        function handleSpinSuccess({ coupon_code, message, success, sector_id = null, error = null }) {
            if (error) {
                handleError(message || $t('An error occurred while spinning the wheel.'))
                return;
            }

            selectors.wheelBox.lotteryWheel(
                'spinToItem', 
                sector_id, 
                { coupon: coupon_code }, 
                onSpinComplete // Callback on spin complete
            );
        }

        /**
         * Callback function for when the spin completes.
         * Displays the coupon or shows a message if no coupon is available.
         *
         * @param {Object} result The result of the spin, containing coupon code and label.
         */
        function onSpinComplete(result) {
            const coupon = result?.data?.coupon;
            const label = result?.label;

            coupon ? displayCoupon(coupon, label) : displayNoCoupon();
        }

        /**
         * Displays the coupon code in the designated block.
         * Hides the main container and shows the coupon container.
         *
         * @param {string} couponCodeValue The coupon code to display.
         */
        function displayCoupon(couponCodeValue) {
            selectors.couponCodeBlock.text(couponCodeValue);

            hideContainer(selectors.mainContainer);
            showContainer(selectors.couponContainer);
        }

        /**
         * Displays a message indicating no coupon is available.
         * Hides the main container and shows the 'no coupon' container.
         */
        function displayNoCoupon() {
            hideContainer(selectors.mainContainer);
            showContainer(selectors.noCouponCodeBlock);
        }

        /**
         * Displays the lottery wheel.
         * Initializes the lottery wheel widget with the given configuration.
         */
        function displayWheel() {
            selectors.wheelBox.lotteryWheel({
                items: config.wheelSectors,
                rotationDuration: DEFAULTS.rotationDuration,
                wheelRadius: DEFAULTS.wheelRadius
            });

            hideContainer(selectors.couponContainer);
        }

        /**
         * Displays an error message next to the specified form element.
         * The error message is automatically removed after a specified duration.
         *
         * @param {jQuery} element The form element where the error occurred.
         * @param {string} message The error message to display.
         */
        function showFormError(element, message) {
            const errorClass = 'mage-error';
            element.addClass(errorClass).after(`<div class="${errorClass} message">${message}</div>`);

            // Remove the error message after a delay.
            setTimeout(() => {
                element.removeClass(errorClass);
                element.siblings(`.${errorClass}.message`).remove();
            }, DEFAULTS.hideErrorDuration);
        }
        
        /**
         * Clears all form errors.
         * Removes error styles and messages from all form elements.
         */
        function clearFormErrors() {
            $(selectors.form).find('textarea, input').removeClass('mage-error');
            $(selectors.form).find('.mage-error.message').remove();
        }

        /**
         * Shows the specified container by setting its display style to block.
         *
         * @param {jQuery} container The container to display.
         */
        function showContainer(container) {
            container.show();
            container.attr('aria-hidden', false);
        }

        /**
         * Hides the specified container by setting its display style to none.
         *
         * @param {jQuery} container The container to hide.
         */
        function hideContainer(container) {
            container.hide();
            container.attr('aria-hidden', true);
        }

        /**
         * Handles any errors that occur during AJAX requests.
         * Logs the error message to the console.
         *
         * @param {string} error The error message.
         */
        function handleError(error) {
            console.error('Error processing result:', error);
        }
    };
});
