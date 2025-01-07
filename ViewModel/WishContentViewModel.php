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

    /**
     * @param Config $config
     * @param UrlInterface $urlBuilder
     * @param Session $customerSession
     */
    public function __construct(
        Config $config,
        UrlInterface $urlBuilder,
        Session $customerSession
    ) {
        $this->config = $config;
        $this->urlBuilder = $urlBuilder;
        $this->customerSession = $customerSession;
    }

    /**
     * Returns whether the wheel feature is enabled.
     *
     * @return bool
     */
    public function isWheelEnabled(): bool
    {
        return $this->config->isWheelEnabled();
    }

    /**
     * Returns an array of wheel sectors.
     *
     * @return array
     */
    public function getWheelSectors(): array
    {
        return $this->config->getWheelSectors();
    }

    /**
     * Returns the rotation duration of the wheel.
     *
     * @return int
     */
    public function getRotationDuration(): int
    {
        return $this->config->getRotationDuration();
    }

    /**
     * Returns whether guests are allowed to participate.
     *
     * @return bool
     */
    public function isGuestAllowed(): bool
    {
        return $this->config->isGuestAllowed();
    }

    /**
     * Returns whether the form should be displayed based on the user's session.
     *
     * @return bool
     */
    public function canShowForm(): bool
    {
        return $this->isGuestAllowed() || $this->customerSession->isLoggedIn();
    }

    /**
     * Returns the URL for the form action.
     *
     * @return string
     */
    public function getFormActionUrl(): string
    {
        return $this->urlBuilder->getUrl('wishreward/ajax/submitwish');
    }
}
