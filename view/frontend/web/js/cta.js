define([
    'jquery',
    'Magento_Ui/js/modal/modal',
    'mage/apply/main', // Для обработки x-magento-init
    'mage/validation' // Для валидации, если используется
], function ($, modal, mageInit) {
    'use strict';

    return function (config, element) {
        const ajaxUrl = config.ajaxUrl; // URL для подгрузки формы
        console.log($(element));
        $(element).find('#open-wish-modal').on('click', function () {
            console.log("CLICKED");
            // Проверяем, есть ли уже модальное окно
            // if ($('#wish-modal').length === 0) {
            //     // Создаем контейнер для модального окна
            //     $('body').append('<div id="wish-modal" style="display: none;"></div>');
            // }

            // const modalOptions = {
            //     type: 'popup',
            //     title: $.mage.__('New Year Wish'),
            //     modalClass: 'wish-modal-class',
            //     responsive: true,
            //     innerScroll: true,
            //     buttons: false,
            // };

            // const wishModal = modal(modalOptions, $('#wish-modal'));

            $.ajax({
                url: ajaxUrl,
                type: 'GET',
                success: function (response) {
                    console.log(response, 'response');
                    $('.cta-wish-content').hide();
                    $(element).find('.main-wish-content').html(response.html);
                    $(element).trigger('contentUpdated');
                    
                    if ($('#wish-form').length > 0) {
                        $('#wish-form').validation();
                    }

                    $(element).removeClass('minimized').addClass('expanded');
                },
                error: function (error) {
                    console.log(error);
                    alert($.mage.__('Failed to load the form. Please try again.'));
                }
            });
        });
    };
});
