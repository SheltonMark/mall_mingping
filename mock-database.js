const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3001/api';
let ADMIN_TOKEN = '';

// 分类数据
const CATEGORIES = [
  { code: 'MP', nameZh: '组合套装', nameEn: 'Combo Sets' },
  { code: 'TB', nameZh: '拖把类', nameEn: 'Mops' },
  { code: 'T', nameZh: '杆件', nameEn: 'Poles' },
  { code: 'B', nameZh: '拖把头', nameEn: 'Mop Heads' },
  { code: 'S', nameZh: '刷类', nameEn: 'Brushes' },
  { code: 'CG', nameZh: '玻璃&地刮类', nameEn: 'Glass & Floor Squeegees' },
  { code: 'CD', nameZh: '除尘类', nameEn: 'Dusters' },
  { code: 'MB', nameZh: '抹布类', nameEn: 'Cloths' },
  { code: 'QC', nameZh: '车用类', nameEn: 'Car Cleaning' },
  { code: 'CW', nameZh: '宠物类', nameEn: 'Pet Supplies' },
  { code: 'W', nameZh: '外购类', nameEn: 'Outsourced' }
];

// 图片路径
const IMAGE_DIR = 'D:\\mast\\other\\pic';
const IMAGES = [
  'coll1.png', 'coll2.png', 'coll3.png', 'coll4.png',
  'unnamed.png', 'unnamed (1).png', 'unnamed (2).png',
  'unnamed (3).png', 'unnamed (4).png', 'unnamed (5).png'
];

// 首页配置
const HOMEPAGE_CONFIG = {
  hero_title_zh: '专业清洁解决方案',
  hero_title_en: 'Professional Cleaning Solutions',
  hero_subtitle_zh: '为您的家庭和企业提供优质清洁产品',
  hero_subtitle_en: 'Quality cleaning products for your home and business',
  featured_products: JSON.stringify([
    {
      titleZh: '组合套装系列',
      titleEn: 'Combo Sets Collection',
      descriptionZh: '一站式清洁解决方案，满足全方位清洁需求',
      descriptionEn: 'One-stop cleaning solutions for all your needs',
      categoryCode: 'MP'
    },
    {
      titleZh: '拖把系列',
      titleEn: 'Mop Collection',
      descriptionZh: '创新设计，高效清洁，让地板焕然一新',
      descriptionEn: 'Innovative designs for efficient floor cleaning',
      categoryCode: 'TB'
    },
    {
      titleZh: '刷类系列',
      titleEn: 'Brush Collection',
      descriptionZh: '专业清洁工具，应对各种清洁挑战',
      descriptionEn: 'Professional cleaning tools for every challenge',
      categoryCode: 'S'
    },
    {
      titleZh: '车用清洁系列',
      titleEn: 'Car Cleaning Collection',
      descriptionZh: '专业汽车清洁用品，呵护您的爱车',
      descriptionEn: 'Professional car care products for your vehicle',
      categoryCode: 'QC'
    }
  ])
};

// 关于我们配置（完整版本，包含图片）
const ABOUT_CONFIG = {
  // Hero区域
  hero_title_line1_zh: '专业清洁用品制造商',
  hero_title_line1_en: 'Professional Cleaning Products Manufacturer',
  hero_title_line2_zh: '值得信赖的品质',
  hero_title_line2_en: 'Trusted Quality',
  hero_subtitle_zh: '自2010年成立以来，致力于为全球客户提供高品质、创新的清洁解决方案',
  hero_subtitle_en: 'Since 2010, committed to providing high-quality, innovative cleaning solutions to customers worldwide',

  // 品牌故事 - 第一组
  story1_title_zh: '我们的故事',
  story1_title_en: 'Our Story',
  story1_desc1_zh: '明平清洁成立于2010年，是一家专注于研发和生产高品质清洁用品的现代化企业。我们拥有先进的生产基地和专业的研发团队，致力于为客户提供优质的产品和服务。',
  story1_desc1_en: 'Founded in 2010, Mingping Cleaning is a modern enterprise specializing in the R&D and manufacturing of high-quality cleaning supplies. We have advanced production facilities and a professional R&D team, committed to providing customers with excellent products and services.',
  story1_desc2_zh: '经过十余年的发展，我们的产品已远销欧美、东南亚等30多个国家和地区，深受全球客户的信赖与好评。我们始终坚持"质量第一，客户至上"的经营理念，不断创新，追求卓越。',
  story1_desc2_en: 'After more than a decade of development, our products are exported to over 30 countries and regions including Europe, America, and Southeast Asia, earning trust and praise from customers worldwide. We always adhere to the business philosophy of "Quality First, Customer First", continuously innovating and pursuing excellence.',

  // 品牌故事 - 第二组
  story2_title_zh: '质量承诺',
  story2_title_en: 'Quality Commitment',
  story2_desc1_zh: '我们建立了严格的质量控制体系，从原材料采购到生产制造，每一个环节都经过严格把关，确保每一件产品都符合国际质量标准。我们通过了ISO9001质量管理体系认证，产品获得多项国际认证。',
  story2_desc1_en: 'We have established a strict quality control system. From raw material procurement to manufacturing, every step is strictly monitored to ensure that every product meets international quality standards. We are ISO9001 certified, and our products have obtained multiple international certifications.',
  story2_desc2_zh: '持续投入研发，引进先进技术，不断推出符合市场需求的创新产品。我们的研发团队密切关注行业动态和客户需求，致力于为客户创造更大的价值，提供更好的清洁解决方案。',
  story2_desc2_en: 'Continuous R&D investment, introduction of advanced technology, and constant launch of innovative products that meet market demands. Our R&D team closely monitors industry trends and customer needs, dedicated to creating greater value for customers and providing better cleaning solutions.',

  // 联系方式
  contact_email: 'info@mingping-cleaning.com',
  contact_phone: '+86 757 1234 5678',
  contact_address_zh: '中国广东省佛山市南海区 工业园区',
  contact_address_en: 'Industrial Park, Nanhai District, Foshan City, Guangdong Province, China'
};

// 产品模板
const PRODUCT_TEMPLATES = {
  MP: [{ nameZh: '多功能清洁套装', nameEn: 'Multi-Purpose Cleaning Kit', price: 199 }],
  TB: [{ nameZh: '旋转拖把', nameEn: 'Spin Mop', price: 89 }],
  T: [{ nameZh: '伸缩杆', nameEn: 'Telescopic Pole', price: 39 }],
  B: [{ nameZh: '超细纤维拖把头', nameEn: 'Microfiber Mop Head', price: 29 }],
  S: [{ nameZh: '马桶刷', nameEn: 'Toilet Brush', price: 25 }],
  CG: [{ nameZh: '玻璃刮', nameEn: 'Window Squeegee', price: 35 }],
  CD: [{ nameZh: '鸡毛掸子', nameEn: 'Feather Duster', price: 15 }],
  MB: [{ nameZh: '超细纤维抹布', nameEn: 'Microfiber Cloth', price: 12 }],
  QC: [{ nameZh: '汽车清洁套装', nameEn: 'Car Cleaning Kit', price: 89 }],
  CW: [{ nameZh: '宠物毛发清理器', nameEn: 'Pet Hair Remover', price: 39 }],
  W: [{ nameZh: '外购清洁用品', nameEn: 'Outsourced Cleaning Supplies', price: 50 }]
};

// 登录
async function loginAdmin() {
  console.log('\n[步骤1] 管理员登录...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123456'
    });
    ADMIN_TOKEN = response.data.access_token;
    console.log(`  ✅ 登录成功! Token: ${ADMIN_TOKEN.substring(0, 20)}...`);
    return true;
  } catch (error) {
    console.log(`  ❌ 登录失败:`, error.response?.data || error.message);
    return false;
  }
}

// 上传图片
async function uploadImage(imagePath) {
  if (!fs.existsSync(imagePath)) {
    console.log(`    ⚠️ 图片不存在: ${imagePath}`);
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));

    const response = await axios.post(`${API_BASE_URL}/upload/single`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    console.log(`    ✅ 上传: ${path.basename(imagePath)} -> ${response.data.url}`);
    return response.data.url;
  } catch (error) {
    console.log(`    ❌ 上传失败:`, error.response?.data || error.message);
    return null;
  }
}

// 创建分类
async function createCategories() {
  console.log('\n[步骤3] 创建分类...');
  let successCount = 0;

  for (const cat of CATEGORIES) {
    try {
      await axios.post(`${API_BASE_URL}/products/categories`, cat, {
        headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
      });
      console.log(`  ✅ 创建: ${cat.code} - ${cat.nameZh}`);
      successCount++;
    } catch (error) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
        console.log(`  ⚠️ 已存在: ${cat.code} - ${cat.nameZh}`);
        successCount++;
      } else {
        console.log(`  ❌ 失败: ${cat.code} -`, error.response?.data || error.message);
      }
    }
  }

  console.log(`  总计: ${successCount}/${CATEGORIES.length} 个分类`);
  return successCount;
}

// 更新首页配置
async function updateHomepageConfig() {
  console.log('\n[步骤4] 更新首页配置...');
  try {
    await axios.put(`${API_BASE_URL}/system/homepage`, HOMEPAGE_CONFIG, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    console.log('  ✅ 首页配置更新成功');
    return true;
  } catch (error) {
    console.log('  ❌ 失败:', error.response?.data || error.message);
    return false;
  }
}

// 更新关于我们配置（包含图片上传）
async function updateAboutConfig(uploadedImages) {
  console.log('\n[步骤5] 更新关于我们配置...');
  try {
    // 为关于我们页面添加图片
    const configWithImages = {
      ...ABOUT_CONFIG,
      hero_image: uploadedImages[0],  // Hero区域背景图
      story1_image: uploadedImages[1],  // 品牌故事第一组配图
      story2_image: uploadedImages[2]   // 品牌故事第二组配图
    };

    await axios.put(`${API_BASE_URL}/system/about`, configWithImages, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    console.log('  ✅ 关于我们配置更新成功（包含3张图片）');
    return true;
  } catch (error) {
    console.log('  ❌ 失败:', error.response?.data || error.message);
    return false;
  }
}

// 创建产品组
async function createProductGroup(categoryCode, prefixNum, nameZh, nameEn, imageUrl) {
  const prefix = `${categoryCode}${String(prefixNum).padStart(3, '0')}`;

  try {
    const response = await axios.post(`${API_BASE_URL}/products/groups`, {
      prefix,
      groupNameZh: nameZh,
      groupNameEn: nameEn,
      categoryCode
    }, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });

    console.log(`    ✅ 产品组: ${prefix} - ${nameZh}`);
    return response.data.id;
  } catch (error) {
    console.log(`    ❌ 失败:`, error.response?.data || error.message);
    return null;
  }
}

// 创建SKU
async function createSKU(groupId, productCode, name, price, imageUrls) {
  try {
    await axios.post(`${API_BASE_URL}/products/skus`, {
      productCode,
      productName: name,
      price: price,
      groupId,
      status: 'ACTIVE',
      images: imageUrls,
      productSpec: [],
      additionalAttributes: []
    }, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });

    console.log(`      ✅ SKU: ${productCode} - ${name} (¥${price})`);
    return true;
  } catch (error) {
    console.log(`      ❌ 失败:`, error.response?.data || error.message);
    return false;
  }
}

// 主函数
async function generateMockData() {
  console.log('='.repeat(60));
  console.log('🚀 Mock数据生成脚本 (Node.js版)');
  console.log('='.repeat(60));

  // 1. 登录
  if (!await loginAdmin()) {
    console.log('\n❌ 登录失败，停止执行');
    return;
  }

  // 2. 上传图片
  console.log('\n[步骤2] 上传图片...');
  const uploadedImages = [];
  for (const img of IMAGES.slice(0, 5)) {
    const imgPath = path.join(IMAGE_DIR, img);
    const url = await uploadImage(imgPath);
    if (url) uploadedImages.push(url);
  }

  if (uploadedImages.length === 0) {
    console.log('  ❌ 没有成功上传的图片，停止执行');
    return;
  }
  console.log(`  ✅ 成功上传 ${uploadedImages.length} 张图片`);

  // 3. 创建分类
  const catCount = await createCategories();

  // 4-5. 更新配置
  await updateHomepageConfig();
  await updateAboutConfig(uploadedImages);  // 传递图片数组

  // 6. 创建产品
  console.log('\n[步骤6] 创建产品...');
  let imgIndex = 0;
  let skuCounter = 1;
  let productCount = 0;

  for (const [catCode, products] of Object.entries(PRODUCT_TEMPLATES)) {
    console.log(`\n  分类 ${catCode}:`);

    for (let productIndex = 0; productIndex < products.length; productIndex++) {
      const product = products[productIndex];
      const imageUrl = uploadedImages[imgIndex % uploadedImages.length];
      imgIndex++;

      const groupId = await createProductGroup(
        catCode,
        productIndex + 1,
        product.nameZh,
        product.nameEn,
        imageUrl
      );

      if (groupId) {
        const productCode = `C10.${String(productIndex + 1).padStart(2, '0')}.${String(skuCounter).padStart(4, '0')}`;
        skuCounter++;

        if (await createSKU(groupId, productCode, product.nameZh, product.price, [imageUrl])) {
          productCount++;
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Mock数据生成完成!');
  console.log('='.repeat(60));
  console.log('📊 统计:');
  console.log(`  - 分类: ${catCount} 个`);
  console.log(`  - 图片: ${uploadedImages.length} 张`);
  console.log(`  - 产品: ${productCount} 个`);
  console.log('='.repeat(60));
}

// 运行
generateMockData().catch(error => {
  console.error('\n❌ 致命错误:', error);
  process.exit(1);
});
