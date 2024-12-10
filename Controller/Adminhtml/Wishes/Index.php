<?php

namespace Doroshko\WishReward\Controller\Adminhtml\Wishes;

use Magento\Backend\App\Action;
use Magento\Framework\View\Result\PageFactory;

class Index extends Action
{
    protected $resultPageFactory;

    public function __construct(
        Action\Context $context,
        PageFactory $resultPageFactory
    ) {
        $this->resultPageFactory = $resultPageFactory;
        parent::__construct($context);
    }

    public function execute()
    {
        $resultPage = $this->resultPageFactory->create();
        $resultPage->setActiveMenu('Doroshko_WishReward::wishreward_wishes');
        $resultPage->getConfig()->getTitle()->prepend(__('Wish List'));
        return $resultPage;
    }
}
