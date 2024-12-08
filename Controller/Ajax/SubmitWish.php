<?php

namespace Doroshko\WishReward\Controller\Ajax;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Stdlib\DateTime\DateTime;
use Magento\SalesRule\Model\CouponFactory;
use Doroshko\WishReward\Block\WishRewardConfig;

class SubmitWish extends Action
{
    private JsonFactory $resultJsonFactory;
    private CouponFactory $couponFactory;
    private DateTime $dateTime;
    private WishRewardConfig $config;

    public function __construct(
        Context $context,
        JsonFactory $resultJsonFactory,
        CouponFactory $couponFactory,
        DateTime $dateTime,
        WishRewardConfig $config // Внедряем блок конфигурации
    ) {
        $this->resultJsonFactory = $resultJsonFactory;
        $this->couponFactory = $couponFactory;
        $this->dateTime = $dateTime;
        $this->config = $config;
        parent::__construct($context);
    }

    public function execute()
    {
        $resultJson = $this->resultJsonFactory->create();
        $postData = $this->getRequest()->getPostValue();
        $action = $postData['action'] ?? 'submit';

        if ($action === 'submit') {
            return $this->handleFormSubmit($resultJson);
        }

        if ($action === 'spin') {
            return $this->handleWheelSpin($resultJson);
        }

        return $resultJson->setData(['success' => false, 'message' => __('Invalid action.')]);
    }

    private function handleFormSubmit($resultJson)
    {
        if (!$this->config->isWheelEnabled()) {
            $defaultRuleId = $this->config->getDefaultRuleId();

            $couponCode = $this->generateCoupon($defaultRuleId);

            if ($couponCode) {
                return $resultJson->setData([
                    'success' => true,
                    'coupon_code' => $couponCode,
                    'message' => __('Your coupon code is: %1', $couponCode)
                ]);
            }

            return $resultJson->setData(['success' => false, 'message' => __('Failed to generate coupon.')]);
        }

        return $resultJson->setData(['success' => true, 'showWheel' => true]);
    }

    private function handleWheelSpin($resultJson)
    {
        $sectors = $this->config->getWheelSectors(); // Получаем сектора из конфигурации

        if (empty($sectors)) {
            return $resultJson->setData(['success' => false, 'message' => __('Wheel sectors are not configured.')]);
        }

        $winningSector = $this->getWinningSector($sectors);

        if ($winningSector['rule_id'] !== null) {
            $couponCode = $this->generateCoupon($winningSector['rule_id']);

            if ($couponCode) {
                return $resultJson->setData([
                    'success' => true,
                    'sector_id' => $winningSector['id'],
                    'coupon_code' => $couponCode,
                    'message' => __('You won: %1', $winningSector['label'])
                ]);
            }

            return $resultJson->setData(['success' => false, 'message' => __('Failed to generate coupon.')]);
        }

        return $resultJson->setData([
            'success' => true,
            'sector_id' => $winningSector['id'],
            'coupon_code' => null,
            'message' => __('Try again: %1', $winningSector['label'])
        ]);
    }

    private function getWinningSector(array $sectors): array
    {
        $totalProbability = array_sum(array_column($sectors, 'probability'));
        $random = rand(1, $totalProbability);
        $currentSum = 0;

        foreach ($sectors as $sector) {
            $currentSum += $sector['probability'];
            if ($random <= $currentSum) {
                return $sector;
            }
        }

        return end($sectors);
    }

    private function generateCoupon(int $ruleId): ?string
    {
        try {
            $couponCode = strtoupper(bin2hex(random_bytes(4)));

            $coupon = $this->couponFactory->create();
            $coupon->setRuleId($ruleId)
                ->setCode($couponCode)
                ->setUsageLimit(1)
                ->setUsagePerCustomer(1)
                ->setExpirationDate($this->dateTime->gmtDate('Y-m-d H:i:s', strtotime('+7 days')))
                ->setCreatedAt($this->dateTime->gmtDate())
                ->setType(2)
                ->save();

            return $couponCode;
        } catch (\Exception $e) {
            $this->messageManager->addErrorMessage(__('Error: ') . $e->getMessage());
            return null;
        }
    }
}
