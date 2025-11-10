#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Mock数据库数据生成脚本 v2 - 带详细日志
"""

import requests
import json
import os
import sys

# 后端API地址
API_BASE_URL = "http://localhost:3001/api"
ADMIN_TOKEN = None

# 分类数据
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
    "coll1.png", "coll2.png", "coll3.png", "coll4.png",
    "unnamed.png", "unnamed (1).png", "unnamed (2).png",
    "unnamed (3).png", "unnamed (4).png", "unnamed (5).png"
]

# 首页配置
HOMEPAGE_CONFIG = {
    "hero_title_zh": "专业清洁解决方案",
    "hero_title_en": "Professional Cleaning Solutions",
    "hero_subtitle_zh": "为您的家庭和企业提供优质清洁产品",
    "hero_subtitle_en": "Quality cleaning products for your home and business",
    "featured_products": json.dumps([
        {"titleZh": "组合套装系列", "titleEn": "Combo Sets Collection",
         "descriptionZh": "一站式清洁解决方案，满足全方位清洁需求",
         "descriptionEn": "One-stop cleaning solutions for all your needs",
         "categoryCode": "MP"},
        {"titleZh": "拖把系列", "titleEn": "Mop Collection",
         "descriptionZh": "创新设计，高效清洁，让地板焕然一新",
         "descriptionEn": "Innovative designs for efficient floor cleaning",
         "categoryCode": "TB"},
        {"titleZh": "刷类系列", "titleEn": "Brush Collection",
         "descriptionZh": "专业清洁工具，应对各种清洁挑战",
         "descriptionEn": "Professional cleaning tools for every challenge",
         "categoryCode": "S"},
        {"titleZh": "车用清洁系列", "titleEn": "Car Cleaning Collection",
         "descriptionZh": "专业汽车清洁用品，呵护您的爱车",
         "descriptionEn": "Professional car care products for your vehicle",
         "categoryCode": "QC"}
    ])
}

# 关于我们配置
ABOUT_CONFIG = {
    "hero_title_line1_zh": "专业清洁用品",
    "hero_title_line1_en": "Professional Cleaning",
    "hero_title_line2_zh": "值得信赖的品质",
    "hero_title_line2_en": "Trusted Quality",
    "story1_title_zh": "我们的故事",
    "story1_title_en": "Our Story",
    "story1_desc1_zh": "明平清洁成立于2010年，专注于研发和生产高品质的清洁用品。",
    "story1_desc1_en": "Founded in 2010, Mingping Cleaning specializes in high-quality cleaning supplies.",
}

# 产品模板（简化版，每个分类1-2个产品）
PRODUCT_TEMPLATES = {
    "MP": [{"nameZh": "多功能清洁套装", "nameEn": "Multi-Purpose Cleaning Kit", "price": 199}],
    "TB": [{"nameZh": "旋转拖把", "nameEn": "Spin Mop", "price": 89}],
    "T": [{"nameZh": "伸缩杆", "nameEn": "Telescopic Pole", "price": 39}],
    "B": [{"nameZh": "超细纤维拖把头", "nameEn": "Microfiber Mop Head", "price": 29}],
    "S": [{"nameZh": "马桶刷", "nameEn": "Toilet Brush", "price": 25}],
    "CG": [{"nameZh": "玻璃刮", "nameEn": "Window Squeegee", "price": 35}],
    "CD": [{"nameZh": "鸡毛掸子", "nameEn": "Feather Duster", "price": 15}],
    "MB": [{"nameZh": "超细纤维抹布", "nameEn": "Microfiber Cloth", "price": 12}],
    "QC": [{"nameZh": "汽车清洁套装", "nameEn": "Car Cleaning Kit", "price": 89}],
    "CW": [{"nameZh": "宠物毛发清理器", "nameEn": "Pet Hair Remover", "price": 39}],
    "W": [{"nameZh": "外购清洁用品", "nameEn": "Outsourced Cleaning Supplies", "price": 50}]
}

def login_admin():
    """管理员登录"""
    global ADMIN_TOKEN
    print("\n[步骤1] 管理员登录...")
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            json={"username": "admin", "password": "admin123456"},
            timeout=10
        )
        print(f"  状态码: {response.status_code}")

        if response.status_code == 200:
            ADMIN_TOKEN = response.json()["access_token"]
            print(f"  ✅ 登录成功! Token: {ADMIN_TOKEN[:20]}...")
            return True
        else:
            print(f"  ❌ 登录失败: {response.text}")
            return False
    except Exception as e:
        print(f"  ❌ 登录异常: {str(e)}")
        return False

def get_headers():
    return {
        "Authorization": f"Bearer {ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }

def upload_image(image_path):
    """上传图片"""
    if not os.path.exists(image_path):
        print(f"    ⚠️ 图片不存在: {image_path}")
        return None

    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/png')}
            headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
            response = requests.post(
                f"{API_BASE_URL}/upload/image",
                files=files,
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                url = response.json()["url"]
                print(f"    ✅ 上传: {os.path.basename(image_path)} -> {url}")
                return url
            else:
                print(f"    ❌ 上传失败 ({response.status_code}): {response.text[:100]}")
                return None
    except Exception as e:
        print(f"    ❌ 上传异常: {str(e)}")
        return None

def create_categories():
    """创建分类"""
    print("\n[步骤3] 创建分类...")
    headers = get_headers()
    success_count = 0

    for cat in CATEGORIES:
        try:
            response = requests.post(
                f"{API_BASE_URL}/categories",
                json=cat,
                headers=headers,
                timeout=10
            )
            if response.status_code == 201:
                print(f"  ✅ 创建: {cat['code']} - {cat['nameZh']}")
                success_count += 1
            elif response.status_code == 409 or "already exists" in response.text.lower():
                print(f"  ⚠️ 已存在: {cat['code']} - {cat['nameZh']}")
                success_count += 1
            else:
                print(f"  ❌ 失败 ({response.status_code}): {cat['code']} - {response.text[:100]}")
        except Exception as e:
            print(f"  ❌ 异常: {cat['code']} - {str(e)}")

    print(f"  总计: {success_count}/{len(CATEGORIES)} 个分类")
    return success_count

def update_homepage_config():
    """更新首页配置"""
    print("\n[步骤4] 更新首页配置...")
    headers = get_headers()
    try:
        response = requests.put(
            f"{API_BASE_URL}/system/homepage",
            json=HOMEPAGE_CONFIG,
            headers=headers,
            timeout=10
        )
        if response.status_code == 200:
            print(f"  ✅ 首页配置更新成功")
            return True
        else:
            print(f"  ❌ 失败 ({response.status_code}): {response.text[:100]}")
            return False
    except Exception as e:
        print(f"  ❌ 异常: {str(e)}")
        return False

def update_about_config():
    """更新关于我们配置"""
    print("\n[步骤5] 更新关于我们配置...")
    headers = get_headers()
    try:
        response = requests.put(
            f"{API_BASE_URL}/system/about",
            json=ABOUT_CONFIG,
            headers=headers,
            timeout=10
        )
        if response.status_code == 200:
            print(f"  ✅ 关于我们配置更新成功")
            return True
        else:
            print(f"  ❌ 失败 ({response.status_code}): {response.text[:100]}")
            return False
    except Exception as e:
        print(f"  ❌ 异常: {str(e)}")
        return False

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

    try:
        response = requests.post(
            f"{API_BASE_URL}/products/groups",
            json=data,
            headers=headers,
            timeout=10
        )
        if response.status_code == 201:
            group_id = response.json()["id"]
            print(f"    ✅ 产品组: {prefix} - {name_zh}")
            return group_id
        else:
            print(f"    ❌ 失败 ({response.status_code}): {response.text[:100]}")
            return None
    except Exception as e:
        print(f"    ❌ 异常: {str(e)}")
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

    try:
        response = requests.post(
            f"{API_BASE_URL}/products/skus",
            json=data,
            headers=headers,
            timeout=10
        )
        if response.status_code == 201:
            print(f"      ✅ SKU: {product_code} - {name} (¥{price})")
            return True
        else:
            print(f"      ❌ 失败 ({response.status_code}): {response.text[:100]}")
            return False
    except Exception as e:
        print(f"      ❌ 异常: {str(e)}")
        return False

def generate_mock_data():
    """生成Mock数据"""
    print("=" * 60)
    print("🚀 Mock数据生成脚本 v2")
    print("=" * 60)

    # 1. 登录
    if not login_admin():
        print("\n❌ 登录失败，停止执行")
        return False

    # 2. 上传图片
    print("\n[步骤2] 上传图片...")
    uploaded_images = []
    for img in IMAGES[:5]:  # 只上传5张
        img_path = os.path.join(IMAGE_DIR, img)
        url = upload_image(img_path)
        if url:
            uploaded_images.append(url)

    if len(uploaded_images) == 0:
        print("  ❌ 没有成功上传的图片，停止执行")
        return False
    print(f"  ✅ 成功上传 {len(uploaded_images)} 张图片")

    # 3. 创建分类
    cat_count = create_categories()
    if cat_count == 0:
        print("  ❌ 没有创建任何分类")
        return False

    # 4-5. 更新配置
    update_homepage_config()
    update_about_config()

    # 6. 创建产品
    print("\n[步骤6] 创建产品...")
    img_index = 0
    sku_counter = 1
    product_count = 0

    for cat_code, products in PRODUCT_TEMPLATES.items():
        print(f"\n  分类 {cat_code}:")
        for product_index, product in enumerate(products, start=1):
            image_url = uploaded_images[img_index % len(uploaded_images)]
            img_index += 1

            group_id = create_product_group(
                cat_code, product_index,
                product["nameZh"], product["nameEn"],
                image_url
            )

            if group_id:
                product_code = f"C10.{str(product_index).zfill(2)}.{str(sku_counter).zfill(4)}"
                sku_counter += 1
                if create_sku(group_id, product_code, product["nameZh"], product["price"], [image_url]):
                    product_count += 1

    print("\n" + "=" * 60)
    print("✅ Mock数据生成完成!")
    print("=" * 60)
    print(f"📊 统计:")
    print(f"  - 分类: {cat_count} 个")
    print(f"  - 图片: {len(uploaded_images)} 张")
    print(f"  - 产品: {product_count} 个")
    print("=" * 60)
    return True

if __name__ == "__main__":
    try:
        success = generate_mock_data()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️ 用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ 致命错误: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
