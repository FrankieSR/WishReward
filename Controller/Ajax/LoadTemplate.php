<?php

namespace Doroshko\WishReward\Controller\Ajax;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\View\Element\Template;

class LoadTemplate extends Action
{
    private JsonFactory $jsonFactory;

    public function __construct(
        Context $context,
        JsonFactory $jsonFactory
    ) {
        $this->jsonFactory = $jsonFactory;
        parent::__construct($context);
    }

    public function execute()
    {
        $result = $this->jsonFactory->create();

        try {
            $html = $this->_view->getLayout()
                ->createBlock(\Doroshko\WishReward\Block\WishContent::class)
                ->setTemplate('Doroshko_WishReward::wish-content.phtml')
                ->toHtml();

            return $result->setData(['success' => true, 'html' => $html]);
        } catch (\Exception $e) {
            return $result->setData(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
