const mysql = require('mysql2/promise');

// 部件库 - 中英文对照
const componentLibrary = [
  { zh: '底板39×9/125g', en: 'Base Plate 39×9/125g' },
  { zh: '雪尼尔拖把头42×12cm/75g', en: 'Chenille Mop Head 42×12cm/75g' },
  { zh: '伸缩铁杆(意标)22&25×0.3×68-120/190g', en: 'Telescopic Iron Rod (Italy Standard) 22&25×0.3×68-120/190g' },
  { zh: '全涤珊瑚绒布头', en: 'Full Polyester Coral Fleece Head' },
  { zh: '四孔面板', en: 'Four-Hole Panel' },
  { zh: '超细纤维布头30×40cm/85g', en: 'Microfiber Cloth Head 30×40cm/85g' },
  { zh: '360°旋转接头', en: '360° Rotating Joint' },
  { zh: '加厚海绵层15mm', en: 'Thickened Sponge Layer 15mm' },
  { zh: '不锈钢挤压器', en: 'Stainless Steel Squeezer' },
  { zh: '防滑橡胶手柄', en: 'Non-slip Rubber Handle' },
  { zh: '可拆卸水桶配件', en: 'Detachable Bucket Accessory' },
  { zh: '双面清洁刷头', en: 'Double-sided Cleaning Brush Head' }
];

// 常见产品名称翻译模板
const productNameTemplates = [
  { keywords: ['拖把', '地拖'], en: 'Mop' },
  { keywords: ['清洁', '清洁工具'], en: 'Cleaning Tool' },
  { keywords: ['刷子', '刷'], en: 'Brush' },
  { keywords: ['扫帚'], en: 'Broom' },
  { keywords: ['簸箕'], en: 'Dustpan' },
  { keywords: ['抹布'], en: 'Cleaning Cloth' },
  { keywords: ['海绵'], en: 'Sponge' },
  { keywords: ['桶'], en: 'Bucket' },
  { keywords: ['挤水器'], en: 'Water Squeezer' },
  { keywords: ['旋转'], en: 'Rotating' },
  { keywords: ['平板'], en: 'Flat' },
  { keywords: ['喷雾'], en: 'Spray' }
];

// 根据中文品名生成英文品名
function generateProductNameEn(productNameZh) {
  if (!productNameZh) return 'Cleaning Product';

  // 查找匹配的关键词
  for (const template of productNameTemplates) {
    for (const keyword of template.keywords) {
      if (productNameZh.includes(keyword)) {
        return template.en;
      }
    }
  }

  // 默认返回通用名称
  return 'Cleaning Product';
}

// 随机选择1-4个部件组合成规格
function generateSpecification() {
  const numComponents = Math.floor(Math.random() * 4) + 1; // 1-4个部件
  const shuffled = [...componentLibrary].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numComponents);

  const specZh = selected.map((comp, idx) =>
    `${String.fromCharCode(65 + idx)}:${comp.zh}`
  ).join('\n');

  const specEn = selected.map((comp, idx) =>
    `${String.fromCharCode(65 + idx)}:${comp.en}`
  ).join('\n');

  return { specZh, specEn };
}

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'mingping',
    password: '25884hsY!',
    database: 'mingping_mall'
  });

  try {
    // 获取所有产品SKU
    const [skus] = await connection.execute(
      'SELECT id, product_code, product_name, product_name_en, specification, specification_en FROM product_skus'
    );

    console.log(`找到 ${skus.length} 个产品SKU\n`);

    let updatedCount = 0;

    for (const sku of skus) {
      const updates = [];
      const params = [];

      // 生成品名英文(如果没有)
      if (!sku.product_name_en) {
        const productNameEn = generateProductNameEn(sku.product_name);
        updates.push('product_name_en = ?');
        params.push(productNameEn);
        console.log(`${sku.product_code}:`);
        console.log(`  品名英文: ${productNameEn}`);
      }

      // 生成货品规格(如果没有)
      if (!sku.specification || !sku.specification_en) {
        const { specZh, specEn } = generateSpecification();

        if (!sku.specification) {
          updates.push('specification = ?');
          params.push(specZh);
          console.log(`  货品规格:\n${specZh.split('\n').map(line => '    ' + line).join('\n')}`);
        }

        if (!sku.specification_en) {
          updates.push('specification_en = ?');
          params.push(specEn);
          console.log(`  货品规格英文:\n${specEn.split('\n').map(line => '    ' + line).join('\n')}`);
        }
      }

      // 执行更新
      if (updates.length > 0) {
        params.push(sku.id);
        const sql = `UPDATE product_skus SET ${updates.join(', ')} WHERE id = ?`;
        await connection.execute(sql, params);
        updatedCount++;
        console.log(`  ✅ 已更新\n`);
      } else {
        console.log(`${sku.product_code}: 已有完整数据，跳过\n`);
      }
    }

    console.log(`======================================`);
    console.log(`✅ 完成！共更新 ${updatedCount} 个产品SKU`);
    console.log(`======================================`);

    // 显示更新后的示例数据
    console.log('\n示例数据（前3个）：');
    const [samples] = await connection.execute(
      'SELECT product_code, product_name, product_name_en, specification, specification_en FROM product_skus LIMIT 3'
    );

    samples.forEach(sample => {
      console.log(`\n${sample.product_code}:`);
      console.log(`  品名: ${sample.product_name}`);
      console.log(`  品名英文: ${sample.product_name_en}`);
      console.log(`  货品规格:\n${(sample.specification || '').split('\n').map(line => '    ' + line).join('\n')}`);
      console.log(`  货品规格英文:\n${(sample.specification_en || '').split('\n').map(line => '    ' + line).join('\n')}`);
    });

  } catch (error) {
    console.error('执行失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
