'use client';

import { useEffect, useState } from 'react';
import { componentApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import PageHeader from '@/components/admin/PageHeader';
import { Plus, Edit2, Trash2, Package, Globe } from 'lucide-react';

interface Component {
  id: string;
  code: string;
  nameZh: string;
  nameEn: string;
  description?: string;
  parts?: Array<{ nameZh: string; nameEn: string }>;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function ComponentsPage() {
  const toast = useToast();
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<Component | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    nameZh: '',
    nameEn: '',
    description: '',
    parts: [] as Array<{ nameZh: string; nameEn: string }>,
  });

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      setLoading(true);
      const response = await componentApi.getAll();
      setComponents(Array.isArray(response) ? response : response.data || []);
    } catch (error: any) {
      toast.error(error.message || '加载组件失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingComponent(null);
    setFormData({
      code: '',
      nameZh: '',
      nameEn: '',
      description: '',
      parts: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (component: Component) => {
    setEditingComponent(component);
    setFormData({
      code: component.code,
      nameZh: component.nameZh,
      nameEn: component.nameEn,
      description: component.description || '',
      parts: component.parts || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (component: Component) => {
    setComponentToDelete(component);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!componentToDelete) return;

    try {
      await componentApi.delete(componentToDelete.id);
      toast.success('组件删除成功');
      setDeleteConfirmOpen(false);
      setComponentToDelete(null);
      loadComponents();
    } catch (error: any) {
      toast.error(error.message || '删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim() || !formData.nameZh.trim() || !formData.nameEn.trim()) {
      toast.warning('请填写组件代码、中文名称和英文名称');
      return;
    }

    // 验证部件列表中的每个部件都有中英文名称
    if (formData.parts.length > 0) {
      const invalidPart = formData.parts.find(p => !p.nameZh.trim() || !p.nameEn.trim());
      if (invalidPart) {
        toast.warning('请确保所有部件都有中英文名称');
        return;
      }
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        parts: formData.parts.length > 0 ? formData.parts : null,
      };

      if (editingComponent) {
        await componentApi.update(editingComponent.id, submitData);
        toast.success('组件更新成功');
      } else {
        await componentApi.create(submitData);
        toast.success('组件创建成功');
      }
      setIsModalOpen(false);
      setEditingComponent(null);
      setFormData({
        code: '',
        nameZh: '',
        nameEn: '',
        description: '',
        parts: [],
      });
      loadComponents();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        title="组件管理"
        subtitle={`共 ${components.length} 个组件`}
        actions={
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-gold-600 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            新增组件
          </button>
        }
      />

      {/* 组件列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <ButtonLoader />
          </div>
        ) : components.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Package size={48} className="mb-4 text-gray-300" />
            <p>暂无组件数据</p>
            <button
              onClick={handleAdd}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-gold-600 transition-all"
            >
              创建第一个组件
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  组件代码
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  中文名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  英文名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {components
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((component) => (
                  <tr key={component.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-sm font-mono font-semibold rounded">
                          {component.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {component.nameZh}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {component.nameEn}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {component.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(component)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="编辑"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(component)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 创建/编辑模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingComponent ? '编辑组件' : '新增组件'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  组件代码 *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="如: A, B, C"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={!!editingComponent}
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  中文名称 *
                </label>
                <input
                  type="text"
                  value={formData.nameZh}
                  onChange={(e) => setFormData({ ...formData, nameZh: e.target.value })}
                  placeholder="如: 拖把杆"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  英文名称 *
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="如: Mop Handle"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  规格参数（可选）<span className="text-gray-400 text-xs ml-2">(如需中英文，格式: 标准规格/Standard，φ22*4200mm/φ22*4200mm)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="如: 标准规格/Standard、φ22*4200mm/φ22*4200mm"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* 部件列表 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  部件列表 <span className="text-gray-400 text-xs">(至少1个)</span>
                </label>

                <div className="space-y-2 mb-2">
                  {formData.parts.map((part, index) => (
                    <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={part.nameZh}
                          onChange={(e) => {
                            const newParts = [...formData.parts];
                            newParts[index].nameZh = e.target.value;
                            setFormData({ ...formData, parts: newParts });
                          }}
                          placeholder="部件中文名（如: 杆身、手柄、棉头）"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={part.nameEn}
                          onChange={(e) => {
                            const newParts = [...formData.parts];
                            newParts[index].nameEn = e.target.value;
                            setFormData({ ...formData, parts: newParts });
                          }}
                          placeholder="部件英文名（如: Pole Body, Handle）"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newParts = formData.parts.filter((_, i) => i !== index);
                          setFormData({ ...formData, parts: newParts });
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors p-2"
                        title="删除部件"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      parts: [...formData.parts, { nameZh: '', nameEn: '' }],
                    });
                  }}
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  添加部件
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  disabled={submitting}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-gold-600 transition-all disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? '提交中...' : '确定'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {deleteConfirmOpen && componentToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除组件 <span className="font-semibold">[{componentToDelete.code}] {componentToDelete.nameZh}</span> 吗？
                此操作不可撤销。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
