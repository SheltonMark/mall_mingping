#!/bin/bash
# SSH密钥认证设置脚本 - 免密码登录服务器

echo "=========================================="
echo "SSH密钥认证设置 - 免密码登录"
echo "=========================================="
echo ""

# 1. 检查是否已有SSH密钥
if [ -f ~/.ssh/id_rsa.pub ]; then
    echo "✓ 本地SSH密钥已存在: ~/.ssh/id_rsa.pub"
else
    echo "× 本地没有SSH密钥，正在生成..."
    ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/id_rsa -N ""
    echo "✓ SSH密钥已生成"
fi

echo ""
echo "你的公钥内容："
echo "----------------------------------------"
cat ~/.ssh/id_rsa.pub
echo "----------------------------------------"
echo ""

# 2. 将公钥复制到服务器
echo "正在将公钥复制到服务器..."
echo "注意：需要输入服务器密码 25884hsY!"
echo ""

# 使用ssh-copy-id命令（最简单的方式）
ssh-copy-id -i ~/.ssh/id_rsa.pub root@8.141.127.26

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ SSH密钥认证设置成功！"
    echo "=========================================="
    echo ""
    echo "现在可以免密码登录服务器："
    echo "  ssh root@8.141.127.26"
    echo ""
    echo "测试一下："
    ssh root@8.141.127.26 "echo '✓ SSH密钥认证工作正常！'"
else
    echo ""
    echo "× 设置失败，请手动执行以下步骤："
    echo ""
    echo "1. 复制上面显示的公钥内容"
    echo "2. 登录服务器："
    echo "   ssh root@8.141.127.26"
    echo "3. 在服务器上执行："
    echo "   mkdir -p ~/.ssh"
    echo "   chmod 700 ~/.ssh"
    echo "   echo '你的公钥' >> ~/.ssh/authorized_keys"
    echo "   chmod 600 ~/.ssh/authorized_keys"
fi
