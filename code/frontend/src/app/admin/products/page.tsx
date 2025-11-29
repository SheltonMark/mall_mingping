'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productApi } from '@/lib/adminApi';
import { erpApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import { Upload, Edit2, Trash2, Search, Image as ImageIcon, Plus, X, RefreshCw, CheckCheck } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import CustomSelect from '@/components/common/CustomSelect';

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
  visibilityTier?: 'ALL' | 'STANDARD' | 'VIP' | 'SVIP';
  skuCount?: number;
  createdAt: string;
  updatedAt: string;
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
  const searchParams = useSearchParams();
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

  // ERP 同步状态
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [showSyncResult, setShowSyncResult] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    groupsCreated: number;
    groupsUpdated: number;
    skusCreated: number;
    skusUpdated: number;
    duration: number;
    error?: string;
  } | null>(null);

  // ERP 预览同步状态
  const [showSyncPreview, setShowSyncPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    success: boolean;
    groups: Array<{
      prefix: string;
      groupName: string;
      categoryCode: string;
      categoryExists: boolean;
      isNew: boolean;
      skus: Array<{
        productCode: string;
        productName: string;
        specification: string | null;
        isNew: boolean;
      }>;
    }>;
    totalGroups: number;
    totalSkus: number;
    newGroups: number;
    newSkus: number;
    error?: string;
  } | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [selectedSkus, setSelectedSkus] = useState<Record<string, Set<string>>>({});

  // 确认对话框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  } | null>(null);

  // 新增标识相关状态
  const [lastViewedAt, setLastViewedAt] = useState<string | null>(null);

  // 从localStorage加载上次查看时间
  useEffect(() => {
    const stored = localStorage.getItem('products_last_viewed_at');
    if (stored) {
      setLastViewedAt(stored);
    }
  }, []);

  // 判断是否为新增的产品组
  const isNewGroup = (group: ProductGroup): boolean => {
    if (!lastViewedAt) return false;
    return new Date(group.createdAt).getTime() > new Date(lastViewedAt).getTime();
  };

  // 判断是否为新增的SKU
  const isNewSku = (sku: ProductSku): boolean => {
    if (!lastViewedAt) return false;
    return new Date(sku.createdAt).getTime() > new Date(lastViewedAt).getTime();
  };

  // 计算新增数量
  const newGroupsCount = groups.filter(isNewGroup).length;
  const newSkusCount = skus.filter(isNewSku).length;

  // 标记全部已读
  const handleMarkAllRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem('products_last_viewed_at', now);
    setLastViewedAt(now);
    toast.success('已标记全部为已读');
  };

  useEffect(() => {
    loadData();
    loadLastSyncTime();
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

  const loadLastSyncTime = async () => {
    try {
      const result = await erpApi.getProductLastSyncTime();
      setLastSyncTime(result.lastSyncTimeFormatted);
    } catch (error) {
      console.error('Failed to load last sync time:', error);
    }
  };

  const handleSyncProducts = async () => {
    // 打开预览弹窗并加载预览数据
    setShowSyncPreview(true);
    setPreviewLoading(true);
    setSelectedGroups(new Set());
    setSelectedSkus({});

    try {
      const result = await erpApi.previewProducts();
      setPreviewData(result);

      if (!result.success) {
        toast.error(`加载预览失败: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`加载预览失败: ${error.message || '未知错误'}`);
      setPreviewData(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // 切换产品组选择
  const toggleGroupSelection = (prefix: string) => {
    setSelectedGroups(prev => {
      const next = new Set(prev);
      if (next.has(prefix)) {
        next.delete(prefix);
        // 同时取消该组下所有SKU的选择
        setSelectedSkus(prevSkus => {
          const newSkus = { ...prevSkus };
          delete newSkus[prefix];
          return newSkus;
        });
      } else {
        next.add(prefix);
        // 默认选中该组下所有SKU
        const group = previewData?.groups.find(g => g.prefix === prefix);
        if (group) {
          setSelectedSkus(prevSkus => ({
            ...prevSkus,
            [prefix]: new Set(group.skus.map(s => s.productCode))
          }));
        }
      }
      return next;
    });
  };

  // 切换SKU选择
  const toggleSkuSelection = (prefix: string, productCode: string) => {
    if (!selectedGroups.has(prefix)) return; // 如果产品组未选中，不允许选择SKU

    setSelectedSkus(prev => {
      const groupSkus = prev[prefix] || new Set();
      const next = new Set(groupSkus);
      if (next.has(productCode)) {
        next.delete(productCode);
      } else {
        next.add(productCode);
      }
      return { ...prev, [prefix]: next };
    });
  };

  // 全选/取消全选产品组
  const toggleAllGroups = () => {
    if (!previewData) return;

    const validGroups = previewData.groups.filter(g => g.categoryExists);
    if (selectedGroups.size === validGroups.length) {
      // 全部取消选择
      setSelectedGroups(new Set());
      setSelectedSkus({});
    } else {
      // 全选
      const allPrefixes = new Set(validGroups.map(g => g.prefix));
      setSelectedGroups(allPrefixes);

      const allSkus: Record<string, Set<string>> = {};
      validGroups.forEach(g => {
        allSkus[g.prefix] = new Set(g.skus.map(s => s.productCode));
      });
      setSelectedSkus(allSkus);
    }
  };

  // 全选/取消全选某个产品组下的SKU
  const toggleAllSkusInGroup = (prefix: string) => {
    if (!selectedGroups.has(prefix)) return;

    const group = previewData?.groups.find(g => g.prefix === prefix);
    if (!group) return;

    const currentSkus = selectedSkus[prefix] || new Set();
    if (currentSkus.size === group.skus.length) {
      // 取消全选
      setSelectedSkus(prev => ({ ...prev, [prefix]: new Set() }));
    } else {
      // 全选
      setSelectedSkus(prev => ({
        ...prev,
        [prefix]: new Set(group.skus.map(s => s.productCode))
      }));
    }
  };

  // 执行选择性同步
  const handleSyncSelected = async () => {
    const groupsArray = Array.from(selectedGroups);
    const skusRecord: Record<string, string[]> = {};

    groupsArray.forEach(prefix => {
      skusRecord[prefix] = Array.from(selectedSkus[prefix] || []);
    });

    // 计算选中的数量
    const totalSelectedSkus = Object.values(skusRecord).reduce((sum, arr) => sum + arr.length, 0);

    if (totalSelectedSkus === 0) {
      toast.warning('请至少选择一个SKU');
      return;
    }

    setSyncing(true);
    try {
      const result = await erpApi.syncSelectedProducts({
        selectedGroups: groupsArray,
        selectedSkus: skusRecord
      });

      setShowSyncPreview(false);
      setSyncResult(result);
      setShowSyncResult(true);

      if (result.success) {
        toast.success(`同步成功！新增 ${result.groupsCreated} 个产品组，${result.skusCreated} 个SKU`);
        await loadData();
        await loadLastSyncTime();
      } else {
        toast.error(`同步失败: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`同步失败: ${error.message || '未知错误'}`);
    } finally {
      setSyncing(false);
    }
  };

  // 创建系列后滚动到页面底部
  useEffect(() => {
    const scrollToBottom = searchParams?.get('scrollToBottom');
    if (scrollToBottom === 'true' && !loading) {
      setTimeout(() => {
        const scrollHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
      }, 300);
    }
  }, [searchParams, loading]);

  // 滚动到新增的SKU（页面最底部）
  useEffect(() => {
    const scrollToId = searchParams?.get('scrollTo');
    if (scrollToId && !loading && skus.length > 0) {
      // 延迟执行以确保DOM已渲染
      setTimeout(() => {
        // 滚动到页面最底部 - 使用documentElement获取更准确的滚动高度
        const scrollHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        window.scrollTo({ top: scrollHeight, behavior: 'smooth' });

        // 可选：高亮显示新增的SKU
        const element = document.getElementById(`sku-${scrollToId}`);
        if (element) {
          element.classList.add('ring-2', 'ring-blue-500');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500');
          }, 2000);
        }
      }, 300);
    }
  }, [searchParams, loading, skus]);

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
      title: '删除SKU',
      message: `确定要删除SKU "${productCode}" 吗？此操作不可恢复！`,
      type: 'danger',
      onConfirm: async () => {
        setDeleting(true);
        try {
          await productApi.deleteSku(skuId);
          toast.success(`SKU ${productCode} 已删除`);
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
      title: '删除产品组',
      message: `确定要删除产品组 "${groupName}" 吗？此操作将删除该产品组下的所有SKU，不可恢复！`,
      type: 'danger',
      onConfirm: async () => {
        setDeleting(true);
        try {
          await productApi.deleteGroup(groupId);
          toast.success(`产品组 "${groupName}" 已删除`);
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
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        title="产品管理"
        subtitle={`共 ${groups.length} 个产品系列，${skus.length} 个规格`}
      />

      {/* 搜索栏和操作按钮 */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索品号、品名..."
            className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* ERP 同步按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncProducts}
              disabled={syncing}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={lastSyncTime ? `上次同步: ${lastSyncTime}` : '从未同步'}
            >
              <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
              {syncing ? '同步中...' : '同步ERP产品'}
            </button>
            {lastSyncTime && (
              <span className="text-xs text-gray-500 hidden lg:block">
                上次: {lastSyncTime}
              </span>
            )}
          </div>
          <button
            onClick={() => router.push('/admin/products/create-group')}
            className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-gold-600 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            新增产品组
          </button>
        </div>
      </div>

      {/* 新增产品提示条 */}
      {(newGroupsCount > 0 || newSkusCount > 0) && (
        <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-500 text-lg">🔔</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">有新增产品</div>
              <div className="text-sm text-gray-600">
                {newGroupsCount > 0 && <span className="text-red-600 font-medium">{newGroupsCount} 个新产品组</span>}
                {newGroupsCount > 0 && newSkusCount > 0 && <span className="mx-1">·</span>}
                {newSkusCount > 0 && <span className="text-red-600 font-medium">{newSkusCount} 个新SKU</span>}
              </div>
            </div>
          </div>
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 font-medium shadow-sm"
          >
            <CheckCheck size={18} />
            全部标记已读
          </button>
        </div>
      )}

      {/* 主内容 */}
      <div>
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
            {/* 按updatedAt降序排序，最新更新的在最上面 */}
            {[...groups].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((group) => {
              const groupSkus = groupedSkus[group.id] || [];
              if (searchQuery && groupSkus.length === 0) return null;
              const groupIsNew = isNewGroup(group);

              return (
                <div key={group.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${groupIsNew ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'}`}>
                  {/* 产品组头部 */}
                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {group.prefix.substring(0, 2)}
                          </div>
                          {/* 新增红点标识 */}
                          {groupIsNew && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            {/* 新增标签 */}
                            {groupIsNew && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
                                新
                              </span>
                            )}
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
                          新增SKU
                        </button>
                        <button
                          onClick={() => router.push(`/admin/products/create-group?id=${group.id}`)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                        >
                          <Edit2 size={18} />
                          编辑产品组
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id, group.groupNameZh)}
                          disabled={deleting}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                          title="删除整个产品组"
                        >
                          <Trash2 size={18} />
                          删除产品组
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
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">状态</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {/* 按创建时间降序排序，最新的SKU显示在最上面 */}
                          {[...groupSkus].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((sku) => {
                            const skuIsNew = isNewSku(sku);
                            return (
                            <tr key={sku.id} id={`sku-${sku.id}`} className={`hover:bg-blue-50/30 transition-colors ${skuIsNew ? 'bg-red-50/30' : ''}`}>
                              <td className="px-6 py-4">
                                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
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
                                  {/* SKU新增红点标识 */}
                                  {skuIsNew && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {skuIsNew && (
                                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">新</span>
                                  )}
                                  <span className="text-sm font-semibold text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                                    {sku.productCode}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900 max-w-xs">
                                  {sku.productName}
                                </div>
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
                          );
                          })}
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

      {/* ERP 同步预览弹窗 */}
      {showSyncPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* 弹窗头部 */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">ERP产品同步预览</h2>
                  <p className="text-purple-100 mt-1">选择要导入的产品组和SKU</p>
                </div>
                <button
                  onClick={() => setShowSyncPreview(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <ButtonLoader />
                    <p className="mt-4 text-gray-600">正在从ERP加载产品数据...</p>
                  </div>
                </div>
              ) : !previewData || !previewData.success ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">❌</div>
                  <p className="text-gray-600">{previewData?.error || '加载预览数据失败'}</p>
                </div>
              ) : previewData.groups.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-600">暂无待同步的产品</p>
                  <p className="text-sm text-gray-500 mt-2">ERP中没有在基准时间之后新增的产品</p>
                </div>
              ) : (
                <>
                  {/* 统计信息和全选按钮 */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-sm text-gray-600">
                        共 <span className="font-semibold text-gray-900">{previewData.totalGroups}</span> 个产品组，
                        <span className="font-semibold text-gray-900">{previewData.totalSkus}</span> 个SKU
                      </div>
                      <div className="text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">新增 {previewData.newGroups} 组 / {previewData.newSkus} SKU</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        已选 {selectedGroups.size} 组 /
                        {Object.values(selectedSkus).reduce((sum, set) => sum + set.size, 0)} SKU
                      </span>
                      <button
                        onClick={toggleAllGroups}
                        className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                      >
                        {selectedGroups.size === previewData.groups.filter(g => g.categoryExists).length ? '取消全选' : '全选'}
                      </button>
                    </div>
                  </div>

                  {/* 产品组列表 */}
                  <div className="space-y-4">
                    {previewData.groups.map((group) => {
                      const isGroupSelected = selectedGroups.has(group.prefix);
                      const groupSkuSet = selectedSkus[group.prefix] || new Set();
                      const allSkusSelected = groupSkuSet.size === group.skus.length;

                      return (
                        <div
                          key={group.prefix}
                          className={`border-2 rounded-xl overflow-hidden transition-all ${
                            !group.categoryExists
                              ? 'border-gray-200 bg-gray-50 opacity-60'
                              : isGroupSelected
                                ? 'border-purple-300 bg-purple-50/30'
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* 产品组头部 */}
                          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isGroupSelected}
                                onChange={() => toggleGroupSelection(group.prefix)}
                                disabled={!group.categoryExists}
                                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">{group.groupName}</span>
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                    {group.prefix}
                                  </span>
                                  {group.isNew && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                      新产品组
                                    </span>
                                  )}
                                  {!group.categoryExists && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                      分类 {group.categoryCode} 不存在
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  分类: {group.categoryCode} · {group.skus.length} 个SKU
                                </div>
                              </div>
                            </div>
                            {isGroupSelected && (
                              <button
                                onClick={() => toggleAllSkusInGroup(group.prefix)}
                                className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                              >
                                {allSkusSelected ? '取消全选SKU' : '全选SKU'}
                              </button>
                            )}
                          </div>

                          {/* SKU列表 - 仅在产品组选中时可见 */}
                          {isGroupSelected && (
                            <div className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {group.skus.map((sku) => {
                                  const isSkuSelected = groupSkuSet.has(sku.productCode);
                                  return (
                                    <label
                                      key={sku.productCode}
                                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                                        isSkuSelected
                                          ? 'bg-purple-100 border border-purple-300'
                                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSkuSelected}
                                        onChange={() => toggleSkuSelection(group.prefix, sku.productCode)}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-sm text-gray-700">{sku.productCode}</span>
                                          {sku.isNew && (
                                            <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-xs rounded">新</span>
                                          )}
                                        </div>
                                        <div className="text-sm text-gray-600 truncate">{sku.productName}</div>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* 弹窗底部 */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedGroups.size > 0 && (
                  <span>
                    将同步 <span className="font-semibold text-purple-700">{selectedGroups.size}</span> 个产品组，
                    <span className="font-semibold text-purple-700">
                      {Object.values(selectedSkus).reduce((sum, set) => sum + set.size, 0)}
                    </span> 个SKU
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSyncPreview(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleSyncSelected}
                  disabled={syncing || selectedGroups.size === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? '同步中...' : '开始同步'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ERP 同步结果弹窗 */}
      {showSyncResult && syncResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`px-6 py-5 border-b ${
              syncResult.success
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                : 'bg-gradient-to-r from-red-600 to-rose-600'
            }`}>
              <h2 className="text-2xl font-bold text-white">
                {syncResult.success ? '✓ 同步成功' : '✕ 同步失败'}
              </h2>
            </div>

            <div className="px-6 py-6">
              {syncResult.success ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 text-center">
                      <div className="text-sm text-blue-700 font-semibold mb-1">产品组</div>
                      <div className="text-2xl font-bold text-blue-700">
                        +{syncResult.groupsCreated} / ↻{syncResult.groupsUpdated}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">新增 / 更新</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200 text-center">
                      <div className="text-sm text-purple-700 font-semibold mb-1">SKU</div>
                      <div className="text-2xl font-bold text-purple-700">
                        +{syncResult.skusCreated} / ↻{syncResult.skusUpdated}
                      </div>
                      <div className="text-xs text-purple-600 mt-1">新增 / 更新</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <span className="text-gray-600">耗时: </span>
                    <span className="font-semibold text-gray-900">
                      {(syncResult.duration / 1000).toFixed(2)} 秒
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="text-red-700">{syncResult.error}</div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowSyncResult(false)}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold"
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
                  <CustomSelect
                    options={[
                      { value: '', label: '请选择产品组' },
                      ...groups.map(group => ({
                        value: group.id,
                        label: `${group.groupNameZh} (${group.prefix})`
                      }))
                    ]}
                    value={(selectedGroupForCreate as ProductGroup | null)?.id || ''}
                    onChange={(value) => {
                      const group = groups.find(g => g.id === value);
                      setSelectedGroupForCreate(group || null);
                    }}
                  />
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
