'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import { ArrowLeft, Plus, FolderPlus } from 'lucide-react';

interface Category {
  id: string;
  code: string;
  nameZh: string;
  nameEn?: string;
}

export default function CreateGroupPage() {
  const router = useRouter();
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    prefix: '',
    groupNameZh: '',
    groupNameEn: '',
    categoryId: '',
    isPublished: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await productApi.getCategories();
      setCategories(Array.isArray(data) ? data : data.data || []);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      toast.error('加载分类失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prefix.trim()) {
      toast.error('请输入产品系列前缀');
      return;
    }

    if (!formData.groupNameZh.trim()) {
      toast.error('请输入系列中文名称');
      return;
    }

    if (!formData.categoryId) {
      toast.error('请选择产品分类');
      return;
    }

    setCreating(true);
    try {
      await productApi.createGroup({
        prefix: formData.prefix.trim().toUpperCase(),
        groupNameZh: formData.groupNameZh.trim(),
        groupNameEn: formData.groupNameEn.trim() || undefined,
        categoryId: formData.categoryId,
        isPublished: formData.isPublished,
      });

      toast.success('产品系列创建成功！');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Failed to create group:', error);
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
        <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-6 mb-8 border border-emerald-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FolderPlus className="text-emerald-600" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">新增产品系列</h1>
              <p className="text-gray-600 mt-1">
                创建新的产品系列（SKU），用于管理同类产品
              </p>
            </div>
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">系列信息</h2>

            <div className="space-y-5">
              {/* 系列前缀 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  系列前缀 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                  placeholder="例如: TB001, MP007, S002"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all uppercase"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  此前缀将用于该系列下所有产品编码，建议使用英文字母+数字组合
                </p>
              </div>

              {/* 中文名称 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  系列中文名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.groupNameZh}
                  onChange={(e) => setFormData({ ...formData, groupNameZh: e.target.value })}
                  placeholder="输入系列中文名称"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* 英文名称 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  系列英文名称
                </label>
                <input
                  type="text"
                  value={formData.groupNameEn}
                  onChange={(e) => setFormData({ ...formData, groupNameEn: e.target.value })}
                  placeholder="输入系列英文名称（可选）"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 产品分类 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  产品分类 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">请选择分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nameZh} {category.nameEn ? `(${category.nameEn})` : ''}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ 暂无可用分类，请先创建产品分类
                  </p>
                )}
              </div>

              {/* 发布状态 */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">发布到商城</span>
                    <p className="text-xs text-gray-500">选中后，此系列将显示在前台商城中</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 示例说明 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-blue-900 mb-3">📋 系列前缀示例</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white/80 rounded-lg p-3">
                <div className="font-semibold text-blue-700">TB001</div>
                <div className="text-gray-600 text-xs mt-1">拖把系列</div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="font-semibold text-blue-700">MP007</div>
                <div className="text-gray-600 text-xs mt-1">清洁四件套</div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="font-semibold text-blue-700">S002</div>
                <div className="text-gray-600 text-xs mt-1">刷子系列</div>
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              💡 <strong>提示:</strong> 创建系列后，您可以在系列中添加具体的产品规格。
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
              disabled={creating || categories.length === 0}
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
                  <span>创建系列</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
