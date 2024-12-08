define(['jquery', 'Doroshko_WishReward/js/lotteryWheel'], function ($) {
    'use strict';

    return function (config, element) {
        const form = $(element); // Форма для отправки пожелания
        const wheelContainer = $('#wheel-container'); // Контейнер для колеса
        const spinButton = $('#spin-button'); // Кнопка "Крутить колесо"
        const couponContainer = $('#coupon-container'); // Контейнер для отображения купона
        const couponCode = $('#coupon-code'); // Поле для отображения кода купона

        // Скрываем элементы, которые будут отображаться после отправки формы
        wheelContainer.hide();
        couponContainer.hide();
        spinButton.hide();

        console.log(config,  '11111');

        // Обработчик отправки формы
        form.on('submit', function (event) {
            event.preventDefault(); // Предотвращаем стандартное поведение формы

            // Проверяем валидацию формы
            if (!form.valid()) {
                return;
            }

            const formData = form.serialize(); // Собираем данные формы

            
            // AJAX-запрос для отправки поздравления
            $.ajax({
                url: config.ajaxUrl,
                type: 'POST',
                data: formData,
                success: function (response) {
                    if (response.error) {
                        alert(response.message || 'An error occurred. Please try again.');
                        return;
                    }


                    if (config.showWheel && response.showWheel) {
                        form.hide(); // Скрываем форму
                        couponContainer.hide(); // Скрываем контейнер купона
                        wheelContainer.show(); // Показываем контейнер колеса
                        spinButton.show(); // Показываем кнопку "Крутить колесо"

                        // Инициализация колеса
                        wheelContainer.lotteryWheel({
                            items: config.wheelSettings.items,
                            rotationDuration: config.wheelSettings.rotationDuration || 5000
                        });

                        // Обработчик кнопки "Крутить колесо"
                        spinButton.on('click', function () {
                            // Отправляем запрос для расчета выигрышного сектора
                            $.ajax({
                                url: config.ajaxUrl,
                                action: 'spin',
                                type: 'POST',
                                data: { action: 'spin' }, // Указываем действие "spin"
                                success: function (spinResponse) {
                                    if (spinResponse.error) {
                                        alert(spinResponse.message || 'An error occurred while spinning the wheel.');
                                        return;
                                    }

                                    console.log(spinResponse, 'spinResponse');
                                    const winningSectorId = spinResponse.sector_id; // ID выигрышного сектора
                                    const coupon = spinResponse.coupon_code; // Код купона

                                    // Запускаем анимацию вращения колеса
                                    wheelContainer.lotteryWheel('spinToItem', winningSectorId);

                                    // После завершения вращения показываем купон
                                    setTimeout(function () {
                                        wheelContainer.hide(); // Скрываем колесо
                                        spinButton.hide(); // Скрываем кнопку "Крутить колесо"
                                        couponContainer.show(); // Показываем контейнер купона
                                        couponCode.text(coupon); // Устанавливаем текст купона
                                    }, config.wheelSettings.rotationDuration || 5000); // Задержка равна времени вращения
                                },
                                error: function (error) {
                                    console.log(error, 'errorerror');
                                    alert('Failed to process the spin. Please try again later.');
                                }
                            });
                        });
                    } else if (response.coupon_code) {
                        // Если просто возвращается купон
                        form.hide(); // Скрываем форму
                        wheelContainer.hide(); // Скрываем колесо
                        couponContainer.show(); // Показываем контейнер купона
                        couponCode.text(response.coupon_code); // Устанавливаем код купона
                    } else {
                        alert('Unexpected response from the server.');
                    }
                },
                error: function (error) {
                    console.log(error);
                    alert('Failed to submit your wish. Please try again later.');
                }
            });
        });
    };
});
