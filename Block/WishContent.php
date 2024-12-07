<?php

namespace Doroshko\wishreward\Block;

use Magento\Framework\View\Element\Template;

class WishContent extends Template
{
    /**
     * Проверяем, включено ли колесо
     *
     * @return bool
     */
    public function isWheelEnabled()
    {
        // Логика проверки (например, данные из настроек)
        return true;
    }

    /**
     * Получаем настройки для колеса
     *
     * @return array
     */
    public function getWheelSettings()
    {
        return [
            'items' => [
                ['label' => 'Prize 1', 'color' => '#ff0000', 'value' => '1'],
                ['label' => 'Prize 2', 'color' => '#00ff00', 'value' => '2'],
                ['label' => 'Prize 3', 'color' => '#0000ff', 'value' => '3'],
                ['label' => 'Prize 4', 'color' => '#ffff00', 'value' => '4'],
                ['label' => 'Prize 5', 'color' => '#ff00ff', 'value' => '5'],
            ],
            'rotationDuration' => 5000
        ];
    }

    /**
     * Получаем URL для отправки формы
     *
     * @return string
     */
    public function getFormActionUrl()
    {
        return $this->getUrl('wishreward/ajax/submitwish');
    }
}
