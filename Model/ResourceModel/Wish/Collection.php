<?php
namespace Doroshko\WishReward\Model\ResourceModel\Wish;

use Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection;
use Doroshko\WishReward\Model\Wish as Model;
use Doroshko\WishReward\Model\ResourceModel\Wish as ResourceModel;

class Collection extends AbstractCollection
{
    protected function _construct()
    {
        $this->_init(Model::class, ResourceModel::class);
    }
}