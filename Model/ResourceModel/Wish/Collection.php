<?php

namespace Doroshko\WishReward\Model\ResourceModel\Wish;

use Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection;
use Magento\Framework\Api\Search\SearchResultInterface;
use Magento\Framework\Api\SearchCriteriaInterface;

class Collection extends AbstractCollection implements SearchResultInterface
{
    protected $_idFieldName = 'wish_id';
    private ?array $aggregations = null;

    protected function _construct(): void
    {
        $this->_init(
            \Doroshko\WishReward\Model\Wish::class,
            \Doroshko\WishReward\Model\ResourceModel\Wish::class
        );
    }

    public function getAggregations(): ?array
    {
        return $this->aggregations;
    }

    public function setAggregations($aggregations): void
    {
        $this->aggregations = $aggregations;
    }

    public function getSearchCriteria(): ?SearchCriteriaInterface
    {
        return null;
    }

    public function setSearchCriteria(SearchCriteriaInterface $searchCriteria): self
    {
        return $this;
    }

    public function getTotalCount(): int
    {
        return $this->getSize();
    }

    public function setTotalCount($totalCount): self
    {
        return $this;
    }

    public function setItems(array $items = null): self
    {
        $this->_items = $items ?? [];
        return $this;
    }

    public function getItems(): array
    {
        $items = parent::getItems();
        $itemsArray = [];
        foreach ($items as $item) {
            $data = $item->getData();
            $data['customer_id'] = $data['customer_id'] ?? '';
            $itemsArray[] = $data;
        }
        return $itemsArray;
    }
}
