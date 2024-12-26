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
        $this->customerSession = $customerSession;
        $this->config = $config;
        parent::__construct($context, $data);
    }

    public function getFormActionUrl(): string
    {
        return $this->getUrl('wishreward/ajax/submitwish');
    }

    public function getLoginUrl(): string
    {
        return $this->getUrl('customer/account/login');
    }

    public function isWheelEnabled(): bool
    {
        return $this->config->isWheelEnabled();
    }

    public function getWheelSectors(): array
    {
        return $this->config->getWheelSectors();
    }

    public function getRotationDuration(): int
    {
        return $this->config->getRotationDuration();
    }

    public function isGuestAllowed(): bool
    {
        return $this->config->isGuestAllowed();
    }

    public function canShowForm(): bool
    {
        return $this->isGuestAllowed() || $this->customerSession->isLoggedIn();
    }
}
