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

// 图片路径（Windows格式）
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
    { titleZh: '组合套装系列', titleEn: 'Combo Sets Collection',
      descriptionZh: '一站式清洁解决方案，满足全方位清洁需求',
      descriptionEn: 'One-stop cleaning solutions for all your needs',
      categoryCode: 'MP' },
    { titleZh: '拖把系列', titleEn: 'Mop Collection',
      descriptionZh: '创新设计，高效清洁，让地板焕然一新',
      descriptionEn: 'Innovative designs for efficient floor cleaning',
      categoryCode: 'TB' },
    { titleZh: '刷类系列', titleEn: 'Brush Collection',
      descriptionZh: '专业清洁工具，应对各种清洁挑战',
      descriptionEn: 'Professional cleaning tools for every challenge',
      categoryCode: 'S' },
    { titleZh: '车用清洁系列', titleEn: 'Car Cleaning Collection',
      descriptionZh: '专业汽车清洁用品，呵护您的爱车',
      descriptionEn: 'Professional car care products for your vehicle',
      categoryCode: 'QC' }
  ])
};

// 关于我们配置
const ABOUT_CONFIG = {
  hero_title_line1_zh: '专业清洁用品制造商',
  hero_title_line1_en: 'Professional Cleaning Products Manufacturer',
  hero_title_line2_zh: '值得信赖的品质',
  hero_title_line2_en: 'Trusted Quality',
  hero_subtitle_zh: '自2010年成立以来，致力于为全球客户提供高品质、创新的清洁解决方案',
  hero_subtitle_en: 'Since 2010, committed to providing high-quality, innovative cleaning solutions to customers worldwide',
  story1_title_zh: '我们的故事',
  story1_title_en: 'Our Story',
  story1_desc1_zh: '明平清洁成立于2010年，是一家专注于研发和生产高品质清洁用品的现代化企业。我们拥有先进的生产基地和专业的研发团队，致力于为客户提供优质的产品和服务。',
  story1_desc1_en: 'Founded in 2010, Mingping Cleaning is a modern enterprise specializing in the R&D and manufacturing of high-quality cleaning supplies.',
  story1_desc2_zh: '经过十余年的发展，我们的产品已远销欧美、东南亚等30多个国家和地区，深受全球客户的信赖与好评。',
  story1_desc2_en: 'After more than a decade of development, our products are exported to over 30 countries worldwide.',
  story2_title_zh: '质量承诺',
  story2_title_en: 'Quality Commitment',
  story2_desc1_zh: '我们建立了严格的质量控制体系，从原材料采购到生产制造，每一个环节都经过严格把关。',
  story2_desc1_en: 'We have established a strict quality control system from raw materials to manufacturing.',
  story2_desc2_zh: '持续投入研发，引进先进技术，不断推出符合市场需求的创新产品。',
  story2_desc2_en: 'Continuous R&D investment and introduction of advanced technology.',
  contact_email: 'info@mingping-cleaning.com',
  contact_phone: '+86 757 1234 5678',
  contact_address_zh: '中国广东省佛山市南海区 工业园区',
  contact_address_en: 'Industrial Park, Nanhai District, Foshan City, Guangdong Province, China'
};

// 产品模板 - 每个产品组包含多个SKU
const PRODUCT_TEMPLATES = {
  MP: {
    groupNameZh: '清洁套装系列',
    groupNameEn: 'Cleaning Set Series',
    skus: [
      {
        suffix: '001',
        nameZh: '标准款',
        nameEn: 'Standard',
        price: 199,
        spec: '伸缩杆Φ19/22*0.27mm*1200mm | 意标螺纹',
        productSpec: [
          { code: 'A', name: '伸缩杆', spec: 'Φ19/22*0.27mm*1200mm', parts: ['喷塑', '塑件'] },
          { code: 'B', name: '拖把', spec: '39*9cm', parts: ['四孔面板', '雪尼尔拖把布头'] },
          { code: 'C', name: '香刷', spec: '两用刷型', parts: ['TPR刷毛', '黑色'] }
        ],
        colorSchemes: [
          { id: 'scheme-1', name: '方案1', colors: [
            { componentCode: 'A', colors: [
              { part: '喷塑', color: '3C冷灰', hexColor: '#3C3C3C' },
              { part: '塑件', color: '10C冷灰', hexColor: '#10C010' }
            ]},
            { componentCode: 'B', colors: [
              { part: '四孔面板', color: '雪尼尔:10C冷灰', hexColor: '#10C010' },
              { part: '雪尼尔拖把布头', color: '白色', hexColor: '#FFFFFF' }
            ]},
            { componentCode: 'C', colors: [
              { part: 'TPR刷毛', color: '黑色', hexColor: '#000000' },
              { part: '黑色', color: '黑色', hexColor: '#000000' }
            ]}
          ]},
          { id: 'scheme-2', name: '方案2', colors: [
            { componentCode: 'A', colors: [
              { part: '喷塑', color: '黑色', hexColor: '#000000' },
              { part: '塑件', color: '白色', hexColor: '#FFFFFF' }
            ]},
            { componentCode: 'B', colors: [
              { part: '四孔面板', color: '白色', hexColor: '#FFFFFF' },
              { part: '雪尼尔拖把布头', color: '蓝色', hexColor: '#0000FF' }
            ]},
            { componentCode: 'C', colors: [
              { part: 'TPR刷毛', color: '白色', hexColor: '#FFFFFF' },
              { part: '黑色', color: '白色', hexColor: '#FFFFFF' }
            ]}
          ]}
        ]
      },
      {
        suffix: '002',
        nameZh: '豪华款',
        nameEn: 'Deluxe',
        price: 299,
        spec: 'A款主杆: 总长61cm, 总重120g',
        productSpec: [
          { code: 'A', name: '伸缩杆', spec: '总长61cm,总重120g', parts: ['喷塑', '手柄杆'] },
          { code: 'B', name: '小圆刷', spec: '14-4105TPG(灰色)', parts: ['主撑毛', '毛撑心'] },
          { code: 'C', name: '香刷', spec: '±18-3929TPG(浅灰+18-3929TPG(浅灰)包胶', parts: ['再生PE%'] }
        ],
        colorSchemes: [
          { id: 'scheme-1', name: '方案1', colors: [
            { componentCode: 'A', colors: [
              { part: '喷塑', color: '手柄杆', hexColor: '#808080' },
              { part: '手柄杆', color: '小圆刷', hexColor: '#A0A0A0' }
            ]},
            { componentCode: 'B', colors: [
              { part: '主撑毛', color: '14-4105TPG(灰色)', hexColor: '#505050' },
              { part: '毛撑心', color: '25*7.5cm', hexColor: '#606060' }
            ]},
            { componentCode: 'C', colors: [
              { part: '再生PE%', color: '1*(4105TPG(灰色)', hexColor: '#707070' }
            ]}
          ]}
        ]
      },
      {
        suffix: '003',
        nameZh: '高级款',
        nameEn: 'Premium',
        price: 399,
        spec: '高级配置 - 全套清洁工具',
        productSpec: [
          { code: 'A', name: '伸缩杆', spec: 'Φ22/25mm', parts: ['喷塑', '塑件'] },
          { code: 'B', name: '拖把', spec: '加大款', parts: ['拖把头'] }
        ],
        colorSchemes: [
          { id: 'scheme-1', name: '方案1', colors: [
            { componentCode: 'A', colors: [
              { part: '喷塑', color: '银色', hexColor: '#C0C0C0' },
              { part: '塑件', color: '金色', hexColor: '#FFD700' }
            ]},
            { componentCode: 'B', colors: [
              { part: '拖把头', color: '蓝色', hexColor: '#0000FF' }
            ]}
          ]}
        ]
      }
    ]
  },
  TB: {
    groupNameZh: '旋转拖把',
    groupNameEn: 'Spin Mop',
    skus: [
      {
        suffix: '001',
        nameZh: '标准旋转拖把',
        nameEn: 'Standard Spin Mop',
        price: 89,
        spec: '拖把头直径30cm',
        productSpec: [
          { code: 'A', name: '杆件', spec: '伸缩杆1.2m', parts: ['铝杆', '塑料手柄'] },
          { code: 'B', name: '拖把头', spec: '直径30cm', parts: ['超细纤维'] }
        ],
        colorSchemes: [
          { id: 'scheme-1', name: '方案1', colors: [
            { componentCode: 'A', colors: [
              { part: '铝杆', color: '银色', hexColor: '#C0C0C0' },
              { part: '塑料手柄', color: '蓝色', hexColor: '#0000FF' }
            ]},
            { componentCode: 'B', colors: [
              { part: '超细纤维', color: '白色', hexColor: '#FFFFFF' }
            ]}
          ]},
          { id: 'scheme-2', name: '方案2', colors: [
            { componentCode: 'A', colors: [
              { part: '铝杆', color: '金色', hexColor: '#FFD700' },
              { part: '塑料手柄', color: '红色', hexColor: '#FF0000' }
            ]},
            { componentCode: 'B', colors: [
              { part: '超细纤维', color: '粉色', hexColor: '#FFC0CB' }
            ]}
          ]}
        ]
      },
      {
        suffix: '002',
        nameZh: '加强版旋转拖把',
        nameEn: 'Enhanced Spin Mop',
        price: 129,
        spec: '加厚拖把头，更耐用',
        productSpec: [
          { code: 'A', name: '杆件', spec: '伸缩杆1.5m', parts: ['不锈钢杆', '橡胶手柄'] },
          { code: 'B', name: '拖把头', spec: '直径35cm', parts: ['加厚纤维'] }
        ],
        colorSchemes: [
          { id: 'scheme-1', name: '方案1', colors: [
            { componentCode: 'A', colors: [
              { part: '不锈钢杆', color: '亮银', hexColor: '#E0E0E0' },
              { part: '橡胶手柄', color: '黑色', hexColor: '#000000' }
            ]},
            { componentCode: 'B', colors: [
              { part: '加厚纤维', color: '灰色', hexColor: '#808080' }
            ]}
          ]}
        ]
      }
    ]
  }
};

// 测试用户数据
const TEST_USERS = [
  {
    username: 'customer1',
    password: 'password123',
    email: 'customer1@example.com',
    phone: '13800138001',
    companyName: '广州清洁用品有限公司',
    tier: 'STANDARD'
  },
  {
    username: 'customer2',
    password: 'password123',
    email: 'customer2@example.com',
    phone: '13800138002',
    companyName: '深圳清洁服务公司',
    tier: 'VIP'
  },
  {
    username: 'customer3',
    password: 'password123',
    email: 'customer3@example.com',
    phone: '13800138003',
    companyName: '佛山明平清洁',
    tier: 'SVIP'
  }
];

// 登录管理员
async function loginAdmin() {
  console.log('\n[步骤1] 管理员登录...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123456'
    });
    ADMIN_TOKEN = response.data.access_token;
    console.log(`  ✅ 登录成功!`);
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

    console.log(`    ✅ 上传: ${path.basename(imagePath)}`);
    return response.data.url;
  } catch (error) {
    console.log(`    ❌ 上传失败:`, error.message);
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
      console.log(`  ✅ ${cat.code} - ${cat.nameZh}`);
      successCount++;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`  ⚠️ 已存在: ${cat.code}`);
        successCount++;
      }
    }
  }

  console.log(`  总计: ${successCount}/${CATEGORIES.length}`);
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
    console.log('  ❌ 失败:', error.message);
    return false;
  }
}

// 更新关于我们配置
async function updateAboutConfig(uploadedImages) {
  console.log('\n[步骤5] 更新关于我们配置...');
  try {
    const configWithImages = {
      ...ABOUT_CONFIG,
      hero_image: uploadedImages[0],
      story1_image: uploadedImages[1],
      story2_image: uploadedImages[2]
    };

    await axios.put(`${API_BASE_URL}/system/about`, configWithImages, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    console.log('  ✅ 关于我们配置更新成功（含3张图片）');
    return true;
  } catch (error) {
    console.log('  ❌ 失败:', error.message);
    return false;
  }
}

// 创建产品组
async function createProductGroup(categoryCode, groupName, images) {
  try {
    const response = await axios.post(`${API_BASE_URL}/products/groups`, {
      prefix: `${categoryCode}001`,
      groupNameZh: groupName.zh,
      groupNameEn: groupName.en,
      categoryCode
    }, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });

    console.log(`    ✅ 产品组: ${categoryCode}001 - ${groupName.zh}`);
    return response.data.id;
  } catch (error) {
    console.log(`    ❌ 失败:`, error.message);
    return null;
  }
}

// 创建SKU
async function createSKU(groupId, categoryCode, sku, images) {
  try {
    // 准备颜色属性数据
    const additionalAttributes = sku.colorSchemes.map(scheme => ({
      componentCode: scheme.colors[0].componentCode,
      colorSchemes: [{
        id: scheme.id,
        name: scheme.name,
        colors: scheme.colors[0].colors
      }]
    }));

    const response = await axios.post(`${API_BASE_URL}/products/skus`, {
      productCode: `${categoryCode}001-${sku.suffix}`,
      productName: sku.nameZh,
      title: sku.nameEn,
      specification: sku.spec,
      price: sku.price,
      groupId,
      status: 'ACTIVE',
      images: images,
      productSpec: sku.productSpec,
      additionalAttributes: additionalAttributes
    }, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });

    console.log(`      ✅ SKU: ${categoryCode}001-${sku.suffix} - ${sku.nameZh} (¥${sku.price})`);
    return response.data;
  } catch (error) {
    console.log(`      ❌ SKU失败:`, error.response?.data?.message || error.message);
    return null;
  }
}

// 创建测试用户
async function createTestUsers() {
  console.log('\n[步骤7] 创建测试用户...');
  const createdUsers = [];

  for (const user of TEST_USERS) {
    try {
      const response = await axios.post(`${API_BASE_URL}/customers`, {
        username: user.username,
        password: user.password,
        email: user.email,
        phone: user.phone,
        companyName: user.companyName,
        tier: user.tier,
        status: 'ACTIVE'
      }, {
        headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
      });

      console.log(`  ✅ 用户: ${user.username} (${user.tier})`);
      createdUsers.push(response.data);
    } catch (error) {
      console.log(`  ⚠️ 用户已存在: ${user.username}`);
    }
  }

  return createdUsers;
}

// 主函数
async function generateMockData() {
  console.log('='.repeat(60));
  console.log('🚀 完整Mock数据生成脚本');
  console.log('='.repeat(60));

  // 1. 登录
  if (!await loginAdmin()) {
    return;
  }

  // 2. 上传图片
  console.log('\n[步骤2] 上传图片...');
  const uploadedImages = [];
  for (const img of IMAGES) {
    const imgPath = path.join(IMAGE_DIR, img);
    const url = await uploadImage(imgPath);
    if (url) uploadedImages.push(url);
  }

  if (uploadedImages.length === 0) {
    console.log('  ❌ 没有成功上传的图片');
    return;
  }
  console.log(`  ✅ 成功上传 ${uploadedImages.length} 张图片`);

  // 3-5. 创建配置
  await createCategories();
  await updateHomepageConfig();
  await updateAboutConfig(uploadedImages);

  // 6. 创建产品
  console.log('\n[步骤6] 创建产品（多SKU + 多图片 + 组件配置）...');

  let productCount = 0;
  let skuCount = 0;

  // 创建MP系列
  if (PRODUCT_TEMPLATES.MP) {
    const mpTemplate = PRODUCT_TEMPLATES.MP;
    console.log(`\n  分类 MP - ${mpTemplate.groupNameZh}:`);

    const groupId = await createProductGroup('MP', {
      zh: mpTemplate.groupNameZh,
      en: mpTemplate.groupNameEn
    }, uploadedImages.slice(0, 3));

    if (groupId) {
      productCount++;
      for (const sku of mpTemplate.skus) {
        // 为每个SKU分配3-4张图片
        const skuImages = uploadedImages.slice(0, 4);
        const created = await createSKU(groupId, 'MP', sku, skuImages);
        if (created) skuCount++;
      }
    }
  }

  // 创建TB系列
  if (PRODUCT_TEMPLATES.TB) {
    const tbTemplate = PRODUCT_TEMPLATES.TB;
    console.log(`\n  分类 TB - ${tbTemplate.groupNameZh}:`);

    const groupId = await createProductGroup('TB', {
      zh: tbTemplate.groupNameZh,
      en: tbTemplate.groupNameEn
    }, uploadedImages.slice(0, 3));

    if (groupId) {
      productCount++;
      for (const sku of tbTemplate.skus) {
        const skuImages = uploadedImages.slice(0, 3);
        const created = await createSKU(groupId, 'TB', sku, skuImages);
        if (created) skuCount++;
      }
    }
  }

  // 7. 创建测试用户
  await createTestUsers();

  console.log('\n' + '='.repeat(60));
  console.log('✅ Mock数据生成完成!');
  console.log('='.repeat(60));
  console.log(`📊 统计:`);
  console.log(`  - 分类: ${CATEGORIES.length} 个`);
  console.log(`  - 图片: ${uploadedImages.length} 张`);
  console.log(`  - 产品组: ${productCount} 个`);
  console.log(`  - SKU: ${skuCount} 个`);
  console.log(`  - 用户: ${TEST_USERS.length} 个`);
  console.log(`  - 配置: 首页 + 关于我们（含图片）`);
  console.log('='.repeat(60));
}

generateMockData().catch(error => {
  console.error('\n❌ 致命错误:', error);
  process.exit(1);
});
