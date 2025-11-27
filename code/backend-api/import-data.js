const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importData() {
  console.log('开始导入数据...');

  const data = JSON.parse(fs.readFileSync('data-export.json', 'utf-8'));

  // 按顺序导入（注意外键依赖）
  const importOrder = [
    'admins',
    'salespersons',
    'customers',
    'categories',
    'productGroups',
    'productSkus',
    'systemConfigs',
    'orders',
    'orderItems',
    'orderCustomParams',
    'orderParamConfigs',
    'components',
    'homepageFeatured',
    'certifications',
    'subscriptions',
    'partnershipApplications',
    'cartItems',
  ];

  for (const tableName of importOrder) {
    const records = data[tableName] || [];
    if (records.length === 0) {
      console.log(`  ${tableName}: 跳过（无数据）`);
      continue;
    }

    try {
      // 获取 Prisma model 名称（首字母小写，去掉复数）
      const modelName = tableName.endsWith('s')
        ? tableName.slice(0, -1).replace(/ie$/, 'y').replace(/se$/, 's')
        : tableName;

      // 特殊处理一些表名
      const modelMap = {
        'admin': 'admin',
        'salesperson': 'salesperson',
        'customer': 'customer',
        'categorie': 'category',
        'productGroup': 'productGroup',
        'productSku': 'productSku',
        'systemConfig': 'systemConfig',
        'order': 'order',
        'orderItem': 'orderItem',
        'orderCustomParam': 'orderCustomParam',
        'orderParamConfig': 'orderParamConfig',
        'component': 'component',
        'homepageFeatured': 'homepageFeatured',
        'certification': 'certification',
        'subscription': 'subscription',
        'partnershipApplication': 'partnershipApplication',
        'cartItem': 'cartItem',
      };

      const actualModel = modelMap[modelName] || modelName;

      if (!prisma[actualModel]) {
        console.log(`  ${tableName}: 跳过（模型不存在: ${actualModel}）`);
        continue;
      }

      // 逐条插入，处理日期字段
      let successCount = 0;
      for (const record of records) {
        // 转换日期字段
        const processedRecord = {};
        for (const [key, value] of Object.entries(record)) {
          if (value && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
            processedRecord[key] = new Date(value);
          } else {
            processedRecord[key] = value;
          }
        }

        try {
          await prisma[actualModel].upsert({
            where: { id: processedRecord.id },
            update: processedRecord,
            create: processedRecord,
          });
          successCount++;
        } catch (err) {
          console.log(`    警告: ${tableName} 记录 ${processedRecord.id} 导入失败: ${err.message}`);
        }
      }
      console.log(`  ${tableName}: 导入 ${successCount}/${records.length} 条记录`);
    } catch (err) {
      console.log(`  ${tableName}: 导入失败 - ${err.message}`);
    }
  }

  console.log('\n数据导入完成！');
  await prisma.$disconnect();
}

importData().catch(console.error);
