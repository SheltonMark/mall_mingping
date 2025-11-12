#!/usr/bin/env node

/**
 * 批量为产品分配图片脚本
 *
 * 功能：
 * 1. 连接MySQL数据库
 * 2. 获取所有product_skus
 * 3. 扫描 /root/mall_mingping/code/backend-api/uploads/images/ 目录
 * 4. 为每个SKU随机分配5张图片
 * 5. 更新数据库的 images 字段（JSON数组）
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '25884hsY!',
  database: 'mingping_mall'
};

// 图片目录路径
const IMAGES_DIR = '/root/mall_mingping/code/backend-api/uploads/images/';

// 随机打乱数组
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 主函数
async function main() {
  let connection;

  try {
    console.log('📦 批量分配产品图片脚本');
    console.log('================================\n');

    // 1. 连接数据库
    console.log('🔌 连接数据库...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功\n');

    // 2. 获取所有产品SKU
    console.log('📊 查询产品SKU...');
    const [skus] = await connection.execute(
      'SELECT id, product_code FROM product_skus'
    );
    console.log(`✅ 找到 ${skus.length} 个产品SKU\n`);

    if (skus.length === 0) {
      console.log('⚠️  没有产品需要更新');
      return;
    }

    // 3. 扫描图片目录
    console.log('🖼️  扫描图片目录...');
    if (!fs.existsSync(IMAGES_DIR)) {
      console.error('❌ 图片目录不存在:', IMAGES_DIR);
      process.exit(1);
    }

    const allFiles = fs.readdirSync(IMAGES_DIR);
    const imageFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    console.log(`✅ 找到 ${imageFiles.length} 张图片\n`);

    if (imageFiles.length === 0) {
      console.error('❌ 没有可用的图片文件');
      process.exit(1);
    }

    // 4. 为每个产品分配图片
    console.log('🔄 开始分配图片...\n');
    let successCount = 0;
    let failCount = 0;

    for (const sku of skus) {
      try {
        // 随机选择5张图片（可以重复）
        const shuffled = shuffleArray(imageFiles);
        const selectedImages = shuffled.slice(0, 5);

        // 构建图片路径数组（数据库存储相对路径）
        const imagePaths = selectedImages.map(filename => `/uploads/images/${filename}`);

        // 更新数据库
        await connection.execute(
          'UPDATE product_skus SET images = ? WHERE id = ?',
          [JSON.stringify(imagePaths), sku.id]
        );

        successCount++;
        console.log(`✅ [${successCount}/${skus.length}] ${sku.product_code}: 已分配 ${imagePaths.length} 张图片`);
      } catch (error) {
        failCount++;
        console.error(`❌ [${successCount + failCount}/${skus.length}] ${sku.product_code}: 失败 - ${error.message}`);
      }
    }

    // 5. 显示统计结果
    console.log('\n================================');
    console.log('📊 统计结果:');
    console.log(`✅ 成功: ${successCount} 个产品`);
    console.log(`❌ 失败: ${failCount} 个产品`);
    console.log(`📁 图片库大小: ${imageFiles.length} 张`);
    console.log(`📦 每个产品分配: 5 张图片`);
    console.log('================================\n');

    // 6. 验证一下更新结果
    console.log('🔍 验证更新结果...');
    const [sampleSkus] = await connection.execute(
      'SELECT product_code, images FROM product_skus LIMIT 3'
    );

    console.log('\n前3个产品的图片数据:');
    sampleSkus.forEach(sku => {
      const images = JSON.parse(sku.images || '[]');
      console.log(`  ${sku.product_code}: ${images.length} 张图片`);
      if (images.length > 0) {
        console.log(`    - ${images[0]}`);
      }
    });

  } catch (error) {
    console.error('\n❌ 发生错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 运行主函数
main();
