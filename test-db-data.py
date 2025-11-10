import sqlite3
import json

conn = sqlite3.connect('./code/backend-api/prisma/dev.db')
cursor = conn.cursor()

cursor.execute("""
    SELECT id, productCode, productName, productSpec, additionalAttributes
    FROM ProductSku
    WHERE additionalAttributes IS NOT NULL
    LIMIT 1
""")

row = cursor.fetchone()

if row:
    print('=== SKU数据 ===')
    print(f'ID: {row[0]}')
    print(f'品号: {row[1]}')
    print(f'品名: {row[2]}')
    print(f'\n=== productSpec (原始) ===')
    print(row[3])
    print(f'\n=== additionalAttributes (原始) ===')
    print(row[4])

    if row[3]:
        try:
            spec = json.loads(row[3])
            print(f'\n=== productSpec (解析后) ===')
            print(json.dumps(spec, indent=2, ensure_ascii=False))
        except:
            print('productSpec 不是有效JSON')

    if row[4]:
        try:
            attrs = json.loads(row[4])
            print(f'\n=== additionalAttributes (解析后) ===')
            print(json.dumps(attrs, indent=2, ensure_ascii=False))
        except:
            print('additionalAttributes 不是有效JSON')
else:
    print('没有找到包含additionalAttributes的SKU数据')

conn.close()
