#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Mock数据库数据生成脚本
生成分类和产品数据，并导入到数据库
"""

import requests
import json
import os

# 后端API地址
API_BASE_URL = "http://localhost:3001/api"
ADMIN_TOKEN = None  # 需要先登录获取token

# 分类数据 (根据图片)
CATEGORIES = [
    {"code": "MP", "nameZh": "组合套装", "nameEn": "Combo Sets"},
    {"code": "TB", "nameZh": "拖把类", "nameEn": "Mops"},
    {"code": "T", "nameZh": "杆件", "nameEn": "Poles"},
    {"code": "B", "nameZh": "拖把头", "nameEn": "Mop Heads"},
    {"code": "S", "nameZh": "刷类", "nameEn": "Brushes"},
    {"code": "CG", "nameZh": "玻璃&地刮类", "nameEn": "Glass & Floor Squeegees"},
    {"code": "CD", "nameZh": "除尘类", "nameEn": "Dusters"},
    {"code": "MB", "nameZh": "抹布类", "nameEn": "Cloths"},
    {"code": "QC", "nameZh": "车用类", "nameEn": "Car Cleaning"},
    {"code": "CW", "nameZh": "宠物类", "nameEn": "Pet Supplies"},
    {"code": "W", "nameZh": "外购类", "nameEn": "Outsourced"}
]

# 图片路径
IMAGE_DIR = "/d/mast/other/pic"
IMAGES = [
    "coll1.png",
    "coll2.png",
    "coll3.png",
    "coll4.png",
    "unnamed.png",
    "unnamed (1).png",
    "unnamed (2).png",
    "unnamed (3).png",
    "unnamed (4).png",
    "unnamed (5).png"
]

# 首页文案配置 (包含四个系列)
HOMEPAGE_CONFIG = {
    "hero_title_zh": "专业清洁解决方案",
    "hero_title_en": "Professional Cleaning Solutions",
    "hero_subtitle_zh": "为您的家庭和企业提供优质清洁产品",
    "hero_subtitle_en": "Quality cleaning products for your home and business",
    "featured_products": json.dumps([
        {
            "titleZh": "组合套装系列",
            "titleEn": "Combo Sets Collection",
            "descriptionZh": "一站式清洁解决方案，满足全方位清洁需求",
            "descriptionEn": "One-stop cleaning solutions for all your needs",
            "categoryCode": "MP"
        },
        {
            "titleZh": "拖把系列",
            "titleEn": "Mop Collection",
            "descriptionZh": "创新设计，高效清洁，让地板焕然一新",
            "descriptionEn": "Innovative designs for efficient floor cleaning",
            "categoryCode": "TB"
        },
        {
            "titleZh": "刷类系列",
            "titleEn": "Brush Collection",
            "descriptionZh": "专业清洁工具，应对各种清洁挑战",
            "descriptionEn": "Professional cleaning tools for every challenge",
            "categoryCode": "S"
        },
        {
            "titleZh": "车用清洁系列",
            "titleEn": "Car Cleaning Collection",
            "descriptionZh": "专业汽车清洁用品，呵护您的爱车",
            "descriptionEn": "Professional car care products for your vehicle",
            "categoryCode": "QC"
        }
    ]),
    "about_section": json.dumps({
        "titleZh": "关于我们",
        "titleEn": "About Us",
        "features": [
            {
                "titleZh": "品质保证",
                "titleEn": "Quality Assurance",
                "descriptionZh": "所有产品均经过严格的质量检测，确保耐用性和可靠性",
                "descriptionEn": "All products undergo rigorous quality testing to ensure durability and reliability"
            },
            {
                "titleZh": "创新设计",
                "titleEn": "Innovative Design",
                "descriptionZh": "人体工程学设计，让清洁工作更轻松高效",
                "descriptionEn": "Ergonomic design makes cleaning easier and more efficient"
            },
            {
                "titleZh": "环保材料",
                "titleEn": "Eco-Friendly Materials",
                "descriptionZh": "采用环保材料，关爱地球，呵护家人健康",
                "descriptionEn": "Made with eco-friendly materials to care for the planet and your family's health"
            }
        ]
    })
}

# 关于我们文案配置
ABOUT_CONFIG = {
    "hero_title_line1_zh": "专业清洁用品",
    "hero_title_line1_en": "Professional Cleaning",
    "hero_title_line2_zh": "值得信赖的品质",
    "hero_title_line2_en": "Trusted Quality",
    "hero_subtitle_zh": "自2010年成立以来，致力于为全球客户提供高品质清洁解决方案",
    "hero_subtitle_en": "Since 2010, committed to providing high-quality cleaning solutions to customers worldwide",
    "story1_title_zh": "我们的故事",
    "story1_title_en": "Our Story",
    "story1_desc1_zh": "明平清洁成立于2010年，专注于研发和生产高品质的清洁用品。我们拥有现代化的生产基地和专业的研发团队。",
    "story1_desc1_en": "Founded in 2010, Mingping Cleaning specializes in developing and manufacturing high-quality cleaning supplies with modern facilities and professional R&D team.",
    "story1_desc2_zh": "产品远销欧美、东南亚等30多个国家和地区，深受全球客户信赖。",
    "story1_desc2_en": "Our products are exported to over 30 countries and regions including Europe, America, and Southeast Asia.",
    "story2_title_zh": "质量承诺",
    "story2_title_en": "Quality Commitment",
    "story2_desc1_zh": "我们坚持'质量第一，客户至上'的经营理念，建立了严格的质量控制体系，确保每一件产品都符合国际标准。",
    "story2_desc1_en": "We adhere to 'Quality First, Customer First' philosophy with strict quality control to meet international standards.",
    "story2_desc2_zh": "持续创新，投入研发，不断推出符合市场需求的新产品，为客户创造价值。",
    "story2_desc2_en": "Continuous innovation and R&D investment to launch new products that meet market demands and create value for customers.",
    "contact_email": "info@mingping-cleaning.com",
    "contact_phone": "+86 123 4567 8900",
    "contact_address_zh": "中国广东省 工业园区",
    "contact_address_en": "Industrial Park, Guangdong Province, China"
}

# 产品模板数据 (品号格式: C10.01.0001, prefix格式: MP007)
PRODUCT_TEMPLATES = {
    "MP": [
        {"nameZh": "多功能清洁套装", "nameEn": "Multi-Purpose Cleaning Kit", "price": 199},
        {"nameZh": "家庭清洁组合", "nameEn": "Home Cleaning Combo", "price": 159},
        {"nameZh": "专业清洁套装", "nameEn": "Professional Cleaning Set", "price": 229},
    ],
    "TB": [
        {"nameZh": "旋转拖把", "nameEn": "Spin Mop", "price": 89},
        {"nameZh": "平板拖把", "nameEn": "Flat Mop", "price": 69},
        {"nameZh": "蒸汽拖把", "nameEn": "Steam Mop", "price": 299},
        {"nameZh": "微纤维拖把", "nameEn": "Microfiber Mop", "price": 79},
    ],
    "T": [
        {"nameZh": "伸缩杆", "nameEn": "Telescopic Pole", "price": 39},
        {"nameZh": "铝合金杆", "nameEn": "Aluminum Pole", "price": 49},
        {"nameZh": "不锈钢杆", "nameEn": "Stainless Steel Pole", "price": 59},
    ],
    "B": [
        {"nameZh": "超细纤维拖把头", "nameEn": "Microfiber Mop Head", "price": 29},
        {"nameZh": "棉质拖把头", "nameEn": "Cotton Mop Head", "price": 19},
        {"nameZh": "替换拖把头", "nameEn": "Replacement Mop Head", "price": 25},
    ],
    "S": [
        {"nameZh": "马桶刷", "nameEn": "Toilet Brush", "price": 25},
        {"nameZh": "清洁刷套装", "nameEn": "Cleaning Brush Set", "price": 45},
        {"nameZh": "多功能刷", "nameEn": "Multi-Purpose Brush", "price": 35},
    ],
    "CG": [
        {"nameZh": "玻璃刮", "nameEn": "Window Squeegee", "price": 35},
        {"nameZh": "地刮", "nameEn": "Floor Squeegee", "price": 55},
        {"nameZh": "专业刮水器", "nameEn": "Professional Squeegee", "price": 65},
    ],
    "CD": [
        {"nameZh": "鸡毛掸子", "nameEn": "Feather Duster", "price": 15},
        {"nameZh": "静电除尘掸", "nameEn": "Static Duster", "price": 29},
        {"nameZh": "伸缩除尘器", "nameEn": "Telescopic Duster", "price": 39},
    ],
    "MB": [
        {"nameZh": "超细纤维抹布", "nameEn": "Microfiber Cloth", "price": 12},
        {"nameZh": "清洁抹布套装", "nameEn": "Cleaning Cloth Set", "price": 35},
        {"nameZh": "专业擦拭布", "nameEn": "Professional Wipe Cloth", "price": 25},
    ],
    "QC": [
        {"nameZh": "汽车清洁套装", "nameEn": "Car Cleaning Kit", "price": 89},
        {"nameZh": "洗车刷", "nameEn": "Car Wash Brush", "price": 45},
        {"nameZh": "车内清洁组合", "nameEn": "Interior Cleaning Combo", "price": 69},
    ],
    "CW": [
        {"nameZh": "宠物毛发清理器", "nameEn": "Pet Hair Remover", "price": 39},
        {"nameZh": "宠物清洁套装", "nameEn": "Pet Cleaning Set", "price": 69},
    ],
    "W": [
        {"nameZh": "外购清洁用品", "nameEn": "Outsourced Cleaning Supplies", "price": 50},
    ]
}

def login_admin():
    """管理员登录"""
    global ADMIN_TOKEN
    response = requests.post(f"{API_BASE_URL}/auth/login", json={
        "username": "admin",
        "password": "admin123456"
    })
    if response.status_code == 200:
        ADMIN_TOKEN = response.json()["access_token"]
        print("✅ 管理员登录成功")
        return True
    else:
        print(f"❌ 登录失败: {response.text}")
        return False

def get_headers():
    """获取请求头"""
    return {
        "Authorization": f"Bearer {ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }

def upload_image(image_path):
    """上传图片"""
    if not os.path.exists(image_path):
        print(f"⚠️ 图片不存在: {image_path}")
        return None

    with open(image_path, 'rb') as f:
        files = {'file': (os.path.basename(image_path), f, 'image/png')}
        headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
        response = requests.post(f"{API_BASE_URL}/upload/image", files=files, headers=headers)

        if response.status_code == 200:
            url = response.json()["url"]
            print(f"  ✅ 上传图片: {os.path.basename(image_path)}")
            return url
        else:
            print(f"  ❌ 上传失败: {response.text}")
            return None

def create_categories():
    """创建分类"""
    print("\n📁 创建分类...")
    headers = get_headers()

    for cat in CATEGORIES:
        response = requests.post(f"{API_BASE_URL}/categories", json=cat, headers=headers)
        if response.status_code == 201:
            print(f"  ✅ 创建分类: {cat['nameZh']} ({cat['code']})")
        else:
            print(f"  ⚠️ 分类可能已存在: {cat['nameZh']}")

def update_homepage_config():
    """更新首页配置"""
    print("\n🏠 更新首页配置...")
    headers = get_headers()

    response = requests.put(f"{API_BASE_URL}/system/homepage", json=HOMEPAGE_CONFIG, headers=headers)
    if response.status_code == 200:
        print("  ✅ 首页配置更新成功")
    else:
        print(f"  ❌ 首页配置更新失败: {response.text}")

def update_about_config():
    """更新关于我们配置"""
    print("\n📄 更新关于我们配置...")
    headers = get_headers()

    response = requests.put(f"{API_BASE_URL}/system/about", json=ABOUT_CONFIG, headers=headers)
    if response.status_code == 200:
        print("  ✅ 关于我们配置更新成功")
    else:
        print(f"  ❌ 关于我们配置更新失败: {response.text}")

def create_product_group(category_code, prefix_num, name_zh, name_en, image_url):
    """创建产品组"""
    headers = get_headers()
    prefix = f"{category_code}{str(prefix_num).zfill(3)}"

    data = {
        "prefix": prefix,
        "groupNameZh": name_zh,
        "groupNameEn": name_en,
        "categoryCode": category_code,
        "mainImage": image_url,
        "status": "ACTIVE"
    }

    response = requests.post(f"{API_BASE_URL}/products/groups", json=data, headers=headers)
    if response.status_code == 201:
        group_id = response.json()["id"]
        print(f"  ✅ 创建产品组: {prefix} - {name_zh}")
        return group_id
    else:
        print(f"  ❌ 创建产品组失败: {response.text}")
        return None

def create_sku(group_id, product_code, name, price, image_urls):
    """创建SKU"""
    headers = get_headers()
    data = {
        "productCode": product_code,
        "productName": name,
        "price": str(price),
        "groupId": group_id,
        "status": "ACTIVE",
        "images": image_urls,
        "productSpec": [],
        "additionalAttributes": []
    }

    response = requests.post(f"{API_BASE_URL}/products/skus", json=data, headers=headers)
    if response.status_code == 201:
        print(f"    ✅ 创建SKU: {product_code} - {name} - ¥{price}")
        return True
    else:
        print(f"    ❌ 创建SKU失败: {response.text}")
        return False

def generate_mock_data():
    """生成Mock数据"""
    print("\n🚀 开始生成Mock数据...\n")

    # 1. 登录
    if not login_admin():
        return

    # 2. 创建分类
    create_categories()

    # 3. 上传图片
    print("\n📸 上传图片...")
    uploaded_images = []
    for img in IMAGES[:10]:  # 只上传前10张
        img_path = os.path.join(IMAGE_DIR, img)
        url = upload_image(img_path)
        if url:
            uploaded_images.append(url)

    if len(uploaded_images) == 0:
        print("❌ 没有成功上传的图片，停止执行")
        return

    # 4. 更新首页和关于我们配置
    update_homepage_config()
    update_about_config()

    # 5. 创建产品 (品号格式: C10.01.0001, prefix格式: MP007)
    print("\n📦 创建产品...")
    img_index = 0
    sku_counter = 1  # 全局SKU计数器

    for cat_code, products in PRODUCT_TEMPLATES.items():
        print(f"\n分类: {cat_code}")

        for product_index, product in enumerate(products, start=1):
            # 使用循环图片
            image_url = uploaded_images[img_index % len(uploaded_images)]
            img_index += 1

            # 创建产品组 (prefix格式: MP007, TB002, QC003)
            group_id = create_product_group(
                cat_code,
                product_index,
                product["nameZh"],
                product["nameEn"],
                image_url
            )

            if group_id:
                # 创建SKU (品号格式: C10.01.0014)
                product_code = f"C10.{str(product_index).zfill(2)}.{str(sku_counter).zfill(4)}"
                sku_counter += 1

                create_sku(
                    group_id,
                    product_code,
                    product["nameZh"],
                    product["price"],
                    [image_url]
                )

    print("\n\n✅ Mock数据生成完成！")
    print(f"📊 统计:")
    print(f"  - 分类: {len(CATEGORIES)}个")
    print(f"  - 图片: {len(uploaded_images)}张")
    print(f"  - 产品组: ~{sum(len(products) for products in PRODUCT_TEMPLATES.values())}个")
    print(f"  - 配置: 首页+关于我们")

if __name__ == "__main__":
    generate_mock_data()
