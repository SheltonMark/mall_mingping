'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import { ArrowLeft, Plus, Package } from 'lucide-react';

interface ProductGroup {
  id: string;
  prefix: string;
  groupNameZh: string;
  groupNameEn?: string;
}

export default function NewProductSkuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const toast = useToast();

  const [group, setGroup] = useState<ProductGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    productCode: '',
    productName: '',
    title: '',
    subtitle: '',
    brand: '',
    specification: '',
    price: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (!groupId) {
      toast.error('缺少产品组ID');
      router.push('/admin/products');
      return;
    }
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const data = await productApi.getGroup(groupId!);
      setGroup(data);

      // 自动填充产品编码前缀
      if (data.prefix) {
        setFormData(prev => ({
          ...prev,
          productCode: data.prefix + '-'
        }));
      }
    } catch (error: any) {
      console.error('Failed to load group:', error);
      toast.error('加载产品组失败');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productCode.trim()) {
      toast.error('请输入产品编码');
      return;
    }

    if (!formData.productName.trim()) {
      toast.error('请输入产品名称');
      return;
    }

    setCreating(true);
    try {
      await productApi.createSku({
        ...formData,
        groupId: groupId!,
        price: formData.price ? parseFloat(formData.price) : undefined,
      });

      toast.success('产品规格创建成功！');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Failed to create SKU:', error);
      toast.error(`创建失败: ${error.message || '未知错误'}`);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ButtonLoader />
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/admin/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回产品列表</span>
          </button>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 页头 */}
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 mb-8 border border-green-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
              <Package className="text-green-600" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">新增产品规格</h1>
              <p className="text-gray-600 mt-1">
                为 <span className="font-semibold text-green-700">{group.groupNameZh}</span> 系列添加新规格
              </p>
            </div>
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">基本信息</h2>

            <div className="space-y-5">
              {/* 产品编码 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  产品编码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productCode}
                  onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  placeholder={`例如: ${group.prefix}-001`}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  建议格式: {group.prefix}-XXX，其中XXX为序号
                </p>
              </div>

              {/* 产品名称 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  产品名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="输入产品名称"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* 主标题 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  主标题
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="产品主标题（可选）"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 副标题 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  副标题
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="产品副标题（可选）"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 品牌 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  品牌
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="产品品牌（可选）"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 规格说明 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  规格说明
                </label>
                <textarea
                  value={formData.specification}
                  onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  placeholder="产品规格说明（可选）"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* 价格 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  价格
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">¥</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* 状态 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="ACTIVE">上架</option>
                  <option value="INACTIVE">下架</option>
                </select>
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>提示:</strong> 创建后，您可以在编辑页面添加图片、视频和更多详细信息。
            </p>
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <ButtonLoader />
                  <span>创建中...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>创建规格</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
