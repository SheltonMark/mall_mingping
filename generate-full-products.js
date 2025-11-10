const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3001/api';
let ADMIN_TOKEN = '';

// 图片和视频路径
const IMAGE_DIR = 'D:\\mast\\other\\pic';
const VIDEO_PATH = 'D:\\mast\\other\\pic\\test.mp4';
const IMAGES = [
  'coll1.png', 'coll2.png', 'coll3.png', 'coll4.png',
  'unnamed.png', 'unnamed (1).png', 'unnamed (2).png',
  'unnamed (3).png', 'unnamed (4).png', 'unnamed (5).png',
  '首页.png',  // 第11张
  'coll1.png'  // 第12张 (重复使用第一张)
];

// 颜色库
const COLORS = [
  { name: '黑色', hex: '#000000' },
  { name: '白色', hex: '#FFFFFF' },
  { name: '灰色', hex: '#808080' },
  { name: '银色', hex: '#C0C0C0' },
  { name: '金色', hex: '#FFD700' },
  { name: '红色', hex: '#FF0000' },
  { name: '蓝色', hex: '#0000FF' },
  { name: '绿色', hex: '#00FF00' },
  { name: '黄色', hex: '#FFFF00' },
  { name: '橙色', hex: '#FFA500' },
  { name: '紫色', hex: '#800080' },
  { name: '粉色', hex: '#FFC0CB' },
  { name: '棕色', hex: '#A52A2A' },
  { name: '米色', hex: '#F5F5DC' },
  { name: '天蓝', hex: '#87CEEB' },
  { name: '深灰', hex: '#404040' },
  { name: '浅灰', hex: '#D3D3D3' },
  { name: '深蓝', hex: '#00008B' },
  { name: '草绿', hex: '#7CFC00' },
  { name: '玫红', hex: '#FF1493' }
];

// 12个产品系列配置
const PRODUCT_SERIES = [
  {
    code: 'MP',
    nameZh: '多功能清洁套装',
    nameEn: 'Multi-Purpose Cleaning Set',
    components: ['伸缩杆', '拖把头', '刷头', '抹布'],
    componentCodes: ['A', 'B', 'C', 'D'],
    componentParts: [['伸缩杆'], ['拖把头'], ['刷头'], ['抹布']]
  },
  {
    code: 'TB',
    nameZh: '旋转拖把',
    nameEn: 'Spin Mop',
    components: ['杆件', '拖把头', '桶体'],
    componentCodes: ['A', 'B', 'C'],
    componentParts: [['杆件'], ['拖把头'], ['桶体']]
  },
  {
    code: 'T',
    nameZh: '伸缩杆',
    nameEn: 'Telescopic Pole',
    components: ['杆身', '手柄'],
    componentCodes: ['A', 'B'],
    componentParts: [['杆身', '杆身2'], ['手柄']]
  },
  {
    code: 'B',
    nameZh: '拖把头',
    nameEn: 'Mop Head',
    components: ['纤维布', '底座'],
    componentCodes: ['A', 'B'],
    componentParts: [['纤维布', '纤维布2'], ['底座']]
  },
  {
    code: 'S',
    nameZh: '马桶刷套装',
    nameEn: 'Toilet Brush Set',
    components: ['刷头', '手柄', '底座'],
    componentCodes: ['A', 'B', 'C'],
    componentParts: [['刷头'], ['手柄'], ['底座']]
  },
  {
    code: 'CG',
    nameZh: '玻璃刮',
    nameEn: 'Window Squeegee',
    components: ['刮条', '手柄', '底座'],
    componentCodes: ['A', 'B', 'C'],
    componentParts: [['刮条'], ['手柄', '手柄2'], ['底座']]
  },
  {
    code: 'CD',
    nameZh: '除尘掸',
    nameEn: 'Duster',
    components: ['掸头', '杆件'],
    componentCodes: ['A', 'B'],
    componentParts: [['掸头'], ['杆件']]
  },
  {
    code: 'MB',
    nameZh: '清洁抹布',
    nameEn: 'Cleaning Cloth',
    components: ['布料'],
    componentCodes: ['A'],
    componentParts: [['布料', '布料2']]
  },
  {
    code: 'QC',
    nameZh: '汽车清洁套装',
    nameEn: 'Car Cleaning Kit',
    components: ['刷头', '海绵', '抹布', '喷壶'],
    componentCodes: ['A', 'B', 'C', 'D'],
    componentParts: [['刷头'], ['海绵'], ['抹布'], ['喷壶', '喷壶2']]
  },
  {
    code: 'CW',
    nameZh: '宠物清洁工具',
    nameEn: 'Pet Cleaning Tool',
    components: ['梳头', '手柄', '收纳盒'],
    componentCodes: ['A', 'B', 'C'],
    componentParts: [['梳头'], ['手柄'], ['收纳盒']]
  },
  {
    code: 'W',
    nameZh: '外购清洁用品',
    nameEn: 'Outsourced Supplies',
    components: ['主体', '配件'],
    componentCodes: ['A', 'B'],
    componentParts: [['主体'], ['配件', '配件2']]
  },
  {
    code: 'MX',
    nameZh: '混合清洁工具',
    nameEn: 'Mixed Cleaning Tools',
    components: ['工具头', '连接杆', '手柄'],
    componentCodes: ['A', 'B', 'C'],
    componentParts: [['工具头', '工具头2'], ['连接杆'], ['手柄']]
  }
];

// 登录
async function loginAdmin() {
  console.log('\n[步骤1] 管理员登录...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123456'
    });
    ADMIN_TOKEN = response.data.access_token;
    console.log(`  ✅ 登录成功`);
    return true;
  } catch (error) {
    console.log(`  ❌ 登录失败`);
    return false;
  }
}

// 上传文件
async function uploadFile(filePath, type = 'image') {
  if (!fs.existsSync(filePath)) {
    console.log(`    ⚠️ 文件不存在: ${filePath}`);
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await axios.post(`${API_BASE_URL}/upload/single?type=${type}`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log(`    ✅ 上传: ${path.basename(filePath)}`);
    return response.data.url;
  } catch (error) {
    console.log(`    ❌ 上传失败: ${error.message}`);
    return null;
  }
}

// 生成随机组件配色
// parts: 每个组件的部件列表数组,例如 [['伸缩杆'], ['拖把头', '拖把头2'], ...]
function generateRandomComponents(components, componentCodes, componentParts) {
  const schemes = [];
  const schemeCount = Math.floor(Math.random() * 3) + 1; // 1-3个配色方案

  for (let i = 0; i < schemeCount; i++) {
    const scheme = {
      id: `scheme-${Date.now()}-${i}`,
      name: `配色方案${i + 1}`,
      colors: []
    };

    components.forEach((component, idx) => {
      const componentScheme = {
        componentCode: componentCodes[idx],
        colors: []
      };

      // 为该组件的所有部件配置颜色
      const parts = componentParts[idx]; // 该组件的部件列表
      parts.forEach(part => {
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        componentScheme.colors.push({
          part: part,
          color: randomColor.name,
          hexColor: randomColor.hex
        });
      });

      scheme.colors.push(componentScheme);
    });

    schemes.push(scheme);
  }

  return schemes;
}

// 创建分类
async function createCategory(code, nameZh, nameEn) {
  try {
    const response = await axios.post(`${API_BASE_URL}/products/categories`, {
      code,
      nameZh,
      nameEn
    }, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    console.log(`    ✅ 分类: [${code}] ${nameZh} / ${nameEn}`);
    return true;
  } catch (error) {
    console.log(`    ❌ 分类失败: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// 创建产品组
async function createProductGroup(series, imageUrl) {
  try {
    const response = await axios.post(`${API_BASE_URL}/products/groups`, {
      prefix: `${series.code}001`,
      groupNameZh: series.nameZh,
      groupNameEn: series.nameEn,
      categoryCode: series.code
    }, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });

    console.log(`    ✅ 产品组: ${series.code}001 - ${series.nameZh}`);
    return response.data.id;
  } catch (error) {
    console.log(`    ❌ 产品组失败: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// 创建SKU
async function createSKU(groupId, series, skuSuffix, skuName, price, images, video, colorSchemes) {
  try {
    // 准备产品规格
    const productSpec = series.components.map((comp, idx) => ({
      code: series.componentCodes[idx],
      name: comp,
      spec: '标准规格',
      parts: colorSchemes[0].colors[idx].colors.map(c => c.part)
    }));

    // 准备颜色属性
    const additionalAttributes = colorSchemes[0].colors.map((compScheme, idx) => ({
      componentCode: series.componentCodes[idx],
      colorSchemes: colorSchemes.map(scheme => ({
        id: scheme.id,
        name: scheme.name,
        colors: scheme.colors[idx].colors
      }))
    }));

    const skuData = {
      productCode: `${series.code}001-${skuSuffix}`,
      productName: skuName,
      title: `${series.nameEn} - ${skuName}`,
      price: price,
      groupId,
      status: 'ACTIVE',
      images: images,
      productSpec: productSpec,
      additionalAttributes: additionalAttributes
    };

    // 如果有视频，添加视频字段
    if (video) {
      skuData.video = { url: video, type: 'mp4' };
    }

    const response = await axios.post(`${API_BASE_URL}/products/skus`, skuData, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });

    const videoTag = video ? ' [含视频]' : '';
    console.log(`      ✅ SKU: ${series.code}001-${skuSuffix} - ${skuName} (¥${price})${videoTag}`);
    return response.data;
  } catch (error) {
    console.log(`      ❌ SKU失败: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// 主函数
async function generateFullProducts() {
  console.log('='.repeat(70));
  console.log('🚀 生成12个产品系列 + 视频配置');
  console.log('='.repeat(70));

  // 1. 登录
  if (!await loginAdmin()) return;

  // 1.5 创建分类
  console.log('\n[步骤1.5] 创建分类...');
  const categories = [
    { code: 'MP', nameZh: '组合套装', nameEn: 'Combo Sets' },
    { code: 'TB', nameZh: '拖把类', nameEn: 'Mops' },
    { code: 'T', nameZh: '杆件', nameEn: 'Poles' },
    { code: 'B', nameZh: '拖把头', nameEn: 'Mop Heads' },
    { code: 'S', nameZh: '刷类', nameEn: 'Brushes' },
    { code: 'CG', nameZh: '玻璃&地刷类', nameEn: 'Glass & Floor Brushes' },
    { code: 'CD', nameZh: '除尘类', nameEn: 'Dusters' },
    { code: 'MB', nameZh: '抹布类', nameEn: 'Cleaning Cloths' },
    { code: 'QC', nameZh: '车用类', nameEn: 'Car Care' },
    { code: 'CW', nameZh: '宠物清洁类', nameEn: 'Pet Care' },
    { code: 'W', nameZh: '外购类', nameEn: 'Outsourced Products' },
    { code: 'MX', nameZh: '混合类', nameEn: 'Mixed Products' }
  ];

  for (const cat of categories) {
    await createCategory(cat.code, cat.nameZh, cat.nameEn);
  }
  console.log(`  ✅ 成功创建 ${categories.length} 个分类`);

  // 2. 上传所有图片
  console.log('\n[步骤2] 上传图片...');
  const uploadedImages = [];
  for (const img of IMAGES) {
    const imgPath = path.join(IMAGE_DIR, img);
    const url = await uploadFile(imgPath, 'image');
    if (url) uploadedImages.push(url);
  }
  console.log(`  ✅ 成功上传 ${uploadedImages.length} 张图片`);

  // 3. 上传视频
  console.log('\n[步骤3] 上传视频...');
  const videoUrl = await uploadFile(VIDEO_PATH, 'video');
  if (videoUrl) {
    console.log(`  ✅ 视频上传成功`);
  }

  // 4. 创建12个产品系列
  console.log('\n[步骤4] 创建12个产品系列...\n');

  let productCount = 0;
  let skuCount = 0;

  for (let i = 0; i < PRODUCT_SERIES.length && i < uploadedImages.length; i++) {
    const series = PRODUCT_SERIES[i];
    console.log(`\n  [系列 ${i + 1}/12] ${series.nameZh} (${series.code})`);

    // 使用对应的图片
    const mainImage = uploadedImages[i];

    // 创建产品组
    const groupId = await createProductGroup(series, mainImage);
    if (!groupId) continue;

    productCount++;

    // 为每个系列创建2-3个SKU
    const skuCountPerGroup = Math.floor(Math.random() * 2) + 2; // 2-3个SKU

    for (let s = 0; s < skuCountPerGroup; s++) {
      const skuSuffix = String(s + 1).padStart(3, '0');
      const skuName = `${series.nameZh}-${['标准款', '豪华款', '高级款'][s]}`;
      const price = 50 + (s + 1) * 30 + Math.floor(Math.random() * 20);

      // 随机生成配色方案
      const colorSchemes = generateRandomComponents(
        series.components,
        series.componentCodes,
        series.componentParts
      );

      // 为每个SKU分配3-4张图片（循环使用）
      const skuImages = [
        uploadedImages[i],
        uploadedImages[(i + 1) % uploadedImages.length],
        uploadedImages[(i + 2) % uploadedImages.length],
        uploadedImages[(i + 3) % uploadedImages.length]
      ];

      // 前三个系列的第一个规格添加视频
      const shouldAddVideo = (i < 3 && s === 0 && videoUrl);

      const created = await createSKU(
        groupId,
        series,
        skuSuffix,
        skuName,
        price,
        skuImages,
        shouldAddVideo ? videoUrl : null,
        colorSchemes
      );

      if (created) skuCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ 数据生成完成!');
  console.log('='.repeat(70));
  console.log(`📊 统计:`);
  console.log(`  - 产品系列: ${productCount} 个`);
  console.log(`  - SKU总数: ${skuCount} 个`);
  console.log(`  - 图片: ${uploadedImages.length} 张`);
  console.log(`  - 视频: ${videoUrl ? '1个 (配置到前3个系列的第1个规格)' : '0个'}`);
  console.log('='.repeat(70));
}

generateFullProducts().catch(error => {
  console.error('\n❌ 致命错误:', error);
  process.exit(1);
});
