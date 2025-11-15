/**
 * 为所有产品系列（product_groups）添加附加属性数据
 * 运行方式: node add-optional-attributes.js
 */

const mysql = require('mysql2/promise');

// 数据库连接配置（服务器本地）
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '25884hsY!',
  database: 'lemopx'
};

// 附加属性模板（中英文双语）
const attributeTemplates = [
  { nameZh: '全部5C冷灰', nameEn: 'All 5C Cool Gray' },
  { nameZh: '全部12C冷灰', nameEn: 'All 12C Cool Gray' },
  { nameZh: '全部432C深蓝', nameEn: 'All 432C Deep Blue' },
  { nameZh: '手柄/按钮571C 其他全部:12C', nameEn: 'Handle/Button 571C Others: 12C' },
  { nameZh: '手柄/按钮432C 其他全部:5C', nameEn: 'Handle/Button 432C Others: 5C' },
  { nameZh: '三角链接571C 其他全部:432C', nameEn: 'Triangle Link 571C Others: 432C' },
];

async function addOptionalAttributes() {
  let connection;

  try {
    console.log('🔌 连接到数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 获取所有产品系列
    const [groups] = await connection.execute(
      'SELECT id, prefix, group_name_zh, optional_attributes FROM product_groups ORDER BY created_at'
    );

    console.log(`📦 找到 ${groups.length} 个产品系列\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const group of groups) {
      // 检查是否已有附加属性
      let existingAttrs = [];
      if (group.optional_attributes) {
        try {
          existingAttrs = JSON.parse(group.optional_attributes);
          if (Array.isArray(existingAttrs) && existingAttrs.length > 0) {
            console.log(`⏭️  跳过 ${group.prefix} - ${group.group_name_zh} (已有 ${existingAttrs.length} 个属性)`);
            skippedCount++;
            continue;
          }
        } catch (e) {
          console.log(`⚠️  ${group.prefix} - 解析现有属性失败，将重新设置`);
        }
      }

      // 随机选择3-5个属性
      const numAttrs = Math.floor(Math.random() * 3) + 3; // 3-5个
      const shuffled = [...attributeTemplates].sort(() => Math.random() - 0.5);
      const selectedAttrs = shuffled.slice(0, numAttrs);

      // 更新数据库
      await connection.execute(
        'UPDATE product_groups SET optional_attributes = ? WHERE id = ?',
        [JSON.stringify(selectedAttrs), group.id]
      );

      console.log(`✅ ${group.prefix} - ${group.group_name_zh}`);
      console.log(`   添加了 ${selectedAttrs.length} 个属性:`);
      selectedAttrs.forEach((attr, idx) => {
        console.log(`   ${idx + 1}. ${attr.nameZh} / ${attr.nameEn}`);
      });
      console.log('');

      updatedCount++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 执行摘要:');
    console.log(`   ✅ 更新: ${updatedCount} 个产品系列`);
    console.log(`   ⏭️  跳过: ${skippedCount} 个产品系列 (已有数据)`);
    console.log(`   📦 总计: ${groups.length} 个产品系列`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ 错误:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行脚本
addOptionalAttributes()
  .then(() => {
    console.log('\n✅ 脚本执行完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error);
    process.exit(1);
  });
