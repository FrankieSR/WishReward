<?php
namespace Doroshko\WishReward\ViewModel;

use Doroshko\WishReward\Model\Config;
use Magento\Framework\UrlInterface;
use Magento\Customer\Model\Session;

class WishContentViewModel implements \Magento\Framework\View\Element\Block\ArgumentInterface
{
    private Config $config;
    private UrlInterface $urlBuilder;
    private Session $customerSession;

    public function __construct(
        Config $config,
        UrlInterface $urlBuilder,
        Session $customerSession
    ) {
        $this->config = $config;
        $this->urlBuilder = $urlBuilder;
        $this->customerSession = $customerSession;
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

    public function getFormActionUrl(): string
    {
        return $this->urlBuilder->getUrl('wishreward/ajax/submitwish');
    }
}
