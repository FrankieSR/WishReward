<?php

namespace Doroshko\WishReward\Controller\Adminhtml\Wishes;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Doroshko\WishReward\Model\ResourceModel\Wish\CollectionFactory;

class MassDelete extends Action
{
    private $collectionFactory;

    public function __construct(
        Context $context,
        CollectionFactory $collectionFactory
    ) {
        parent::__construct($context);
        $this->collectionFactory = $collectionFactory;
    }

    public function execute()
    {
        $selectedIds = $this->getRequest()->getParam('selected', []);
        $excludedIds = $this->getRequest()->getParam('excluded', []);

        try {
            if (empty($selectedIds) && empty($excludedIds)) {
                $this->messageManager->addErrorMessage(__('No items selected.'));
                return $this->resultRedirectFactory->create()->setPath('*/*/index');
            }

            $collection = $this->collectionFactory->create();

            if (!empty($excludedIds)) {
                $collection->addFieldToFilter('wish_id', ['nin' => $excludedIds]);
            } elseif (!empty($selectedIds)) {
                $collection->addFieldToFilter('wish_id', ['in' => $selectedIds]);
            }

            $deletedCount = 0;
            foreach ($collection as $item) {
                $item->delete();
                $deletedCount++;
            }

            if ($deletedCount > 0) {
                $this->messageManager->addSuccessMessage(__('A total of %1 record(s) have been deleted.', $deletedCount));
            } else {
                $this->messageManager->addErrorMessage(__('No items were deleted.'));
            }
        } catch (\Exception $e) {
            $this->messageManager->addErrorMessage(__('An error occurred while deleting the wishes.'));
        }

        return $this->resultRedirectFactory->create()->setPath('*/*/index');
    }
}
