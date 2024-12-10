<?php

namespace Doroshko\WishReward\Model\ResourceModel;

use Magento\Framework\Model\ResourceModel\Db\AbstractDb;

class Wish extends AbstractDb
{
    protected function _construct()
    {
        $this->_init('wishreward_wishes', 'wish_id');
    }
}
