<?php

declare(strict_types=1);

namespace Doroshko\WishReward\Controller\Ajax;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\Result\Json as ResultJson;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\View\Result\PageFactory;

class LoadTemplate extends Action
{
    /**
     * @var JsonFactory
     */
    private JsonFactory $resultJsonFactory;

    /**
     * @var PageFactory
     */
    private PageFactory $resultPageFactory;

    public function __construct(
        Context      $context,
        JsonFactory  $resultJsonFactory,
        PageFactory  $resultPageFactory
    ) {
        parent::__construct($context);
        $this->resultJsonFactory = $resultJsonFactory;
        $this->resultPageFactory = $resultPageFactory;
    }

    public function execute(): ResultJson
    {
        $resultPage = $this->resultPageFactory->create();
        $resultPage->addHandle('wishreward_ajax_loadtemplate');

        $block = $resultPage->getLayout()->getBlock('wishreward.content');
        $blockHtml = $block ? $block->toHtml() : '';

        /** @var ResultJson $resultJson */
        $resultJson = $this->resultJsonFactory->create();
        $resultJson->setData(['html' => $blockHtml]);

        return $resultJson;
    }
}
