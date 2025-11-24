#!/bin/bash

# 备份原文件
cp Navbar.tsx Navbar.tsx.backup

# 删除桌面版语言切换按钮 (第124-131行)
sed -i '124,131d' Navbar.tsx

# 查找并删除移动版语言切换按钮
# 移动版在第260行附近
sed -i '/Language.*Mobile/,+8d' Navbar.tsx

# 再次检查并删除任何剩余的语言切换按钮
sed -i '/setLanguage.*language.*en.*zh/,+5d' Navbar.tsx

echo "✅ 语言切换按钮已删除"
