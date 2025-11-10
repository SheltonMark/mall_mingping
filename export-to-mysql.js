const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportToMySQL() {
  console.log('=== 导出 SQLite 数据到 MySQL 格式 ===\n');

  try {
    // 1. 导出 Admin 数据
    const admins = await prisma.admin.findMany();
    console.log(`✓ 导出 ${admins.length} 个管理员`);

    // 2. 导出 Category 数据
    const categories = await prisma.category.findMany();
    console.log(`✓ 导出 ${categories.length} 个分类`);

    // 3. 导出 Component 数据
    const components = await prisma.component.findMany();
    console.log(`✓ 导出 ${components.length} 个组件`);

    // 4. 导出 ProductGroup 数据
    const productGroups = await prisma.productGroup.findMany({
      include: {
        skus: true
      }
    });
    console.log(`✓ 导出 ${productGroups.length} 个产品组`);

    // 5. 导出 ProductSku 数据
    const productSkus = await prisma.productSku.findMany();
    console.log(`✓ 导出 ${productSkus.length} 个产品SKU`);

    // 6. 导出 Customer 数据
    const customers = await prisma.customer.findMany();
    console.log(`✓ 导出 ${customers.length} 个客户`);

    // 7. 导出 OrderForm 数据
    const orderForms = await prisma.orderForm.findMany();
    console.log(`✓ 导出 ${orderForms.length} 个订单表单`);

    // 8. 导出 HomepageFeatured 数据
    const homepageFeatured = await prisma.homepageFeatured.findMany();
    console.log(`✓ 导出 ${homepageFeatured.length} 个首页精选`);

    // 9. 导出 Certification 数据
    const certifications = await prisma.certification.findMany();
    console.log(`✓ 导出 ${certifications.length} 个认证`);

    // 10. 导出 SystemConfig 数据
    const systemConfigs = await prisma.systemConfig.findMany();
    console.log(`✓ 导出 ${systemConfigs.length} 个系统配置`);

    // 生成 MySQL INSERT 语句
    const sqlStatements = [];

    // 清空表的语句
    sqlStatements.push('-- 清空现有数据 (注意：会删除所有数据!)');
    sqlStatements.push('SET FOREIGN_KEY_CHECKS = 0;');
    sqlStatements.push('TRUNCATE TABLE admins;');
    sqlStatements.push('TRUNCATE TABLE categories;');
    sqlStatements.push('TRUNCATE TABLE components;');
    sqlStatements.push('TRUNCATE TABLE product_skus;');
    sqlStatements.push('TRUNCATE TABLE product_groups;');
    sqlStatements.push('TRUNCATE TABLE customers;');
    sqlStatements.push('TRUNCATE TABLE order_forms;');
    sqlStatements.push('TRUNCATE TABLE homepage_featured;');
    sqlStatements.push('TRUNCATE TABLE certifications;');
    sqlStatements.push('TRUNCATE TABLE system_configs;');
    sqlStatements.push('SET FOREIGN_KEY_CHECKS = 1;\n');

    // 生成 INSERT 语句 - Admins
    if (admins.length > 0) {
      sqlStatements.push('-- 管理员数据');
      admins.forEach(admin => {
        const values = [
          escapeString(admin.id),
          escapeString(admin.username),
          escapeString(admin.password),
          admin.email ? escapeString(admin.email) : 'NULL',
          escapeString(admin.role),
          formatDateTime(admin.createdAt),
          formatDateTime(admin.updatedAt)
        ];
        sqlStatements.push(
          `INSERT INTO admins (id, username, password, email, role, created_at, updated_at) VALUES (${values.join(', ')});`
        );
      });
      sqlStatements.push('');
    }

    // 生成 INSERT 语句 - Categories
    if (categories.length > 0) {
      sqlStatements.push('-- 分类数据');
      categories.forEach(cat => {
        const values = [
          escapeString(cat.id),
          escapeString(cat.code),
          escapeString(cat.nameZh),
          escapeString(cat.nameEn),
          cat.icon ? escapeString(cat.icon) : 'NULL',
          cat.sortOrder,
          cat.isAutoCreated ? 1 : 0,
          cat.isActive ? 1 : 0,
          formatDateTime(cat.createdAt),
          formatDateTime(cat.updatedAt)
        ];
        sqlStatements.push(
          `INSERT INTO categories (id, code, name_zh, name_en, icon, sort_order, is_auto_created, is_active, created_at, updated_at) VALUES (${values.join(', ')});`
        );
      });
      sqlStatements.push('');
    }

    // 生成 INSERT 语句 - Components
    if (components.length > 0) {
      sqlStatements.push('-- 组件数据');
      components.forEach(comp => {
        const values = [
          escapeString(comp.id),
          escapeString(comp.code),
          escapeString(comp.nameZh),
          escapeString(comp.nameEn),
          comp.description ? escapeString(comp.description) : 'NULL',
          comp.parts ? escapeString(JSON.stringify(comp.parts)) : 'NULL',
          comp.sortOrder,
          comp.isActive ? 1 : 0,
          formatDateTime(comp.createdAt),
          formatDateTime(comp.updatedAt)
        ];
        sqlStatements.push(
          `INSERT INTO components (id, code, name_zh, name_en, description, parts, sort_order, is_active, created_at, updated_at) VALUES (${values.join(', ')});`
        );
      });
      sqlStatements.push('');
    }

    // 生成 INSERT 语句 - ProductGroups
    if (productGroups.length > 0) {
      sqlStatements.push('-- 产品组数据');
      productGroups.forEach(group => {
        const values = [
          escapeString(group.id),
          escapeString(group.prefix),
          escapeString(group.groupNameZh),
          escapeString(group.groupNameEn),
          group.categoryId ? escapeString(group.categoryId) : 'NULL',
          group.categoryCode ? escapeString(group.categoryCode) : 'NULL',
          group.descriptionZh ? escapeString(group.descriptionZh) : 'NULL',
          group.descriptionEn ? escapeString(group.descriptionEn) : 'NULL',
          group.sharedVideo ? escapeString(JSON.stringify(group.sharedVideo)) : 'NULL',
          escapeString(group.videoMode),
          group.minPrice ? group.minPrice : 'NULL',
          group.maxPrice ? group.maxPrice : 'NULL',
          group.specCount,
          group.mainImage ? escapeString(group.mainImage) : 'NULL',
          group.isPublished ? 1 : 0,
          group.sortOrder,
          escapeString(group.status),
          escapeString(group.visibilityTier),
          formatDateTime(group.createdAt),
          formatDateTime(group.updatedAt)
        ];
        sqlStatements.push(
          `INSERT INTO product_groups (id, prefix, group_name_zh, group_name_en, category_id, category_code, description_zh, description_en, shared_video, video_mode, min_price, max_price, spec_count, main_image, is_published, sort_order, status, visibility_tier, created_at, updated_at) VALUES (${values.join(', ')});`
        );
      });
      sqlStatements.push('');
    }

    // 生成 INSERT 语句 - ProductSkus
    if (productSkus.length > 0) {
      sqlStatements.push('-- 产品SKU数据');
      productSkus.forEach(sku => {
        const values = [
          escapeString(sku.id),
          escapeString(sku.groupId),
          escapeString(sku.productCode),
          escapeString(sku.productName),
          sku.title ? escapeString(sku.title) : 'NULL',
          sku.subtitle ? escapeString(sku.subtitle) : 'NULL',
          sku.brand ? escapeString(sku.brand) : 'NULL',
          sku.specification ? escapeString(sku.specification) : 'NULL',
          sku.productSpec ? escapeString(JSON.stringify(sku.productSpec)) : 'NULL',
          sku.additionalAttributes ? escapeString(JSON.stringify(sku.additionalAttributes)) : 'NULL',
          sku.price ? sku.price : 'NULL',
          sku.images ? escapeString(JSON.stringify(sku.images)) : 'NULL',
          sku.video ? escapeString(JSON.stringify(sku.video)) : 'NULL',
          sku.useSharedVideo ? 1 : 0,
          sku.importDate ? formatDateTime(sku.importDate) : 'NULL',
          escapeString(sku.status),
          formatDateTime(sku.createdAt),
          formatDateTime(sku.updatedAt)
        ];
        sqlStatements.push(
          `INSERT INTO product_skus (id, group_id, product_code, product_name, title, subtitle, brand, specification, product_spec, additional_attributes, price, images, video, use_shared_video, import_date, status, created_at, updated_at) VALUES (${values.join(', ')});`
        );
      });
      sqlStatements.push('');
    }

    // 生成 INSERT 语句 - Customers
    if (customers.length > 0) {
      sqlStatements.push('-- 客户数据');
      customers.forEach(customer => {
        const values = [
          escapeString(customer.id),
          escapeString(customer.email),
          customer.password ? escapeString(customer.password) : 'NULL',
          escapeString(customer.name),
          customer.contactPerson ? escapeString(customer.contactPerson) : 'NULL',
          customer.phone ? escapeString(customer.phone) : 'NULL',
          customer.address ? escapeString(customer.address) : 'NULL',
          customer.country ? escapeString(customer.country) : 'NULL',
          customer.salespersonId ? escapeString(customer.salespersonId) : 'NULL',
          escapeString(customer.customerType),
          escapeString(customer.tier),
          escapeString(customer.status),
          formatDateTime(customer.createdAt),
          formatDateTime(customer.updatedAt)
        ];
        sqlStatements.push(
          `INSERT INTO customers (id, email, password, name, contact_person, phone, address, country, salesperson_id, customer_type, customer_tier, status, created_at, updated_at) VALUES (${values.join(', ')});`
        );
      });
      sqlStatements.push('');
    }

    // 生成 INSERT 语句 - OrderForms
    if (orderForms.length > 0) {
      sqlStatements.push('-- 订单表单数据');
      orderForms.forEach(form => {
        const values = [
          escapeString(form.id),
          escapeString(form.formNumber),
          escapeString(form.customerId),
          escapeString(form.contactName),
          escapeString(form.phone),
          escapeString(form.email),
          escapeString(form.address),
          form.notes ? escapeString(form.notes) : 'NULL',
          escapeString(JSON.stringify(form.items)),
          escapeString(form.totalAmount),
          escapeString(form.status),
          formatDateTime(form.submittedAt),
          formatDateTime(form.createdAt),
          formatDateTime(form.updatedAt)
        ];
        sqlStatements.push(
          `INSERT INTO order_forms (id, form_number, customer_id, contact_name, phone, email, address, notes, items, total_amount, status, submitted_at, created_at, updated_at) VALUES (${values.join(', ')});`
        );
      });
      sqlStatements.push('');
    }

    // 生成 INSERT 语句 - HomepageFeatured
    if (homepageFeatured.length > 0) {
      sqlStatements.push('-- 首页精选数据');
      homepageFeatured.forEach(featured => {
        const values = [
          escapeString(featured.id),
          escapeString(featured.groupId),
          escapeString(featured.featuredImage),
          escapeString(featured.titleZh),
          escapeString(featured.titleEn),
          featured.descriptionZh ? escapeString(featured.descriptionZh) : 'NULL',
          featured.descriptionEn ? escapeString(featured.descriptionEn) : 'NULL',
          featured.sortOrder,
          escapeString(featured.status),
          formatDateTime(featured.createdAt),
          formatDateTime(featured.updatedAt)
        ];
        sqlStatements.push(
          `INSERT INTO homepage_featured (id, group_id, featured_image, title_zh, title_en, description_zh, description_en, sort_order, status, created_at, updated_at) VALUES (${values.join(', ')});`
        );
      });
      sqlStatements.push('');
    }

    // 生成 INSERT 语句 - Certifications
    if (certifications.length > 0) {
      sqlStatements.push('-- 认证数据');
      certifications.forEach(cert => {
        const values = [
          escapeString(cert.id),
          escapeString(cert.nameZh),
          escapeString(cert.nameEn),
          escapeString(cert.category),
          cert.certificateType ? escapeString(cert.certificateType) : 'NULL',
          escapeString(cert.fileUrl),
          cert.fileType ? escapeString(cert.fileType) : 'NULL',
          cert.thumbnailUrl ? escapeString(cert.thumbnailUrl) : 'NULL',
          cert.issueDate ? formatDateTime(cert.issueDate) : 'NULL',
          cert.expiryDate ? formatDateTime(cert.expiryDate) : 'NULL',
          cert.issuingAuthority ? escapeString(cert.issuingAuthority) : 'NULL',
          cert.certificateNumber ? escapeString(cert.certificateNumber) : 'NULL',
          cert.descriptionZh ? escapeString(cert.descriptionZh) : 'NULL',
          cert.descriptionEn ? escapeString(cert.descriptionEn) : 'NULL',
          cert.displayOrder,
          cert.isActive ? 1 : 0,
          cert.showOnFrontend ? 1 : 0,
          formatDateTime(cert.createdAt),
          formatDateTime(cert.updatedAt)
        ];
        sqlStatements.push(
          `INSERT INTO certifications (id, name_zh, name_en, category, certificate_type, file_url, file_type, thumbnail_url, issue_date, expiry_date, issuing_authority, certificate_number, description_zh, description_en, display_order, is_active, show_on_frontend, created_at, updated_at) VALUES (${values.join(', ')});`
        );
      });
      sqlStatements.push('');
    }

    // 生成 INSERT 语句 - SystemConfigs
    if (systemConfigs.length > 0) {
      sqlStatements.push('-- 系统配置数据');
      systemConfigs.forEach(config => {
        const values = [
          escapeString(config.id),
          escapeString(config.configKey),
          config.configValue ? escapeString(config.configValue) : 'NULL',
          config.configType ? escapeString(config.configType) : 'NULL',
          config.description ? escapeString(config.description) : 'NULL',
          formatDateTime(config.updatedAt)
        ];
        sqlStatements.push(
          `INSERT INTO system_configs (id, config_key, config_value, config_type, description, updated_at) VALUES (${values.join(', ')});`
        );
      });
      sqlStatements.push('');
    }

    // 写入文件
    const sqlContent = sqlStatements.join('\n');
    fs.writeFileSync('mysql-import.sql', sqlContent, 'utf8');

    console.log('\n=== 导出完成! ===');
    console.log('SQL 文件已保存: mysql-import.sql');
    console.log('\n使用方法:');
    console.log('1. 上传 mysql-import.sql 到服务器');
    console.log('2. 在服务器上执行: mysql -u用户名 -p 数据库名 < mysql-import.sql');

  } catch (error) {
    console.error('导出失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 辅助函数：转义字符串
function escapeString(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

// 辅助函数：格式化日期时间
function formatDateTime(date) {
  if (!date) return 'NULL';
  const d = new Date(date);
  return `'${d.toISOString().slice(0, 19).replace('T', ' ')}'`;
}

exportToMySQL();