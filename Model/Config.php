<?php

namespace Doroshko\WishReward\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Model\ScopeInterface;

class Config
{
    private ScopeConfigInterface $scopeConfig;

    public function __construct(ScopeConfigInterface $scopeConfig)
    {
        $this->scopeConfig = $scopeConfig;
    }

    public function isModuleEnabled(): bool
    {
        return $this->scopeConfig->isSetFlag(
            'wishreward_settings/general/enable_module',
            ScopeInterface::SCOPE_STORE
        );
    }

    public function isWheelEnabled(): bool
    {
        return $this->scopeConfig->isSetFlag(
            'wishreward_settings/general/enable_wheel',
            ScopeInterface::SCOPE_STORE
        );
    }

    public function getDefaultRuleId(): int
    {
        return (int)$this->scopeConfig->getValue(
            'wishreward_settings/general/default_rule_id',
            ScopeInterface::SCOPE_STORE
        );
    }

    public function getRotationDuration(): int
    {
        return (int)$this->scopeConfig->getValue(
            'wishreward_settings/general/rotation_duration',
            ScopeInterface::SCOPE_STORE
        );
    }

    public function getWheelSectors(): array
    {
        $sectorsJson = $this->scopeConfig->getValue(
            'wishreward_settings/general/wheel_sectors',
            ScopeInterface::SCOPE_STORE
        );

        if (!$sectorsJson) {
            $this->logger->warning('No wheel sectors found in configuration.');
            return [];
        }

        $sectors = json_decode($sectorsJson, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return [];
        }

        foreach ($sectors as $key => &$sector) {
            if (!isset($sector['id'])) {
                $sector['id'] = $key + 1;
            }
        }

        return $sectors;
    }

    public function isGuestAllowed(): bool
    {
        return $this->scopeConfig->isSetFlag(
            'wishreward_settings/general/allow_guests',
            ScopeInterface::SCOPE_STORE
        );
    }
}
