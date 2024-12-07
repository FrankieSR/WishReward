define([
    'jquery',
    'Magento_Ui/js/modal/modal',
    'mage/apply/main', // Для обработки x-magento-init
    'mage/validation' // Для валидации, если используется
], function ($, modal, mageInit) {
    'use strict';

    return function (config, element) {
        const ajaxUrl = config.ajaxUrl; // URL для подгрузки формы

        $(element).on('click', function () {
            // Проверяем, есть ли уже модальное окно
            if ($('#wish-modal').length === 0) {
                // Создаем контейнер для модального окна
                $('body').append('<div id="wish-modal" style="display: none;"></div>');
            }

            const modalOptions = {
                type: 'popup',
                title: $.mage.__('New Year Wish'),
                modalClass: 'wish-modal-class',
                responsive: true,
                innerScroll: true,
                buttons: false,
            };

            const wishModal = modal(modalOptions, $('#wish-modal'));

            $.ajax({
                url: ajaxUrl,
                type: 'GET',
                success: function (response) {
                    $('#wish-modal').html(response.html);
                    $('#wish-modal').trigger('contentUpdated'); // Для совместимости с другими слушателями
                    
                    // Если нужна валидация, добавляем её вручную
                    if ($('#wish-form').length > 0) {
                        $('#wish-form').validation(); // Включаем валидацию формы
                    }

                    // Открываем модальное окно
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
