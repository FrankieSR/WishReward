define(['jquery', 'Magento_Ui/js/modal/modal'], function ($, modal) {
    'use strict';

    console.log('INITED');
    return function (config, element) {
        const form = $(element); // Элемент формы
        const wheelContainer = $('#wheel-container'); // Контейнер для колеса
        const couponContainer = $('#coupon-container'); // Контейнер для кода купона
        const couponCode = $('#coupon-code'); // Элемент для отображения купона

        // Обработчик отправки формы
        form.on('submit', function (event) {
            console.log(1111);
            event.preventDefault(); // Останавливаем стандартное поведение формы

            // Если форма не валидна, выходим
            if (!form.valid()) {
                return;
            }

            const formData = form.serialize(); // Собираем данные формы

            // AJAX-запрос на сервер
            $.ajax({
                url: config.ajaxUrl, // URL для отправки формы
                type: 'POST',
                data: formData,
                success: function (response) {
                    if (response.error) {
                        alert(response.message || 'An error occurred. Please try again.');
                        return;
                    }

                    // Если нужно отображать колесо
                    if (config.showWheel && response.showWheel) {
                        form.hide(); // Скрываем форму
                        couponContainer.hide(); // Скрываем контейнер купона
                        wheelContainer.show(); // Показываем контейнер колеса

                        // Инициализация колеса
                        wheelContainer.lotteryWheel({
                            items: config.wheelSettings.items,
                            rotationDuration: config.wheelSettings.rotationDuration || 5000,
                            onSpinEnd: function (value) {
                                alert('You won Prize ' + value + '!');
                            }
                        });
                    } else if (response.couponCode) {
                        // Если нужно отобразить купон
                        form.hide(); // Скрываем форму
                        wheelContainer.hide(); // Скрываем колесо
                        couponContainer.show(); // Показываем контейнер купона
                        couponCode.text(response.couponCode); // Устанавливаем текст купона
                    } else {
                        alert('Unexpected response from the server.');
                    }
                },
                error: function () {
                    alert('Failed to submit your wish. Please try again later.');
                }
            });
        });
    };
});
