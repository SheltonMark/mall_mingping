#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import requests

API_BASE_URL = "http://localhost:3001/api"

response = requests.post(f"{API_BASE_URL}/auth/login", json={
    "username": "admin",
    "password": "admin123"
})

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
