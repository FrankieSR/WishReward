<?php

declare(strict_types=1);

namespace Doroshko\WishReward\Controller\Adminhtml\Wishes;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Controller\Result\Redirect;
use Magento\Framework\Controller\Result\RedirectFactory;
use Doroshko\WishReward\Model\WishesFactory;
use Magento\Framework\Message\ManagerInterface;

class Delete extends Action
{
    private const ADMIN_RESOURCE = 'Doroshko_WishReward::wishes';

    /**
     * @var WishesFactory
     */
    private WishesFactory $wishesFactory;

    /**
     * @var RedirectFactory
     */
    private RedirectFactory $resultRedirectFactory;

    /**
     * @var ManagerInterface
     */
    protected ManagerInterface $messageManager;

    public function __construct(
        Context $context,
        WishesFactory $wishesFactory,
        ManagerInterface $messageManager
    ) {
        parent::__construct($context);
        $this->wishesFactory = $wishesFactory;
        $this->messageManager = $messageManager;
    }

    public function execute(): Redirect
    {
        $wishId = (int)$this->getRequest()->getParam('wish_id');

        if (!$wishId) {
            $this->messageManager->addErrorMessage(__('Invalid wish ID.'));
            return $this->resultRedirectFactory->create()->setPath('*/*/index');
        }

        try {
            $wish = $this->wishesFactory->create()->load($wishId);

            if (!$wish->getId()) {
                $this->messageManager->addErrorMessage(__('The wish no longer exists.'));
            } else {
                $wish->delete();
                $this->messageManager->addSuccessMessage(__('The wish has been successfully deleted.'));
            }
        } catch (\Exception $e) {
            $this->messageManager->addErrorMessage(__('An error occurred while deleting the wish.'));
        }

        return $this->resultRedirectFactory->create()->setPath('*/*/index');
    }
}
