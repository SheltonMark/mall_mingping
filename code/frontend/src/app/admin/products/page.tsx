'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import { Upload, Edit2, Trash2, Search, Image as ImageIcon, Plus, X } from 'lucide-react';

interface ProductGroup {
  id: string;
  prefix: string;
  groupNameZh: string;
  groupNameEn?: string;
  categoryId: string;
  category?: {
    code: string;
    nameZh: string;
    nameEn?: string;
  };
  isPublished: boolean;
  skuCount?: number;
}

interface ProductSku {
  id: string;
  productCode: string;
  productName: string;
  brand?: string;
  specification?: string;
  productSpec?: any;
  additionalAttributes?: any;
  price?: string;
  images?: string;
  mainImage?: string;
  status: string;
  group?: ProductGroup;
  createdAt: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    productCode: string;
    productName: string;
    error: string;
  }>;
  autoCreated: {
    categories: string[];
    productGroups: string[];
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const toast = useToast();
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [skus, setSkus] = useState<ProductSku[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showImportResult, setShowImportResult] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroupForCreate, setSelectedGroupForCreate] = useState<ProductGroup | null>(null);
  const [creating, setCreating] = useState(false);
  const [newSkuData, setNewSkuData] = useState({
    productCode: '',
    productName: '',
    brand: '',
    price: '',
  });

  // 确认对话框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupsData, skusData] = await Promise.all([
        productApi.getGroups({ limit: 1000 }),  // 增加分页限制
        productApi.getSkus({ limit: 1000 })     // 增加分页限制
      ]);

      setGroups(Array.isArray(groupsData) ? groupsData : groupsData.data || []);
      setSkus(Array.isArray(skusData) ? skusData : skusData.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    productApi.downloadTemplate();
    toast.success('模板下载中...');
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handleImportExcel(file);
      }
    };
    input.click();
  };

  const handleImportExcel = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.warning('请选择Excel文件 (.xlsx 或 .xls)');
      return;
    }

    setImporting(true);
    try {
      const result = await productApi.importSkus(file);

      setImportResult(result);
      setShowImportResult(true);

      if (result.success > 0) {
        toast.success(`成功导入 ${result.success} 个产品！`);
      }

      if (result.failed > 0) {
        toast.error(`${result.failed} 个产品导入失败，请查看详细信息`);
      }

      await loadData();
    } catch (error: any) {
      console.error('Import failed:', error);
      toast.error(`导入失败: ${error.message || '未知错误'}`);
    } finally {
      setImporting(false);
    }
  };

  const handleEditSku = (sku: ProductSku) => {
    router.push(`/admin/products/${sku.id}`);
  };

  const handleDeleteSku = async (skuId: string, productCode: string) => {
    setConfirmAction({
      title: '删除产品规格',
      message: `确定要删除产品规格 "${productCode}" 吗？此操作不可恢复！`,
      type: 'danger',
      onConfirm: async () => {
        setDeleting(true);
        try {
          await productApi.deleteSku(skuId);
          toast.success(`产品规格 ${productCode} 已删除`);
          await loadData();
        } catch (error: any) {
          toast.error(`删除失败: ${error.message}`);
        } finally {
          setDeleting(false);
          setShowConfirmDialog(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    setConfirmAction({
      title: '删除产品系列',
      message: `确定要删除产品系列 "${groupName}" 吗？此操作将删除该系列下的所有规格，不可恢复！`,
      type: 'danger',
      onConfirm: async () => {
        setDeleting(true);
        try {
          await productApi.deleteGroup(groupId);
          toast.success(`产品系列 "${groupName}" 已删除`);
          await loadData();
        } catch (error: any) {
          toast.error(`删除失败: ${error.message}`);
        } finally {
          setDeleting(false);
          setShowConfirmDialog(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleOpenCreateModal = (group: ProductGroup) => {
    setSelectedGroupForCreate(group);
    setNewSkuData({
      productCode: '',
      productName: '',
      brand: '',
      price: '',
    });
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSelectedGroupForCreate(null);
    setNewSkuData({
      productCode: '',
      productName: '',
      brand: '',
      price: '',
    });
  };

  const handleCreateSku = async () => {
    if (!selectedGroupForCreate) return;

    if (!newSkuData.productCode.trim() || !newSkuData.productName.trim()) {
      toast.warning('请填写品号和品名');
      return;
    }

    setCreating(true);
    try {
      const createData = {
        groupId: selectedGroupForCreate.id,
        productCode: newSkuData.productCode.trim(),
        productName: newSkuData.productName.trim(),
        brand: newSkuData.brand.trim() || undefined,
        price: newSkuData.price ? parseFloat(newSkuData.price) : undefined,
        status: 'INACTIVE', // 默认未上架
      };

      await productApi.createSku(createData);
      toast.success(`SKU ${newSkuData.productCode} 创建成功！`);
      handleCloseCreateModal();
      await loadData();
    } catch (error: any) {
      toast.error(`创建失败: ${error.message || '未知错误'}`);
    } finally {
      setCreating(false);
    }
  };

  const filteredSkus = selectedGroup
    ? skus.filter(sku => sku.group?.id === selectedGroup)
    : skus;

  const searchFilteredSkus = searchQuery
    ? filteredSkus.filter(sku =>
        sku.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sku.productName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredSkus;

  const groupedSkus = searchFilteredSkus.reduce((acc, sku) => {
    const groupId = sku.group?.id || 'unknown';
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(sku);
    return acc;
  }, {} as Record<string, ProductSku[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页头 */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">产品管理</h1>
              <p className="text-gray-600 mt-1">
                共 <span className="font-semibold text-blue-600">{groups.length}</span> 个产品系列，
                <span className="font-semibold text-blue-600">{skus.length}</span> 个规格
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadTemplate}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 font-medium"
              >
                <Upload size={18} />
                下载模板
              </button>
              <button
                onClick={handleImportClick}
                disabled={importing}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
              >
                {importing ? (
                  <>
                    <ButtonLoader />
                    <span>导入中...</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    导入Excel
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  // 打开新增产品组（SKU）对话框
                  router.push('/admin/products/create-group');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
              >
                <Plus size={18} />
                新增SKU
              </button>
            </div>
          </div>

          {/* 搜索栏 */}
          <div className="mt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索品号、品名..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <ButtonLoader />
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="text-8xl mb-6">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">还没有产品</h3>
            <p className="text-gray-600 mb-8 text-lg">通过导入Excel文件来添加你的第一个产品</p>
            <button
              onClick={handleImportClick}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-lg shadow-md hover:shadow-lg"
            >
              <Upload className="inline mr-2" size={20} />
              导入Excel
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => {
              const groupSkus = groupedSkus[group.id] || [];
              if (searchQuery && groupSkus.length === 0) return null;

              return (
                <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* 产品组头部 */}
                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {group.prefix.substring(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900">{group.groupNameZh}</h2>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                              {group.prefix}
                            </span>
                            {group.category && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                                {group.category.nameZh}
                              </span>
                            )}
                          </div>
                          {group.groupNameEn && (
                            <p className="text-sm text-gray-600 mt-1">{group.groupNameEn}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                          {groupSkus.length} 个规格
                        </div>
                        <button
                          onClick={() => router.push(`/admin/products/new?groupId=${group.id}`)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                        >
                          <Plus size={18} />
                          新增规格
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id, group.groupNameZh)}
                          disabled={deleting}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                          title="删除整个产品系列"
                        >
                          <Trash2 size={18} />
                          删除SKU
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SKU列表 */}
                  {groupSkus.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">图片</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">品号</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">品名</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">价格</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">状态</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {groupSkus.map((sku) => (
                            <tr key={sku.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                                  {(() => {
                                    // 解析图片数组，取第一张
                                    let firstImage = null;
                                    if (sku.images) {
                                      try {
                                        const imgs = typeof sku.images === 'string' ? JSON.parse(sku.images) : sku.images;
                                        if (Array.isArray(imgs) && imgs.length > 0) {
                                          firstImage = imgs[0];
                                        }
                                      } catch (e) {
                                        console.error('Failed to parse images:', e);
                                      }
                                    }

                                    return firstImage ? (
                                      <img
                                        src={firstImage.startsWith('http') ? firstImage : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${firstImage}`}
                                        alt={sku.productName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <ImageIcon size={24} className="text-gray-400" />
                                    );
                                  })()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                                  {sku.productCode}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900 max-w-xs">
                                  {sku.productName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {sku.price ? (
                                  <span className="text-sm font-bold text-green-600">
                                    ¥{Number(sku.price).toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">未设置</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  sku.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}>
                                  {sku.status === 'ACTIVE' ? '✓ 启用' : '✕ 停用'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEditSku(sku)}
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors group relative"
                                    title="编辑"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSku(sku.id, sku.productCode)}
                                    disabled={deleting}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 group relative"
                                    title="删除"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      <div className="text-5xl mb-3">📭</div>
                      <p>该产品组暂无SKU</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 导入结果弹窗 */}
      {showImportResult && importResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="text-2xl font-bold text-white">导入结果</h2>
            </div>

            <div className="px-6 py-6 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                  <div className="text-sm text-green-700 font-semibold mb-2">✓ 成功导入</div>
                  <div className="text-4xl font-bold text-green-700">{importResult.success}</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-200">
                  <div className="text-sm text-red-700 font-semibold mb-2">✕ 导入失败</div>
                  <div className="text-4xl font-bold text-red-700">{importResult.failed}</div>
                </div>
              </div>

              {importResult.autoCreated && (importResult.autoCreated.categories.length > 0 || importResult.autoCreated.productGroups.length > 0) && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-sm text-blue-800 font-semibold mb-2">🎉 自动创建</div>
                  <div className="text-sm text-blue-700 space-y-1">
                    {importResult.autoCreated.categories.length > 0 && (
                      <div>分类: {importResult.autoCreated.categories.join(', ')}</div>
                    )}
                    {importResult.autoCreated.productGroups.length > 0 && (
                      <div>产品组: {importResult.autoCreated.productGroups.join(', ')}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="px-6 py-4 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-900 mb-4">错误详情</h3>
                <div className="space-y-3">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-red-600 font-bold text-xl">✕</span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {error.productCode} - {error.productName}
                          </div>
                          <div className="text-sm text-red-700">{error.error}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowImportResult(false)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增SKU弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">新增SKU</h2>
                <button
                  onClick={handleCloseCreateModal}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              {selectedGroupForCreate && (
                <p className="text-green-100 mt-2">
                  产品组: {selectedGroupForCreate.groupNameZh} ({selectedGroupForCreate.prefix})
                </p>
              )}
            </div>

            <div className="px-6 py-6 space-y-5">
              {/* 选择产品组（如果没有预选） */}
              {!selectedGroupForCreate && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    选择产品组 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedGroupForCreate?.id || ''}
                    onChange={(e) => {
                      const group = groups.find(g => g.id === e.target.value);
                      setSelectedGroupForCreate(group || null);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="">请选择产品组</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.groupNameZh} ({group.prefix})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* 品号 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  品号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSkuData.productCode}
                  onChange={(e) => setNewSkuData({ ...newSkuData, productCode: e.target.value })}
                  placeholder="例如: C10.01.0013"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono"
                />
              </div>

              {/* 品名 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  品名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSkuData.productName}
                  onChange={(e) => setNewSkuData({ ...newSkuData, productName: e.target.value })}
                  placeholder="例如: MP007-清洁四件套"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 商标 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  商标 (可选)
                </label>
                <input
                  type="text"
                  value={newSkuData.brand}
                  onChange={(e) => setNewSkuData({ ...newSkuData, brand: e.target.value })}
                  placeholder="例如: LEMOPX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 价格 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  价格 (可选)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">¥</span>
                  <input
                    type="number"
                    step="0.01"
                    value={newSkuData.price}
                    onChange={(e) => setNewSkuData({ ...newSkuData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>提示:</strong> 创建后，您可以在详情页面添加图片、视频和规格信息。
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={handleCloseCreateModal}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleCreateSku}
                disabled={creating}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <ButtonLoader />
                    <span>创建中...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>创建SKU</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 确认对话框 */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
            {/* 头部 */}
            <div className={`px-6 py-5 border-b ${
              confirmAction.type === 'danger'
                ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-100'
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  confirmAction.type === 'danger'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{confirmAction.title}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">此操作需要您确认</p>
                </div>
              </div>
            </div>

            {/* 内容 */}
            <div className="px-6 py-6">
              <p className="text-gray-700 text-base leading-relaxed">
                {confirmAction.message}
              </p>
            </div>

            {/* 底部按钮 */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                onClick={confirmAction.onConfirm}
                disabled={deleting}
                className={`flex-1 px-4 py-3 text-white rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  confirmAction.type === 'danger'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                    : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
                }`}
              >
                {deleting ? (
                  <>
                    <ButtonLoader />
                    <span>删除中...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    <span>确认删除</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
