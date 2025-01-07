<?php

namespace Doroshko\WishReward\Block;

use Magento\Customer\Model\Session;
use Magento\Framework\View\Element\Template;
use Doroshko\WishReward\Model\Config;

class WishContent extends Template
{
    private Session $customerSession;
    private Config $config;

    public function __construct(
        Template\Context $context,
        Session $customerSession,
        Config $config,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->customerSession = $customerSession;
        $this->config = $config;
    }

    /**
     * Returns the URL for submitting a wish.
     */
    public function getFormActionUrl(): string
    {
        return $this->getUrl('wishreward/ajax/submitwish');
    }

    /**
     * Returns the login URL.
     */
    public function getLoginUrl(): string
    {
        return $this->getUrl('customer/account/login');
    }

    /**
     * Checks if the wheel is enabled.
     */
    public function isWheelEnabled(): bool
    {
        return $this->config->isWheelEnabled();
    }

    /**
     * Gets the sectors for the wheel.
     */
    public function getWheelSectors(): array
    {
        return $this->config->getWheelSectors();
    }

    /**
     * Gets the rotation duration for the wheel.
     */
    public function getRotationDuration(): int
    {
        return $this->config->getRotationDuration();
    }

    /**
     * Checks if guests are allowed.
     */
    public function isGuestAllowed(): bool
    {
        return $this->config->isGuestAllowed();
    }

    /**
     * Checks if the wish form can be shown.
     */
    public function canShowWishForm(): bool
    {
        return $this->isGuestAllowed() || $this->customerSession->isLoggedIn();
    }
}
