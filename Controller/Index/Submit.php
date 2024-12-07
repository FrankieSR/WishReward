<?php

namespace Doroshko\wishreward\Controller\Index;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Stdlib\DateTime\DateTime;
use Magento\SalesRule\Model\CouponFactory;

class Submit extends Action
{
    protected $resultJsonFactory;
    protected $couponFactory;
    protected $dateTime;

    public function __construct(
        Context $context,
        JsonFactory $resultJsonFactory,
        CouponFactory $couponFactory,
        DateTime $dateTime
    ) {
        $this->resultJsonFactory = $resultJsonFactory;
        $this->couponFactory = $couponFactory;
        $this->dateTime = $dateTime;
        parent::__construct($context);
    }

    public function execute()
    {
        $resultJson = $this->resultJsonFactory->create();
        $postData = $this->getRequest()->getPostValue();

        if (isset($postData['greeting'])) {
            $greeting = htmlspecialchars($postData['greeting']);

            // Массив доступных правил
            $ruleIds = [6, 7];
            $randomRuleId = $this->getRandomRuleId($ruleIds);

            // Генерация купона
            $couponCode = $this->generateCoupon($randomRuleId);

            if ($couponCode) {
                $message = "Спасибо за поздравление! Ваш купон: {$couponCode}";
                return $resultJson->setData(['success' => true, 'message' => $message, 'coupon_code' => $couponCode]);
            }

            return $resultJson->setData(['success' => false, 'message' => 'Не удалось создать купон.']);
        }

        return $resultJson->setData(['success' => false, 'message' => 'Поздравление не отправлено.']);
    }

    protected function getRandomRuleId(array $ruleIds)
    {
        return $ruleIds[array_rand($ruleIds)];
    }

    protected function generateCoupon($ruleId)
    {
        try {
            $couponCode = strtoupper(bin2hex(random_bytes(4))); // Пример: "8F3E9C5D"

            $coupon = $this->couponFactory->create();
            $coupon->setRuleId($ruleId)
                ->setCode($couponCode)
                ->setUsageLimit(1)
                ->setUsagePerCustomer(1)
                ->setExpirationDate($this->dateTime->gmtDate('Y-m-d H:i:s', strtotime('+7 days')))
                ->setCreatedAt($this->dateTime->gmtDate())
                ->setType(2) // Тип: вручную созданный купон
                ->save();

            return $couponCode;
        } catch (\Exception $e) {
            $this->messageManager->addErrorMessage(__('Ошибка: ') . $e->getMessage());
            return null;
        }
    }
}
