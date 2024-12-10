<?php

namespace Doroshko\WishReward\Setup;

use Magento\Framework\DB\Ddl\Table;
use Magento\Framework\Setup\InstallSchemaInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;

class InstallSchema implements InstallSchemaInterface
{
    public function install(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        $setup->startSetup();

        $table = $setup->getConnection()->newTable(
            $setup->getTable('wishreward_wishes')
        )
            ->addColumn(
                'wish_id',
                Table::TYPE_INTEGER,
                null,
                ['identity' => true, 'unsigned' => true, 'nullable' => false, 'primary' => true],
                'Wish ID'
            )
            ->addColumn(
                'customer_id',
                Table::TYPE_INTEGER,
                null,
                ['unsigned' => true, 'nullable' => true, 'default' => null],
                'Customer ID (null for guests)'
            )
            ->addColumn(
                'wish_message',
                Table::TYPE_TEXT,
                255,
                ['nullable' => false],
                'Wish Message'
            )
            ->addColumn(
                'created_at',
                Table::TYPE_TIMESTAMP,
                null,
                ['nullable' => false, 'default' => Table::TIMESTAMP_INIT],
                'Created At'
            )
            ->addIndex(
                $setup->getIdxName('wishreward_wishes', ['customer_id']),
                ['customer_id']
            )
            ->setComment('WishReward Wishes Table');

        $setup->getConnection()->createTable($table);

        $setup->endSetup();
    }
}
