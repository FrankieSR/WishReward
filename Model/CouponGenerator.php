<?php

namespace Doroshko\WishReward\Model;

use Magento\SalesRule\Model\CouponFactory;
use Magento\Framework\Stdlib\DateTime\DateTime;
use Psr\Log\LoggerInterface;
use Magento\Framework\Exception\LocalizedException;

class CouponGenerator
{
    private CouponFactory $couponFactory;
    private DateTime $dateTime;
    private LoggerInterface $logger;

    public function __construct(
        CouponFactory $couponFactory,
        DateTime $dateTime,
        LoggerInterface $logger
    ) {
        $this->couponFactory = $couponFactory;
        $this->dateTime = $dateTime;
        $this->logger = $logger;
    }

    public function generate(int $ruleId): ?string
    {
        try {
            if ($ruleId <= 0) {
                throw new LocalizedException(__('Invalid rule ID provided.'));
            }

            $couponCode = $this->generateUniqueCode();
            $coupon = $this->couponFactory->create();
            $coupon->setRuleId($ruleId)
                ->setCode($couponCode)
                ->setUsageLimit(1) // Лимит использования купона
                ->setUsagePerCustomer(1) // Лимит использования на одного клиента
                ->setExpirationDate($this->getExpirationDate()) // Установка даты истечения
                ->setCreatedAt($this->dateTime->gmtDate()) // Установка текущей даты
                ->setType(1); // Тип: вручную созданный купон

            $coupon->save();

            return $couponCode;
        } catch (LocalizedException $e) {
            $this->logger->error(__('Validation error: %1', $e->getMessage()));
        } catch (\Exception $e) {
            $this->logger->error(__('Failed to generate coupon: %1', $e->getMessage()));
        }

        return null;
    }

    private function generateUniqueCode(): string
    {
        return 'COUPON-' . strtoupper(bin2hex(random_bytes(4)));
    }

    private function getExpirationDate(): string
    {
        return $this->dateTime->gmtDate('Y-m-d H:i:s', strtotime('+7 days'));
    }
}
