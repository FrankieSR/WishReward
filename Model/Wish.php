<?php

namespace Doroshko\WishReward\Model;

use Magento\Framework\Model\AbstractModel;

class Wish extends AbstractModel
{
    protected function _construct()
    {
        $this->_init(\Doroshko\WishReward\Model\ResourceModel\Wish::class);
    }
}