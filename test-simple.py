#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import requests
import sys

print("测试开始...")
sys.stdout.flush()

API_BASE_URL = "http://localhost:3001/api"

print("尝试登录...")
sys.stdout.flush()

try:
    response = requests.post(
        f"{API_BASE_URL}/auth/login",
        json={"username": "admin", "password": "admin123456"},
        timeout=10
    )
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.text}")
    sys.stdout.flush()
except Exception as e:
    print(f"错误: {str(e)}")
    sys.stdout.flush()
