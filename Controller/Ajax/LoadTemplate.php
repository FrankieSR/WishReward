<?php

namespace Doroshko\wishreward\Controller\Ajax;

use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\View\Result\PageFactory;

class LoadTemplate extends \Magento\Framework\App\Action\Action
{
    protected $jsonFactory;
    protected $pageFactory;

    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        JsonFactory $jsonFactory,
        PageFactory $pageFactory
    ) {
        parent::__construct($context);
        $this->jsonFactory = $jsonFactory;
        $this->pageFactory = $pageFactory;
    }

    public function execute()
    {
        $result = $this->jsonFactory->create();

        try {
            // Рендерим HTML содержимое блока
            $html = $this->_view->getLayout()
                ->createBlock(\Doroshko\wishreward\Block\WishContent::class)
                ->setTemplate('Doroshko_WishReward::wish-content.phtml')
                ->toHtml();

            return $result->setData(['success' => true, 'html' => $html]);
        } catch (\Exception $e) {
            return $result->setData(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
