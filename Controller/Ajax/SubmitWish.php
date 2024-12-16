<?php

namespace Doroshko\WishReward\Controller\Ajax;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use Doroshko\WishReward\Model\Config;
use Doroshko\WishReward\Model\CouponGenerator;
use Doroshko\WishReward\Model\ProbabilityCalculator;
use Doroshko\WishReward\Model\WishFactory;
use Magento\Customer\Model\Session as CustomerSession;
use Doroshko\WishReward\Model\LocalMLValidator;

class SubmitWish extends Action
{
    private JsonFactory $resultJsonFactory;
    private Config $config;
    private CouponGenerator $couponGenerator;
    private ProbabilityCalculator $probabilityCalculator;
    private WishFactory $wishFactory;
    private CustomerSession $customerSession;
    private LocalMLValidator $mlValidator;

    public function __construct(
        Context $context,
        JsonFactory $resultJsonFactory,
        Config $config,
        CouponGenerator $couponGenerator,
        ProbabilityCalculator $probabilityCalculator,
        WishFactory $wishFactory,
        CustomerSession $customerSession,
        LocalMLValidator $mlValidator
    ) {
        $this->resultJsonFactory = $resultJsonFactory;
        $this->config = $config;
        $this->couponGenerator = $couponGenerator;
        $this->probabilityCalculator = $probabilityCalculator;
        $this->wishFactory = $wishFactory;
        $this->customerSession = $customerSession;
        $this->mlValidator = $mlValidator;
        parent::__construct($context);
    }

    public function execute()
    {
        $resultJson = $this->resultJsonFactory->create();
        $postData = $this->getRequest()->getPostValue();
        $action = $postData['action'] ?? 'submit';

        switch ($action) {
            case 'submit':
                return $this->handleFormSubmit($resultJson, $postData);
            case 'spin':
                return $this->handleWheelSpin($resultJson);
            default:
                return $resultJson->setData(['success' => false, 'message' => __('Invalid action.')]);
        }
    }

    private function handleFormSubmit($resultJson, array $postData)
    {
        $wishMessage = $postData['wish_message'] ?? '';

        if (empty($wishMessage)) {
            return $resultJson->setData(['success' => false, 'message' => __('Wish message is required.')]);
        }

        $status = $this->mlValidator->validateText($wishMessage)['status'];
        $reason = $this->mlValidator->validateText($wishMessage)['reason'];

        if ($status == 'invalid') {
            return $resultJson->setData(['success' => false, 'status' => $status, 'reason' => $reason]);
        }

        try {
            $this->saveWish($wishMessage);

            if (!$this->config->isWheelEnabled()) {
                $defaultRuleId = $this->config->getDefaultRuleId();

                $couponCode = $this->couponGenerator->generate($defaultRuleId);

                if ($couponCode) {
                    return $resultJson->setData([
                        'success' => true,
                        'coupon_code' => $couponCode,
                        'message' => __('Your coupon code is: %1', $couponCode)
                    ]);
                }

                return $resultJson->setData(['success' => false, 'message' => __('Failed to generate coupon.')]);
            }

            return $resultJson->setData(['success' => true, 'canSpinWheel' => true]);

        } catch (\Exception $e) {
            return $resultJson->setData(['success' => false, 'message' => __('Failed to save the wish: %1', $e->getMessage())]);
        }
    }

    private function handleWheelSpin($resultJson)
    {
        $sectors = $this->config->getWheelSectors();

        if (empty($sectors)) {
            return $resultJson->setData(['success' => false, 'message' => __('Wheel sectors are not configured.')]);
        }

        try {
            $winningSector = $this->probabilityCalculator->getWinningSector($sectors);
        } catch (\InvalidArgumentException $e) {
            return $resultJson->setData(['success' => false, 'message' => $e->getMessage()]);
        }

        if ($winningSector['rule_id'] !== null) {
            $couponCode = $this->couponGenerator->generate($winningSector['rule_id']);

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

    private function saveWish(string $wishMessage): void
    {
        $customerId = $this->customerSession->isLoggedIn() ? $this->customerSession->getCustomerId() : null;

        $wish = $this->wishFactory->create();
        $wish->setData([
            'wish_message' => $wishMessage,
            'customer_id' => $customerId
        ]);
        $wish->save();
    }
}
