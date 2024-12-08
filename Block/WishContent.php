<?php

namespace Doroshko\WishReward\Block;

use Magento\Framework\View\Element\Template;
use Magento\Framework\App\Config\ScopeConfigInterface;

class WishContent extends Template
{
    private ScopeConfigInterface $scopeConfig;

    public function __construct(
        Template\Context $context,
        ScopeConfigInterface $scopeConfig,
        array $data = []
    ) {
        $this->scopeConfig = $scopeConfig;
        parent::__construct($context, $data);
    }

    public function isWheelEnabled(): bool
    {
        return $this->scopeConfig->isSetFlag(
            'wishreward_settings/general/enable_wheel',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
    }

    public function getWheelSettings(): array
    {
        return [
            'items' => $this->getWheelSectors(),
            'rotationDuration' => $this->getRotationDuration()
        ];
    }

    public function getWheelSectors(): array
    {
        $sectorsJson = $this->scopeConfig->getValue(
            'wishreward_settings/general/wheel_sectors',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );

        $sectors = json_decode($sectorsJson, true) ?: [];

        foreach ($sectors as $index => &$sector) {
            $sector['id'] = $index + 1;
        }

        return $sectors;
    }

    public function getRotationDuration(): int
    {
        $rotationDuration = (int)$this->scopeConfig->getValue(
            'wishreward_settings/general/rotation_duration',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );

        return $rotationDuration > 0 ? $rotationDuration : 5000;
    }

    public function getFormActionUrl(): string
    {
        return $this->getUrl('wishreward/ajax/submitwish');
    }
}
