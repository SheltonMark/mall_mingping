import requests
import json

response = requests.get('http://8.141.127.26:3001/api/products/groups?limit=100')
data = response.json()

groups = data.get('data', [])
print(f'总共有 {len(groups)} 个商品组')

no_skus = [g for g in groups if not g.get('skus') or len(g.get('skus', [])) == 0]
print(f'没有SKU的商品组: {len(no_skus)}')
print(f'有SKU的商品组: {len(groups) - len(no_skus)}')

if no_skus:
    print('\n没有SKU的商品组列表:')
    for g in no_skus:
        print(f"  - {g.get('groupNameZh', 'N/A')} (ID: {g.get('id')})")

with_skus = [g for g in groups if g.get('skus') and len(g.get('skus', [])) > 0]
print(f'\n前9个有SKU的商品:')
for i, g in enumerate(with_skus[:9], 1):
    print(f"  {i}. {g.get('groupNameZh', 'N/A')} - SKUs: {len(g.get('skus', []))}")
