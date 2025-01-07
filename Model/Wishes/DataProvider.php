<?php

namespace Doroshko\WishReward\Model\Wishes;

use Magento\Ui\DataProvider\AbstractDataProvider;
use Doroshko\WishReward\Model\ResourceModel\Wish\CollectionFactory;
use Magento\Framework\App\RequestInterface;

class DataProvider extends AbstractDataProvider
{
    protected $collection;
    private $loadedData;
    private $request;

    public function __construct(
        $name,
        $primaryFieldName,
        $requestFieldName,
        CollectionFactory $collectionFactory,
        RequestInterface $request,
        array $meta = [],
        array $data = []
    ) {
        $this->collection = $collectionFactory->create();
        $this->request = $request;
        parent::__construct($name, $primaryFieldName, $requestFieldName, $meta, $data);
    }

    public function getData(): array
    {
        if (empty($this->loadedData)) {
            $this->loadedData = [
                'totalRecords' => $this->collection->getSize(),
                'items' => []
            ];

            foreach ($this->collection as $item) {
                $data = $item->getData();
                $this->loadedData['items'][] = [
                    'customer_id' => $data['customer_id'] ?? '',
                    'wish_message' => trim(preg_replace('/\s+/', ' ', $data['wish_message'])),
                ];
            }
        }

        return $this->loadedData;
    }
}
