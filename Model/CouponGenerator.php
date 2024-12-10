<?php

namespace Doroshko\WishReward\Model;

use Magento\SalesRule\Model\CouponFactory;
use Magento\Framework\Stdlib\DateTime\DateTime;

class CouponGenerator
{
    private CouponFactory $couponFactory;
    private DateTime $dateTime;

    public function __construct(
        CouponFactory $couponFactory,
        DateTime $dateTime
    ) {
        $this->couponFactory = $couponFactory;
        $this->dateTime = $dateTime;
    }

    /**
     * Генерирует купон на основе указанного правила.
     *
     * @param int $ruleId
     * @return string|null Код купона или null в случае ошибки
     */
    public function generate(int $ruleId): ?string
    {
        try {
            $couponCode = strtoupper(bin2hex(random_bytes(4))); // Генерация случайного кода

            $coupon = $this->couponFactory->create();
            $coupon->setRuleId($ruleId)
                ->setCode($couponCode)
                ->setUsageLimit(1)
                ->setUsagePerCustomer(1)
                ->setExpirationDate($this->dateTime->gmtDate('Y-m-d H:i:s', strtotime('+7 days'))) // Устанавливаем срок действия
                ->setCreatedAt($this->dateTime->gmtDate())
                ->setType(2) // Тип: вручную созданный купон
                ->save();

            return $couponCode;
        } catch (\Exception $e) {
            // Логируем ошибку или обрабатываем ее
            return null;
        }
    }
}
