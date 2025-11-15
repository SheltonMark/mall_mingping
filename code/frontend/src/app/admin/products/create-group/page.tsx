'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import { ArrowLeft, Plus, FolderPlus, X, Trash2 } from 'lucide-react';
import CustomSelect from '@/components/common/CustomSelect';

interface Category {
  id: string;
  code: string;
  nameZh: string;
  nameEn?: string;
}

interface OptionalAttribute {
  nameZh: string;
  nameEn: string;
}

export default function CreateGroupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('id'); // 如果有ID，则是编辑模式
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

  // 附加属性管理
  const [optionalAttributes, setOptionalAttributes] = useState<OptionalAttribute[]>([]);
  const [currentAttribute, setCurrentAttribute] = useState<OptionalAttribute>({
    nameZh: '',
    nameEn: ''
  });

  useEffect(() => {
    loadCategories();
    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const data = await productApi.getGroup(groupId!);
      setFormData({
        prefix: data.prefix,
        groupNameZh: data.groupNameZh,
        groupNameEn: data.groupNameEn || '',
        categoryId: data.categoryId,
        isPublished: data.isPublished !== false,
      });

      // 加载附加属性
      if (data.optionalAttributes) {
        try {
          const attrs = typeof data.optionalAttributes === 'string'
            ? JSON.parse(data.optionalAttributes)
            : data.optionalAttributes;
          setOptionalAttributes(Array.isArray(attrs) ? attrs : []);
        } catch (e) {
          console.error('Failed to parse optionalAttributes:', e);
          setOptionalAttributes([]);
        }
      }
    } catch (error: any) {
      console.error('Failed to load group:', error);
      toast.error('加载产品组失败: ' + error.message);
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

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

  // 添加附加属性
  const handleAddAttribute = () => {
    if (!currentAttribute.nameZh.trim()) {
      toast.error('请输入中文名称');
      return;
    }
    if (!currentAttribute.nameEn.trim()) {
      toast.error('请输入英文名称');
      return;
    }

    setOptionalAttributes([...optionalAttributes, currentAttribute]);
    setCurrentAttribute({ nameZh: '', nameEn: '' });
    toast.success('附加属性已添加');
  };

  // 删除附加属性
  const handleDeleteAttribute = (index: number) => {
    setOptionalAttributes(optionalAttributes.filter((_, i) => i !== index));
    toast.success('附加属性已删除');
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

    if (!formData.groupNameEn.trim()) {
      toast.error('请输入系列英文名称');
      return;
    }

    if (!formData.categoryId) {
      toast.error('请选择产品分类');
      return;
    }

    if (optionalAttributes.length === 0) {
      toast.error('请至少添加一个附加属性');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        prefix: formData.prefix.trim().toUpperCase(),
        groupNameZh: formData.groupNameZh.trim(),
        groupNameEn: formData.groupNameEn.trim(),
        categoryId: formData.categoryId,
        isPublished: formData.isPublished,
        optionalAttributes: optionalAttributes,
      };

      if (groupId) {
        // 编辑模式
        await productApi.updateGroup(groupId, payload);
        toast.success('产品系列更新成功！');
      } else {
        // 创建模式
        await productApi.createGroup(payload);
        toast.success('产品系列创建成功！');
      }

      router.push('/admin/products?scrollToBottom=true');
    } catch (error: any) {
      console.error('Failed to save group:', error);
      toast.error(`${groupId ? '更新' : '创建'}失败: ${error.message || '未知错误'}`);
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
              <h1 className="text-2xl font-bold text-gray-900">
                {groupId ? '编辑产品系列' : '新增产品系列'}
              </h1>
              <p className="text-gray-600 mt-1">
                {groupId ? '修改产品系列信息和附加属性' : '创建新的产品系列（SKU），用于管理同类产品'}
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
                  系列英文名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.groupNameEn}
                  onChange={(e) => setFormData({ ...formData, groupNameEn: e.target.value })}
                  placeholder="输入系列英文名称"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* 产品分类 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  产品分类 <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={[
                    { value: '', label: '请选择分类' },
                    ...categories.map((category) => ({
                      value: category.id,
                      label: `${category.nameZh}${category.nameEn ? ` (${category.nameEn})` : ''}`
                    }))
                  ]}
                  value={formData.categoryId}
                  onChange={(value) => setFormData({ ...formData, categoryId: value })}
                />
                {categories.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ 暂无可用分类，请先创建产品分类
                  </p>
                )}
              </div>

              {/* 附加属性管理 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  附加属性 <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  用户在前端购买时会从这些选项中选择一个（例如：不同的颜色组合方案）
                </p>

                {/* 已添加的属性列表 */}
                {optionalAttributes.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                    {optionalAttributes.map((attr, index) => (
                      <div key={index} className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <div className="text-gray-900 font-medium">{attr.nameZh}</div>
                          <div className="text-sm text-gray-500">{attr.nameEn}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAttribute(index)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 添加新属性 */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        中文名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={currentAttribute.nameZh}
                        onChange={(e) => setCurrentAttribute({ ...currentAttribute, nameZh: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAttribute();
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="例如：全部3C冷灰"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        英文名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={currentAttribute.nameEn}
                        onChange={(e) => setCurrentAttribute({ ...currentAttribute, nameEn: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAttribute();
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="例如：All 3C Cool Gray"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    添加属性
                  </button>
                </div>

                {optionalAttributes.length === 0 && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ 至少需要添加一个附加属性
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
                  <span>{groupId ? '更新中...' : '创建中...'}</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>{groupId ? '更新系列' : '创建系列'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
