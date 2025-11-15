'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import { ArrowLeft, Plus, Package, Trash2, Edit2, X } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmModal from '@/components/common/ConfirmModal';
import CustomSelect from '@/components/common/CustomSelect';

interface ProductGroup {
  id: string;
  prefix: string;
  groupNameZh: string;
  groupNameEn?: string;
}

interface Component {
  code: string;
  name: string;
  spec: string;
  description?: string;
}

interface ColorPart {
  part: string;
  color: string;
  hexColor?: string; // 新增：16进制颜色值
}

interface ComponentColor {
  componentCode: string;
  colors: ColorPart[];
}

export default function NewProductSkuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const toast = useToast();
  const { confirm, isOpen, options, handleConfirm, handleClose } = useConfirm();

  const [group, setGroup] = useState<ProductGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    productCode: '',
    productName: '',
    title: '',
    subtitle: '',
    specification: '',
    price: '',
    status: 'ACTIVE',
  });

  // 组件管理状态
  const [components, setComponents] = useState<Component[]>([]);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);

  // 配色管理状态
  const [componentColors, setComponentColors] = useState<ComponentColor[]>([]);
  const [editingColor, setEditingColor] = useState<ComponentColor | null>(null);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  // 附加属性管理状态
  const [optionalAttributes, setOptionalAttributes] = useState<string[]>([]);
  const [newAttribute, setNewAttribute] = useState('');

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
    } catch (error: any) {
      console.error('Failed to load group:', error);
      toast.error('加载产品组失败');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  // 组件管理函数
  const handleAddComponent = () => {
    setEditingComponent({ code: '', name: '', spec: '', description: '' });
    setIsComponentModalOpen(true);
  };

  const handleEditComponent = (comp: Component) => {
    setEditingComponent({ ...comp });
    setIsComponentModalOpen(true);
  };

  const handleSaveComponent = () => {
    if (!editingComponent) return;

    if (!editingComponent.code.trim()) {
      toast.error('请输入组件编号');
      return;
    }

    if (!editingComponent.name.trim()) {
      toast.error('请输入组件名称');
      return;
    }

    const existingIndex = components.findIndex(c => c.code === editingComponent.code);

    if (existingIndex >= 0) {
      const newComponents = [...components];
      newComponents[existingIndex] = editingComponent;
      setComponents(newComponents);
    } else {
      setComponents([...components, editingComponent]);
    }

    setIsComponentModalOpen(false);
    setEditingComponent(null);
    toast.success('组件已保存');
  };

  const handleDeleteComponent = async (code: string) => {
    const confirmed = await confirm({
      title: '确认删除',
      message: '确定要删除这个组件吗?',
      type: 'danger',
    });
    if (!confirmed) return;

    setComponents(components.filter(c => c.code !== code));
    setComponentColors(componentColors.filter(cc => cc.componentCode !== code));
    toast.success('组件已删除');
  };

  // 配色管理函数
  const handleAddColor = () => {
    setEditingColor({ componentCode: '', colors: [] });
    setIsColorModalOpen(true);
  };

  const handleEditColor = (color: ComponentColor) => {
    setEditingColor({ ...color, colors: [...color.colors] });
    setIsColorModalOpen(true);
  };

  const handleSaveColor = () => {
    if (!editingColor) return;

    if (!editingColor.componentCode.trim()) {
      toast.error('请选择组件编号');
      return;
    }

    if (editingColor.colors.length === 0) {
      toast.error('请至少添加一个配色部件');
      return;
    }

    const existingIndex = componentColors.findIndex(cc => cc.componentCode === editingColor.componentCode);

    if (existingIndex >= 0) {
      const newColors = [...componentColors];
      newColors[existingIndex] = editingColor;
      setComponentColors(newColors);
    } else {
      setComponentColors([...componentColors, editingColor]);
    }

    setIsColorModalOpen(false);
    setEditingColor(null);
    toast.success('配色已保存');
  };

  const handleDeleteColor = async (componentCode: string) => {
    const confirmed = await confirm({
      title: '确认删除',
      message: '确定要删除这个配色方案吗?',
      type: 'danger',
    });
    if (!confirmed) return;

    setComponentColors(componentColors.filter(cc => cc.componentCode !== componentCode));
    toast.success('配色方案已删除');
  };

  const handleAddColorPart = () => {
    if (!editingColor) return;
    setEditingColor({
      ...editingColor,
      colors: [...editingColor.colors, { part: '', color: '', hexColor: '' }]
    });
  };

  const handleUpdateColorPart = (index: number, field: 'part' | 'color' | 'hexColor', value: string) => {
    if (!editingColor) return;
    const newColors = [...editingColor.colors];
    newColors[index][field] = value;
    setEditingColor({ ...editingColor, colors: newColors });
  };

  const handleDeleteColorPart = (index: number) => {
    if (!editingColor) return;
    const newColors = editingColor.colors.filter((_, i) => i !== index);
    setEditingColor({ ...editingColor, colors: newColors });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productCode.trim()) {
      toast.error('请输入品号');
      return;
    }

    if (!formData.productName.trim()) {
      toast.error('请输入品名');
      return;
    }

    // 检查系列英文名称是否存在
    if (!group?.groupNameEn || !group.groupNameEn.trim()) {
      toast.error('系列英文名称为空，请先在产品组管理中设置系列英文名称');
      return;
    }

    setCreating(true);
    try {
      const newSku = await productApi.createSku({
        ...formData,
        groupId: groupId!,
        price: formData.price ? parseFloat(formData.price) : undefined,
        productSpec: components.length > 0 ? components : undefined,
        additionalAttributes: componentColors.length > 0 ? componentColors : undefined,
        optionalAttributes: optionalAttributes.length > 0 ? optionalAttributes : undefined,
      });

      toast.success('产品规格创建成功！');
      // 跳转回产品列表页，并传递新SKU的ID用于滚动定位
      router.push(`/admin/products?scrollTo=${newSku.id}`);
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
        <div className="max-w-7xl mx-auto px-6 py-4">
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
      <div className="max-w-7xl mx-auto px-6 py-8">
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
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* 基本信息 - Centered */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">基本信息</h2>

              <div className="space-y-5">
                {/* 品号 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    品号 <span className="text-red-500">*</span>
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
                    可自由编辑，建议格式: {group.prefix}-XXX
                  </p>
                </div>

                {/* 品名 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    品名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="输入品名"
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

                {/* 附加属性 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    附加属性（可选）
                  </label>
                  <div className="space-y-3">
                    {optionalAttributes.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        {optionalAttributes.map((attr, index) => (
                          <div key={index} className="flex items-center justify-between bg-white px-4 py-2 rounded-lg border border-gray-200">
                            <span className="text-gray-900">{attr}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setOptionalAttributes(optionalAttributes.filter((_, i) => i !== index));
                                toast.success('附加属性已删除');
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAttribute}
                        onChange={(e) => setNewAttribute(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newAttribute.trim() && !optionalAttributes.includes(newAttribute.trim())) {
                              setOptionalAttributes([...optionalAttributes, newAttribute.trim()]);
                              setNewAttribute('');
                              toast.success('附加属性已添加');
                            }
                          }
                        }}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="例如: 深蓝色 / 塑料材质"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newAttribute.trim() && !optionalAttributes.includes(newAttribute.trim())) {
                            setOptionalAttributes([...optionalAttributes, newAttribute.trim()]);
                            setNewAttribute('');
                            toast.success('附加属性已添加');
                          }
                        }}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center gap-2"
                      >
                        <Plus size={18} />
                        添加
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      每个附加属性对应一个可选配置项（例如：颜色、材质等）
                    </p>
                  </div>
                </div>

                {/* 状态 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    状态
                  </label>
                  <CustomSelect
                    options={[
                      { value: 'ACTIVE', label: '上架' },
                      { value: 'INACTIVE', label: '下架' }
                    ]}
                    value={formData.status}
                    onChange={(value) => setFormData({ ...formData, status: value })}
                  />
                </div>
              </div>

            {/* 提交按钮 */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4">
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
          </div>
        </form>
      </div>

      {/* 组件编辑模态框 */}
      {isComponentModalOpen && editingComponent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {components.find(c => c.code === editingComponent.code) ? '编辑组件' : '添加组件'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  组件编号 * <span className="text-xs text-gray-500">(如: A, B, C)</span>
                </label>
                <input
                  type="text"
                  value={editingComponent.code}
                  onChange={(e) => setEditingComponent({ ...editingComponent, code: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="A"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">组件名称 *</label>
                <input
                  type="text"
                  value={editingComponent.name}
                  onChange={(e) => setEditingComponent({ ...editingComponent, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 伸缩铁杆"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">规格参数 *</label>
                <input
                  type="text"
                  value={editingComponent.spec}
                  onChange={(e) => setEditingComponent({ ...editingComponent, spec: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: φ19/22*0.27mm*1200mm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  说明 <span className="text-xs text-gray-500">(选填)</span>
                </label>
                <input
                  type="text"
                  value={editingComponent.description || ''}
                  onChange={(e) => setEditingComponent({ ...editingComponent, description: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 意标螺纹"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsComponentModalOpen(false);
                  setEditingComponent(null);
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveComponent}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 配色编辑模态框 */}
      {isColorModalOpen && editingColor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {componentColors.find(cc => cc.componentCode === editingColor.componentCode) ? '编辑配色' : '添加配色'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">组件编号 *</label>
                <CustomSelect
                  options={[
                    { value: '', label: '请选择组件' },
                    ...components.map(comp => ({
                      value: comp.code,
                      label: `${comp.code} - ${comp.name}`
                    }))
                  ]}
                  value={editingColor.componentCode}
                  onChange={(value) => setEditingColor({ ...editingColor, componentCode: value })}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">配色部件</label>
                  <button
                    type="button"
                    onClick={handleAddColorPart}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium"
                  >
                    <Plus size={14} />
                    添加部件
                  </button>
                </div>

                {editingColor.colors.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    暂无配色部件，点击"添加部件"开始添加
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editingColor.colors.map((colorPart, index) => (
                      <div key={index} className="border-2 border-gray-200 rounded-lg p-3 space-y-2">
                        {/* 部件名 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">部件名称</label>
                          <input
                            type="text"
                            value={colorPart.part}
                            onChange={(e) => handleUpdateColorPart(index, 'part', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            placeholder="如: 喷塑、电镀、拉丝"
                          />
                        </div>

                        {/* 颜色名称 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">颜色名称</label>
                          <input
                            type="text"
                            value={colorPart.color}
                            onChange={(e) => handleUpdateColorPart(index, 'color', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            placeholder="如: 3C冷灰、磨砂黑"
                          />
                        </div>

                        {/* 16进制色号 + 颜色选择器 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">色号 (选填)</label>
                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={colorPart.hexColor || ''}
                                onChange={(e) => handleUpdateColorPart(index, 'hexColor', e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
                                placeholder="#3C3C3C"
                                maxLength={7}
                              />
                              {colorPart.hexColor && (
                                <div
                                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-gray-300"
                                  style={{ backgroundColor: colorPart.hexColor }}
                                />
                              )}
                            </div>
                            <input
                              type="color"
                              value={colorPart.hexColor || '#000000'}
                              onChange={(e) => handleUpdateColorPart(index, 'hexColor', e.target.value)}
                              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                              title="选择颜色"
                            />
                          </div>
                        </div>

                        {/* 常用色板 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">常用色</label>
                          <div className="grid grid-cols-8 gap-1">
                            {[
                              { name: '黑色', hex: '#000000' },
                              { name: '白色', hex: '#FFFFFF' },
                              { name: '冷灰', hex: '#3C3C3C' },
                              { name: '暖灰', hex: '#6B6B6B' },
                              { name: '银色', hex: '#C0C0C0' },
                              { name: '金色', hex: '#FFD700' },
                              { name: '红色', hex: '#E74C3C' },
                              { name: '蓝色', hex: '#3498DB' },
                            ].map((preset) => (
                              <button
                                key={preset.hex}
                                type="button"
                                onClick={() => {
                                  handleUpdateColorPart(index, 'hexColor', preset.hex);
                                  if (!colorPart.color) {
                                    handleUpdateColorPart(index, 'color', preset.name);
                                  }
                                }}
                                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-green-500 transition-all"
                                style={{ backgroundColor: preset.hex }}
                                title={preset.name}
                              />
                            ))}
                          </div>
                        </div>

                        {/* 删除按钮 */}
                        <button
                          type="button"
                          onClick={() => handleDeleteColorPart(index)}
                          className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <Trash2 size={14} />
                          删除此部件
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => {
                  setIsColorModalOpen(false);
                  setEditingColor(null);
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveColor}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
      />
    </div>
  );
}
