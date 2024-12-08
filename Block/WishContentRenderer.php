<?php

namespace Doroshko\WishReward\Block;

use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Doroshko\WishReward\Block\WishRewardConfig;

class WishContentRenderer extends Template
{
    private WishRewardConfig $config;

    public function __construct(
        Context $context,
        WishRewardConfig $config,
        array $data = []
    ) {
        $this->config = $config;
        parent::__construct($context, $data);
    }

    public function getFormActionUrl(): string
    {
        return $this->getUrl('wishreward/ajax/submitwish');
    }

    public function getWheelSettings(): array
    {
        return $this->config->getWheelSectors();
    }

    public function isWheelEnabled(): bool
    {
        return $this->config->isWheelEnabled();
    }
}
