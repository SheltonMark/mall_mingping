# 🎉 阶段3完成报告 - 系统配置与管理

## ✅ 已完成的功能

### 1. 通用文件上传模块 ([modules/upload](code/backend-api/src/modules/upload))

**API 端点**:

#### ✅ `POST /api/upload/single?type={image|document|excel}`
单文件上传

**请求**:
- Content-Type: `multipart/form-data`
- Field: `file`
- Query: `type` (可选，默认为 image)

**返回**:
```json
{
  "url": "/uploads/images/image_product_1234567890_abc123.jpg",
  "filename": "image_product_1234567890_abc123.jpg",
  "size": 245678,
  "mimetype": "image/jpeg"
}
```

#### ✅ `POST /api/upload/multiple?type={image|document|excel}`
多文件上传（最多10个）

**请求**:
- Content-Type: `multipart/form-data`
- Field: `files` (多个)
- Query: `type`

**返回**:
```json
[
  {
    "url": "/uploads/images/image_1.jpg",
    "filename": "image_1.jpg",
    "size": 123456,
    "mimetype": "image/jpeg"
  },
  {
    "filename": "invalid.txt",
    "error": "Invalid file type. Allowed types: .jpg, .jpeg, .png, .gif, .webp, .svg"
  }
]
```

#### ✅ `DELETE /api/upload`
删除文件

**请求**:
```json
{
  "url": "/uploads/images/old_file.jpg"
}
```

**支持的文件类型**:
- **图片**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg` (最大5MB)
- **文档**: `.pdf`, `.doc`, `.docx`, `.txt` (最大10MB)
- **Excel**: `.xlsx`, `.xls`, `.csv` (最大10MB)

---

### 2. 系统配置模块 ([modules/system](code/backend-api/src/modules/system))

#### 通用配置 API

**GET /api/system/config/:key** - 获取单个配置

**GET /api/system/configs?keys=key1,key2,key3** - 获取多个配置

**PUT /api/system/config** - 更新/创建配置（需认证）
```json
{
  "configKey": "site_name",
  "configValue": "LEMOPX",
  "configType": "text",
  "description": "网站名称"
}
```

**DELETE /api/system/config/:key** - 删除配置（需认证）

#### 首页配置 API

**GET /api/system/homepage** - 获取首页配置（公开）

返回示例：
```json
{
  "hero_title": "欢迎来到 LEMOPX",
  "hero_subtitle": "专业的塑料制品供应商",
  "hero_image": "/uploads/images/hero.jpg",
  "featured_products": ["uuid1", "uuid2", "uuid3"],
  "banner_images": [
    "/uploads/images/banner1.jpg",
    "/uploads/images/banner2.jpg"
  ],
  "about_section": {
    "title": "关于我们",
    "content": "我们是...",
    "image": "/uploads/images/about.jpg"
  }
}
```

**PUT /api/system/homepage** - 更新首页配置（需认证）
```json
{
  "hero_title": "新标题",
  "hero_image": "/uploads/images/new_hero.jpg",
  "featured_products": ["uuid1", "uuid2"]
}
```

#### 关于我们配置 API

**GET /api/system/about** - 获取关于我们配置（公开）

返回示例：
```json
{
  "company_name": "LEMOPX公司",
  "company_intro": "成立于2010年...",
  "mission": "为客户提供优质产品",
  "vision": "成为行业领先者",
  "history": "发展历程...",
  "team": [
    {
      "name": "张三",
      "position": "CEO",
      "photo": "/uploads/images/team1.jpg"
    }
  ],
  "certifications": [
    "/uploads/images/cert1.jpg",
    "/uploads/images/cert2.jpg"
  ],
  "contact_email": "info@lemopx.com",
  "contact_phone": "400-123-4567",
  "contact_address": "深圳市..."
}
```

**PUT /api/system/about** - 更新关于我们配置（需认证）

#### 站点配置 API

**GET /api/system/site** - 获取站点配置（公开）

返回示例：
```json
{
  "name": "LEMOPX",
  "logo": "/uploads/images/logo.png",
  "favicon": "/uploads/images/favicon.ico",
  "footer_text": "© 2024 LEMOPX. All rights reserved.",
  "copyright": "版权所有",
  "social_media": {
    "wechat": "lemopx_official",
    "linkedin": "https://linkedin.com/company/lemopx",
    "facebook": "https://facebook.com/lemopx"
  },
  "navigation": [
    { "label": "首页", "path": "/" },
    { "label": "产品", "path": "/products" },
    { "label": "关于我们", "path": "/about" }
  ]
}
```

**PUT /api/system/site** - 更新站点配置（需认证）

---

### 3. 合作申请管理模块 ([modules/partnership](code/backend-api/src/modules/partnership))

**API 端点**:

#### ✅ `POST /api/partnerships` - 提交合作申请（公开，无需认证）
```json
{
  "name": "张三",
  "company": "ABC公司",
  "email": "zhangsan@abc.com",
  "phone": "13800138000",
  "message": "希望成为贵公司的合作伙伴..."
}
```

#### ✅ `GET /api/partnerships` - 获取申请列表（需认证）

Query 参数:
- `status`: 筛选状态 (PENDING/CONTACTED/PARTNERED/REJECTED)
- `search`: 搜索关键词
- `page`: 页码
- `limit`: 每页数量

返回：
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "张三",
      "company": "ABC公司",
      "email": "zhangsan@abc.com",
      "phone": "13800138000",
      "message": "...",
      "status": "PENDING",
      "notes": null,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### ✅ `GET /api/partnerships/statistics` - 获取统计数据（需认证）
```json
{
  "total": 100,
  "pending": 25,
  "contacted": 30,
  "partnered": 40,
  "rejected": 5
}
```

#### ✅ `GET /api/partnerships/:id` - 获取申请详情（需认证）

#### ✅ `PATCH /api/partnerships/:id` - 更新申请状态（需认证）
```json
{
  "status": "CONTACTED",
  "notes": "已电话联系，约定下周会面"
}
```

#### ✅ `DELETE /api/partnerships/:id` - 删除申请（需认证）

**合作申请状态流程**:
```
PENDING (待处理)
    ↓
CONTACTED (已联系)
    ↓
PARTNERED (已合作) / REJECTED (已拒绝)
```

---

## 📊 完成统计

### 已创建的文件
```
src/modules/upload/
  ├── dto/upload.dto.ts
  ├── upload.service.ts
  ├── upload.controller.ts
  └── upload.module.ts

src/modules/system/
  ├── dto/system.dto.ts
  ├── system.service.ts
  ├── system.controller.ts
  └── system.module.ts

src/modules/partnership/
  ├── dto/partnership.dto.ts
  ├── partnership.service.ts
  ├── partnership.controller.ts
  └── partnership.module.ts

src/app.module.ts (更新)
```

### 新增 API 端点
- **文件上传**: 3个端点
- **系统配置**: 10个端点 (通用4 + 首页2 + 关于2 + 站点2)
- **合作申请**: 6个端点
- **总计**: 19个新端点

### 支持的配置项
系统预定义了以下配置键：

**首页配置** (homepage_*):
- hero_title, hero_subtitle, hero_image
- featured_products, banner_images
- about_section

**关于我们** (about_*):
- company_name, company_intro
- mission, vision, history, team
- certifications (认证证书图片列表)
- contact_email, contact_phone, contact_address

**站点配置** (site_*):
- name, logo, favicon
- footer_text, copyright
- social_media, navigation

---

## 🚀 使用场景

### 场景1: 首页配置更新流程

1. **上传首页Banner图片**:
```bash
curl -X POST http://localhost:3001/api/upload/single?type=image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@banner.jpg"
```

返回: `{"url": "/uploads/images/image_banner_123.jpg", ...}`

2. **更新首页配置**:
```bash
curl -X PUT http://localhost:3001/api/system/homepage \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hero_title": "新标题",
    "hero_image": "/uploads/images/image_banner_123.jpg",
    "banner_images": [
      "/uploads/images/banner1.jpg",
      "/uploads/images/banner2.jpg"
    ]
  }'
```

3. **前端获取配置**:
```bash
curl http://localhost:3001/api/system/homepage
```

### 场景2: 认证证书管理

1. **上传认证证书图片**:
```bash
curl -X POST http://localhost:3001/api/upload/multiple?type=image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@iso9001.jpg" \
  -F "files=@ce_cert.jpg" \
  -F "files=@patent.jpg"
```

2. **更新关于我们页面的认证展示**:
```bash
curl -X PUT http://localhost:3001/api/system/about \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "certifications": [
      "/uploads/images/iso9001.jpg",
      "/uploads/images/ce_cert.jpg",
      "/uploads/images/patent.jpg"
    ]
  }'
```

3. **前端展示**:
```typescript
const aboutConfig = await fetch('/api/system/about').then(r => r.json());
aboutConfig.certifications.forEach(url => {
  // 显示证书图片
  console.log(`http://localhost:3001${url}`);
});
```

### 场景3: 合作申请处理

1. **用户在前端提交合作申请**（无需登录）:
```typescript
fetch('/api/partnerships', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '张三',
    company: 'ABC公司',
    email: 'zhangsan@abc.com',
    phone: '13800138000',
    message: '希望合作...'
  })
});
```

2. **管理员查看待处理申请**:
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3001/api/partnerships?status=PENDING"
```

3. **管理员更新申请状态**:
```bash
curl -X PATCH http://localhost:3001/api/partnerships/UUID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONTACTED",
    "notes": "已电话联系"
  }'
```

---

## 🎯 核心特性亮点

### 1. 灵活的配置系统
- 支持任意键值对配置
- 自动类型推断 (JSON/text/number/boolean)
- 分组配置 (homepage/about/site)
- 实时更新，无需重启

### 2. 统一的文件上传
- 单文件/多文件上传
- 自动文件类型验证
- 唯一文件名生成
- 按类型分目录存储

### 3. 公开/私有 API 分离
- 前端获取配置: 无需认证
- 后台管理配置: 需要JWT认证
- 用户提交申请: 无需认证
- 管理员处理申请: 需要认证

### 4. 完整的合作申请流程
- 状态管理 (待处理→已联系→已合作/已拒绝)
- 统计数据
- 搜索和筛选
- 备注功能

---

## 📝 前端集成示例

### 获取首页配置
```typescript
// React Hook 示例
const useHomepageConfig = () => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch('/api/system/homepage')
      .then(res => res.json())
      .then(data => setConfig(data));
  }, []);

  return config;
};

// 使用
const HomePage = () => {
  const config = useHomepageConfig();

  return (
    <div>
      <h1>{config?.hero_title}</h1>
      <img src={`http://localhost:3001${config?.hero_image}`} />
    </div>
  );
};
```

### 上传图片并更新配置
```typescript
const uploadAndUpdate = async (file: File) => {
  // 1. 上传图片
  const formData = new FormData();
  formData.append('file', file);

  const uploadRes = await fetch('/api/upload/single?type=image', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  const { url } = await uploadRes.json();

  // 2. 更新配置
  await fetch('/api/system/homepage', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      hero_image: url,
    }),
  });

  alert('配置更新成功！');
};
```

### 提交合作申请
```typescript
const submitPartnership = async (formData) => {
  const response = await fetch('/api/partnerships', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    alert('申请已提交，我们会尽快与您联系！');
  }
};
```

---

## ⚠️ 注意事项

1. **配置键命名规范**:
   - 首页配置: `homepage_*`
   - 关于我们: `about_*`
   - 站点配置: `site_*`
   - 自定义配置: 自由命名

2. **JSON 配置**:
   - 自动检测对象类型
   - 自动序列化/反序列化
   - 建议复杂数据使用 JSON 类型

3. **文件存储**:
   - 图片建议压缩后上传
   - 定期清理未使用的文件
   - 生产环境建议使用 CDN

4. **认证保护**:
   - 所有配置更新需要认证
   - 所有文件上传需要认证
   - 合作申请提交无需认证

---

**阶段3完成时间**: 2025-10-28
**总开发时间**: 约 15 分钟
**代码质量**: ✅ 灵活配置、✅ 权限分离、✅ 类型安全
**新增代码**: 约 600 行
