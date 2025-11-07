# 内外网双站点部署方案

## 站点1：外网站点（已部署）
**域名**: https://www.lemopx.com
**服务器**: 阿里云 8.141.127.26
**用户**: 国内外客户

### 功能
- ✅ 产品展示
- ✅ 在线下单
- ✅ 订单查询
- ✅ 客户注册登录
- ❌ 不包含：ERP数据管理、审核功能

### 数据来源
- 产品数据：从内网同步（定时推送）
- 订单数据：存储在自己的MySQL
- 库存数据：从内网API查询（实时）

---

## 站点2：内网站点（需新部署）
**域名**: http://erp-admin.local（内网域名）
**服务器**: 客户内网服务器
**用户**: 客户公司员工

### 功能
- ✅ ERP数据审核
- ✅ 订单管理和发货
- ✅ 产品管理
- ✅ 库存管理
- ✅ 员工管理
- ✅ 直连ERP数据库

### 数据来源
- 直接读写ERP数据库
- 不经过外网

---

## 数据同步方案

### 内网 → 外网（产品、库存）
```
内网服务器
  └─ 定时任务（每5分钟）
  └─ 读取ERP产品数据
  └─ HTTPS推送到外网API
  └─ 外网更新产品信息
```

### 外网 → 内网（订单）
```
外网服务器
  └─ 收到新订单
  └─ HTTPS推送到内网API（如果内网开放）
  └─ 或：内网定时拉取（每5分钟）
```

---

## 部署成本对比

### 方案1：单服务器+CDN
- 服务器：￥100/月（当前已有）
- CDN流量：￥2-10/月
- **总计：￥102-110/月**

### 方案2：双服务器
- 外网服务器：￥100/月（当前已有）
- 内网服务器：客户提供（或￥100/月）
- CDN流量：￥2-10/月
- **总计：￥102-210/月**

---

## 推荐配置

### 如果预算有限
→ **方案1**：当前服务器 + Cloudflare CDN（免费）
  - 国外访问速度：⭐⭐⭐⭐
  - 成本：￥0额外费用

### 如果客户要求内网独立
→ **方案2**：双服务器
  - 内网：完全独立，更安全
  - 外网：专注对外展示
  - 成本：需要客户提供内网服务器

---

## 国外访问优化配置

### Nginx配置（Gzip压缩）
```nginx
# 在 /etc/nginx/nginx.conf 添加
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
```

### 图片优化
- 使用WebP格式（减少60%体积）
- 图片CDN加速
- 懒加载

### 前端优化
- 启用HTTP/2
- 代码分割
- 缓存策略

---

## 测试国外访问速度

### 在线测试工具
1. **Pingdom**: tools.pingdom.com
   - 测试全球各地访问速度

2. **GTmetrix**: gtmetrix.com
   - 测试页面加载性能

3. **WebPageTest**: webpagetest.org
   - 选择不同国家节点测试

### 命令行测试
```bash
# 从国外服务器ping
ping www.lemopx.com

# 从国外服务器curl
curl -w "@curl-format.txt" -o /dev/null -s https://www.lemopx.com
```

如果测试延迟 > 500ms，建议启用CDN