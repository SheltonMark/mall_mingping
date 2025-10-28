'use client';

import { useEffect, useState } from 'react';
import { productApi } from '@/lib/adminApi';

type TabType = 'categories' | 'materials' | 'groups' | 'skus';

interface Category {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface Material {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface ProductGroup {
  id: string;
  name: string;
  nameEn?: string;
  categoryId: string;
  category?: { name: string };
  description?: string;
  images?: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface ProductSku {
  id: string;
  skuCode: string;
  groupId: string;
  group?: { name: string };
  materialId: string;
  material?: { name: string };
  specs?: any;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [skus, setSkus] = useState<ProductSku[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'categories') {
        const data = await productApi.getCategories();
        setCategories(data);
      } else if (activeTab === 'materials') {
        const data = await productApi.getMaterials();
        setMaterials(data);
      } else if (activeTab === 'groups') {
        const data = await productApi.getGroups({});
        setGroups(Array.isArray(data) ? data : data.data || []);
      } else if (activeTab === 'skus') {
        const data = await productApi.getSkus({});
        setSkus(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'categories', label: '产品分类', icon: '📁' },
    { key: 'materials', label: '产品材料', icon: '🧱' },
    { key: 'groups', label: '产品组', icon: '📦' },
    { key: 'skus', label: 'SKU管理', icon: '🏷️' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">产品管理</h1>
        <p className="text-gray-600 mt-1">管理产品分类、材料、产品组和SKU</p>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'categories' && <CategoriesTab categories={categories} onReload={loadData} />}
          {activeTab === 'materials' && <MaterialsTab materials={materials} onReload={loadData} />}
          {activeTab === 'groups' && <GroupsTab groups={groups} onReload={loadData} />}
          {activeTab === 'skus' && <SkusTab skus={skus} onReload={loadData} />}
        </div>
      </div>
    </div>
  );
}

// 分类管理组件
function CategoriesTab({ categories, onReload }: { categories: Category[]; onReload: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  });

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ name: '', nameEn: '', description: '', sortOrder: 0, isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      nameEn: category.nameEn || '',
      description: category.description || '',
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;
    try {
      await productApi.deleteCategory(id);
      alert('删除成功');
      onReload();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productApi.updateCategory(editingId, formData);
        alert('更新成功');
      } else {
        await productApi.createCategory(formData);
        alert('创建成功');
      }
      setIsModalOpen(false);
      onReload();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.message || '保存失败');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">共 {categories.length} 个分类</div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ 添加分类
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                {category.nameEn && <p className="text-sm text-gray-500">{category.nameEn}</p>}
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {category.isActive ? '启用' : '停用'}
              </span>
            </div>
            {category.description && (
              <p className="text-sm text-gray-600 mb-3">{category.description}</p>
            )}
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => handleEdit(category)}
                className="text-blue-600 hover:text-blue-800"
              >
                编辑
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="text-red-600 hover:text-red-800"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? '编辑分类' : '添加分类'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  中文名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">英文名称</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">排序</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">启用</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 材料管理组件
function MaterialsTab({ materials, onReload }: { materials: Material[]; onReload: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  });

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ name: '', nameEn: '', description: '', sortOrder: 0, isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (material: Material) => {
    setEditingId(material.id);
    setFormData({
      name: material.name,
      nameEn: material.nameEn || '',
      description: material.description || '',
      sortOrder: material.sortOrder,
      isActive: material.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个材料吗？')) return;
    try {
      await productApi.deleteMaterial(id);
      alert('删除成功');
      onReload();
    } catch (error) {
      console.error('Failed to delete material:', error);
      alert('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productApi.updateMaterial(editingId, formData);
        alert('更新成功');
      } else {
        await productApi.createMaterial(formData);
        alert('创建成功');
      }
      setIsModalOpen(false);
      onReload();
    } catch (error: any) {
      console.error('Failed to save material:', error);
      alert(error.message || '保存失败');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">共 {materials.length} 种材料</div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ 添加材料
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((material) => (
          <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{material.name}</h3>
                {material.nameEn && <p className="text-sm text-gray-500">{material.nameEn}</p>}
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                material.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {material.isActive ? '启用' : '停用'}
              </span>
            </div>
            {material.description && (
              <p className="text-sm text-gray-600 mb-3">{material.description}</p>
            )}
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => handleEdit(material)}
                className="text-blue-600 hover:text-blue-800"
              >
                编辑
              </button>
              <button
                onClick={() => handleDelete(material.id)}
                className="text-red-600 hover:text-red-800"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? '编辑材料' : '添加材料'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  中文名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">英文名称</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">排序</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">启用</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 产品组管理组件（简化版）
function GroupsTab({ groups, onReload }: { groups: ProductGroup[]; onReload: () => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">共 {groups.length} 个产品组</div>
        <div className="text-sm text-gray-500">产品组管理功能开发中...</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">名称</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">英文名</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">分类</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {groups.map((group) => (
              <tr key={group.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{group.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{group.nameEn || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{group.category?.name || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 text-xs rounded ${
                    group.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {group.isActive ? '启用' : '停用'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// SKU管理组件（简化版）
function SkusTab({ skus, onReload }: { skus: ProductSku[]; onReload: () => void }) {
  const handleDownloadTemplate = () => {
    productApi.downloadTemplate();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">共 {skus.length} 个SKU</div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📥 下载模板
          </button>
          <div className="text-sm text-gray-500">Excel导入导出功能开发中...</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">SKU编码</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">产品组</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">材料</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">价格</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">库存</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {skus.map((sku) => (
              <tr key={sku.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{sku.skuCode}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{sku.group?.name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{sku.material?.name || '-'}</td>
                <td className="px-4 py-3 text-sm font-medium">¥{sku.price}</td>
                <td className="px-4 py-3 text-sm">{sku.stock}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 text-xs rounded ${
                    sku.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {sku.isActive ? '启用' : '停用'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
