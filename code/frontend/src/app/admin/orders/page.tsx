'use client';

import { useEffect, useState } from 'react';
import { orderApi, salespersonApi, erpApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import {
  Package, Calendar, Hash, Eye, X, Filter,
  Download, ChevronDown, ChevronUp, Edit2, Save,
  User, Building, UserCircle, CheckCircle, XCircle,
  Upload, AlertCircle, Clock, Check, RefreshCw
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import CustomSelect from '@/components/common/CustomSelect';
import SearchableSelect from '@/components/common/SearchableSelect';

// 订单状态类型
type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SYNCED' | 'SYNC_FAILED';

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  orderType: 'FORMAL' | 'INTENTION';
  status: OrderStatus;
  rejectReason?: string;
  erpOrderNo?: string;
  erpSyncAt?: string;
  erpSyncError?: string;
  totalAmount: number | string;
  salesperson: {
    id: string;
    chineseName?: string;
    accountId: string;
  };
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  erpCustomer?: {
    id: string;
    cusNo: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    address?: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  itemNumber: number;
  productSkuId: string;
  productImage?: string;
  productSpec?: string;
  additionalAttributes?: any;
  price: number | string;
  quantity: number;
  subtotal: number | string;
  productSku?: {
    id: string;
    productCode: string;
    productName?: string;
    productNameEn?: string;
    specification?: string;
  };
  // 可选字段
  customerProductCode?: string;
  packagingConversion?: string;
  packagingUnit?: string;
  weightUnit?: string;
  netWeight?: number;
  grossWeight?: number;
  packagingType?: string;
  packagingSize?: string;
  packingQuantity?: number;
  cartonQuantity?: number;
  packagingMethod?: string;
  paperCardCode?: string;
  washLabelCode?: string;
  outerCartonCode?: string;
  cartonSpecification?: string;
  volume?: number;
  expectedDeliveryDate?: string;
  supplierNote?: string;
  summary?: string;
  untaxedLocalCurrency?: number;
}

interface Salesperson {
  id: string;
  chineseName?: string;
  accountId: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  cusNo?: string;  // ERP客户编号
  isErpCustomer?: boolean;  // 标记是否为ERP客户
}

// 格式化金额
const formatAmount = (amount: any) => {
  const num = typeof amount === 'number' ? amount : Number(amount || 0);
  return num.toFixed(2);
};

// 订单状态配置
const orderStatusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING: { label: '待审核', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Clock },
  APPROVED: { label: '已审核', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Check },
  REJECTED: { label: '已驳回', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
  SYNCED: { label: '已同步ERP', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  SYNC_FAILED: { label: '同步失败', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: AlertCircle },
};

// 状态筛选选项
const statusFilterOptions = [
  { value: '', label: '全部状态' },
  { value: 'PENDING', label: '待审核' },
  { value: 'APPROVED', label: '已审核' },
  { value: 'REJECTED', label: '已驳回' },
  { value: 'SYNCED', label: '已同步ERP' },
  { value: 'SYNC_FAILED', label: '同步失败' },
];

// 提取双语文本的中文部分
const extractChineseText = (text: string | undefined | null): string => {
  if (!text) return '';

  // 支持 | 和 / 两种分隔符
  if (text.includes('|')) {
    const [zh] = text.split('|').map(s => s.trim());
    return zh || text;
  }

  if (text.includes('/')) {
    const [zh] = text.split('/').map(s => s.trim());
    return zh || text;
  }

  // 否则直接返回原文本
  return text;
};

// 解析箱规并计算体积 (格式: number*number*number 或 number*number*numbercm)
// 自动转换为立方米 (cm³ → m³)
const calculateVolumeFromCartonSpec = (cartonSpec: string): number | undefined => {
  if (!cartonSpec) return undefined;

  // 匹配格式: number*number*number[cm] (支持小数，可选cm单位)
  const match = cartonSpec.match(/^(\d+(?:\.\d+)?)\s*[*×xX]\s*(\d+(?:\.\d+)?)\s*[*×xX]\s*(\d+(?:\.\d+)?)\s*(?:cm)?$/i);
  if (!match) return undefined;

  const [, length, width, height] = match;
  // 计算立方厘米
  const volumeCm3 = parseFloat(length) * parseFloat(width) * parseFloat(height);
  // 转换为立方米 (1 m³ = 1,000,000 cm³)
  const volumeM3 = volumeCm3 / 1000000;
  // 保留6位小数
  return Math.round(volumeM3 * 1000000) / 1000000;
};

export default function AdminOrdersPage() {
  const toast = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingCustomers, setRefreshingCustomers] = useState(false);

  // 筛选条件
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSalesperson, setFilterSalesperson] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // 订单选择
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  // 审核模态框
  const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // 详情模态框
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // 编辑功能
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<OrderItem>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, salespersonsRes, erpCustomersRes] = await Promise.all([
        orderApi.getAll({ limit: 1000 }),
        salespersonApi.getAll({ limit: 1000 }),
        erpApi.getErpCustomers({ limit: 1000 }),
      ]);

      setOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes.data || []);
      setSalespersons(Array.isArray(salespersonsRes) ? salespersonsRes : salespersonsRes.data || []);
      // 转换 ERP 客户格式
      const erpCustomers = erpCustomersRes.data || [];
      setCustomers(erpCustomers.map((c: any) => ({
        id: c.id,
        name: c.name,
        cusNo: c.cusNo,
        isErpCustomer: true,
      })));
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error(error.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 刷新客户列表
  const refreshCustomers = async () => {
    try {
      setRefreshingCustomers(true);
      const erpCustomersRes = await erpApi.getErpCustomers({ limit: 1000 });
      const erpCustomers = erpCustomersRes.data || [];
      setCustomers(erpCustomers.map((c: any) => ({
        id: c.id,
        name: c.name,
        cusNo: c.cusNo,
        isErpCustomer: true,
      })));
      toast.success(`客户列表已刷新，共 ${erpCustomers.length} 个客户`);
    } catch (error: any) {
      console.error('Failed to refresh customers:', error);
      toast.error('刷新客户列表失败');
    } finally {
      setRefreshingCustomers(false);
    }
  };

  const viewOrderDetail = async (orderId: string) => {
    try {
      const order = await orderApi.getOne(orderId);
      setSelectedOrder(order);
      // 自动展开所有商品的包装信息
      setExpandedItems(new Set(order.items.map((item: OrderItem) => item.id)));
    } catch (error: any) {
      console.error('Failed to load order detail:', error);
      toast.error(error.message || '加载订单详情失败');
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setExpandedItems(new Set());
    setEditingItemId(null);
    setEditingData({});
  };

  const toggleItemExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleExport = (orderId: string) => {
    orderApi.exportOne(orderId);
    toast.success('订单导出成功');
  };

  // 清理数据：将空字符串转换为undefined，将字符串数字转换为数字
  const cleanItemData = (data: any) => {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      // 跳过undefined
      if (value === undefined) continue;

      // 空字符串转为undefined
      if (value === '') {
        cleaned[key] = undefined;
        continue;
      }

      // 数字字段：尝试转换
      const numberFields = ['packagingConversion', 'netWeight', 'grossWeight', 'packingQuantity', 'cartonQuantity', 'volume', 'quantity', 'price', 'untaxedLocalCurrency'];
      if (numberFields.includes(key) && typeof value === 'string') {
        const num = parseFloat(value);
        cleaned[key] = isNaN(num) ? undefined : num;
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  // 开始编辑商品项
  const handleEditItem = (item: OrderItem) => {
    setEditingItemId(item.id);
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    setEditingData({
      price,
      quantity: item.quantity,
      untaxedLocalCurrency: item.untaxedLocalCurrency ?? (price * item.quantity),
      packagingConversion: item.packagingConversion,
      packagingUnit: item.packagingUnit,
      weightUnit: item.weightUnit,
      netWeight: item.netWeight,
      grossWeight: item.grossWeight,
      packagingType: item.packagingType,
      packagingSize: item.packagingSize,
      packingQuantity: item.packingQuantity,
      cartonQuantity: item.cartonQuantity,
      packagingMethod: item.packagingMethod,
      paperCardCode: item.paperCardCode,
      washLabelCode: item.washLabelCode,
      outerCartonCode: item.outerCartonCode,
      cartonSpecification: item.cartonSpecification,
      volume: item.volume,
      supplierNote: item.supplierNote,
      summary: item.summary,
    });
  };

  // 保存编辑的商品项
  const handleSaveItem = async () => {
    if (!editingItemId || !selectedOrder) return;

    try {
      // 验证数字字段
      if (editingData.price !== undefined && (isNaN(Number(editingData.price)) || Number(editingData.price) < 0)) {
        toast.error('请输入有效的单价（必须是非负数字）');
        return;
      }
      if (editingData.quantity !== undefined && (isNaN(Number(editingData.quantity)) || Number(editingData.quantity) < 1)) {
        toast.error('请输入有效的数量（必须是大于0的整数）');
        return;
      }

      // 更新订单中的item
      const updatedItems = selectedOrder.items.map(item => {
        if (item.id === editingItemId) {
          // 清理编辑的数据
          const cleanedEditingData = cleanItemData(editingData);

          return {
            productSkuId: item.productSkuId || item.productSku?.id,
            itemNumber: item.itemNumber,
            customerProductCode: item.customerProductCode,
            productImage: item.productImage,
            productSpec: item.productSpec,
            additionalAttributes: item.additionalAttributes,
            quantity: cleanedEditingData.quantity !== undefined ? Number(cleanedEditingData.quantity) : Number(item.quantity),
            price: cleanedEditingData.price !== undefined ? Number(cleanedEditingData.price) : Number(item.price),
            expectedDeliveryDate: item.expectedDeliveryDate,
            // 更新包装信息 - 使用清理后的数据
            ...cleanedEditingData,
          };
        }
        return {
          productSkuId: item.productSkuId || item.productSku?.id,
          itemNumber: item.itemNumber,
          customerProductCode: item.customerProductCode,
          productImage: item.productImage,
          productSpec: item.productSpec,
          additionalAttributes: item.additionalAttributes,
          quantity: Number(item.quantity),
          price: Number(item.price),
          expectedDeliveryDate: item.expectedDeliveryDate,
          packagingConversion: item.packagingConversion,
          packagingUnit: item.packagingUnit,
          weightUnit: item.weightUnit,
          netWeight: item.netWeight,
          grossWeight: item.grossWeight,
          packagingType: item.packagingType,
          packagingSize: item.packagingSize,
          packingQuantity: item.packingQuantity,
          cartonQuantity: item.cartonQuantity,
          packagingMethod: item.packagingMethod,
          paperCardCode: item.paperCardCode,
          washLabelCode: item.washLabelCode,
          outerCartonCode: item.outerCartonCode,
          cartonSpecification: item.cartonSpecification,
          volume: item.volume,
          supplierNote: item.supplierNote,
          summary: item.summary,
          untaxedLocalCurrency: item.untaxedLocalCurrency,
        };
      });

      // 调用API更新订单
      await orderApi.update(selectedOrder.id, { items: updatedItems });

      toast.success('保存成功');
      setEditingItemId(null);
      setEditingData({});

      // 重新加载订单详情和列表
      await viewOrderDetail(selectedOrder.id);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || '保存失败');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingData({});
  };

  // ============ 订单选择相关 ============
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const toggleAllSelection = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const clearSelection = () => {
    setSelectedOrderIds(new Set());
  };

  // ============ 订单审核相关 ============
  const openReviewModal = (order: Order) => {
    setReviewModalOrder(order);
    setRejectReason('');
  };

  const closeReviewModal = () => {
    setReviewModalOrder(null);
    setRejectReason('');
    setReviewLoading(false);
  };

  // 审核通过单个订单
  const handleApprove = async (orderId: string) => {
    try {
      setReviewLoading(true);
      await orderApi.approve(orderId);
      toast.success('订单已审核通过');
      closeReviewModal();
      await loadData();
    } catch (error: any) {
      toast.error(error.message || '审核失败');
    } finally {
      setReviewLoading(false);
    }
  };

  // 驳回单个订单
  const handleReject = async (orderId: string) => {
    if (!rejectReason.trim()) {
      toast.error('请输入驳回原因');
      return;
    }
    try {
      setReviewLoading(true);
      await orderApi.reject(orderId, rejectReason.trim());
      toast.success('订单已驳回');
      closeReviewModal();
      await loadData();
    } catch (error: any) {
      toast.error(error.message || '驳回失败');
    } finally {
      setReviewLoading(false);
    }
  };

  // 同步单个订单到ERP
  const handleSyncToErp = async (orderId: string) => {
    try {
      setReviewLoading(true);
      const result = await orderApi.syncToErp(orderId);
      if (result.success) {
        toast.success(`订单已同步到ERP: ${result.erpOrderNo}`);
      } else {
        toast.error(result.error || '同步失败');
      }
      await loadData();
    } catch (error: any) {
      toast.error(error.message || '同步失败');
    } finally {
      setReviewLoading(false);
    }
  };

  // 批量审核通过
  const handleBatchApprove = async () => {
    const ids = Array.from(selectedOrderIds);
    const pendingIds = ids.filter(id => {
      const order = orders.find(o => o.id === id);
      return order?.status === 'PENDING';
    });

    if (pendingIds.length === 0) {
      toast.error('请选择待审核的订单');
      return;
    }

    try {
      setReviewLoading(true);
      const results = await orderApi.batchApprove(pendingIds);
      const successCount = results.filter((r: any) => r.success).length;
      toast.success(`批量审核完成: ${successCount}/${pendingIds.length} 个订单审核通过`);
      clearSelection();
      await loadData();
    } catch (error: any) {
      toast.error(error.message || '批量审核失败');
    } finally {
      setReviewLoading(false);
    }
  };

  // 批量同步到ERP
  const handleBatchSyncToErp = async () => {
    const ids = Array.from(selectedOrderIds);
    const syncableIds = ids.filter(id => {
      const order = orders.find(o => o.id === id);
      return order?.status === 'APPROVED' || order?.status === 'SYNC_FAILED';
    });

    if (syncableIds.length === 0) {
      toast.error('请选择已审核或同步失败的订单');
      return;
    }

    try {
      setReviewLoading(true);
      const results = await orderApi.batchSyncToErp(syncableIds);
      const successCount = results.filter((r: any) => r.success).length;
      toast.success(`批量同步完成: ${successCount}/${syncableIds.length} 个订单同步成功`);
      clearSelection();
      await loadData();
    } catch (error: any) {
      toast.error(error.message || '批量同步失败');
    } finally {
      setReviewLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    // 搜索过滤
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!order.orderNumber.toLowerCase().includes(search)) {
        return false;
      }
    }

    // 业务员过滤
    if (filterSalesperson && order.salesperson?.id !== filterSalesperson) {
      return false;
    }

    // 客户过滤 - 同时支持网站客户和ERP客户
    if (filterCustomer && order.customer?.id !== filterCustomer && order.erpCustomer?.id !== filterCustomer) {
      return false;
    }

    // 状态过滤
    if (filterStatus && order.status !== filterStatus) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        title="订单管理"
        subtitle="查看和管理所有业务员的订单"
      />

      {/* 筛选区域 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700">
          <Filter size={18} />
          <span>筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">搜索订单号</label>
            <input
              type="text"
              placeholder="输入订单号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 状态筛选 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">订单状态</label>
            <CustomSelect
              options={statusFilterOptions}
              value={filterStatus}
              onChange={(value) => {
                setFilterStatus(value);
                clearSelection(); // 切换筛选时清除选择
              }}
              placeholder="选择状态"
            />
          </div>

          {/* 业务员筛选 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">业务员</label>
            <CustomSelect
              options={[
                { value: '', label: '全部业务员' },
                ...salespersons.map((sp) => ({
                  value: sp.id,
                  label: `${sp.chineseName || sp.accountId} (${sp.accountId})`
                }))
              ]}
              value={filterSalesperson}
              onChange={(value) => setFilterSalesperson(value)}
              placeholder="选择业务员"
            />
          </div>

          {/* 客户筛选 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-700">客户 ({customers.length})</label>
              <button
                type="button"
                onClick={refreshCustomers}
                disabled={refreshingCustomers}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition disabled:opacity-50"
                title="刷新客户列表"
              >
                <RefreshCw size={12} className={refreshingCustomers ? 'animate-spin' : ''} />
                刷新
              </button>
            </div>
            <SearchableSelect
              options={[
                { value: '', label: '全部客户' },
                ...customers.map((customer) => ({
                  value: customer.id,
                  label: customer.cusNo ? `${customer.name} (${customer.cusNo})` : customer.name
                }))
              ]}
              value={filterCustomer}
              onChange={(value) => setFilterCustomer(value)}
              placeholder="搜索或选择客户"
            />
          </div>
        </div>

        {/* 筛选结果统计 */}
        <div className="mt-3 text-sm text-gray-600">
          显示 <span className="font-semibold text-gray-900">{filteredOrders.length}</span> / {orders.length} 个订单
        </div>
      </div>

      {/* 批量操作区域 - 始终显示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-800">
              已选择 <span className="font-semibold">{selectedOrderIds.size}</span> 个订单
            </span>
            {selectedOrderIds.size > 0 && (
              <button
                onClick={clearSelection}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                取消选择
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedOrderIds.size === 0) {
                  toast.warning('请先选择至少一个订单');
                  return;
                }
                handleBatchApprove();
              }}
              disabled={reviewLoading}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={16} />
              批量审核通过
            </button>
            <button
              onClick={() => {
                if (selectedOrderIds.size === 0) {
                  toast.warning('请先选择至少一个订单');
                  return;
                }
                handleBatchSyncToErp();
              }}
              disabled={reviewLoading}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={16} />
              批量同步ERP
            </button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">总订单</div>
          <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <ButtonLoader />
            <span className="ml-3 text-gray-600">加载中...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Package size={48} className="mb-4 text-gray-300" />
            <p>{searchTerm || filterSalesperson || filterCustomer || filterStatus ? '没有找到匹配的订单' : '暂无订单数据'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleAllSelection}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单号
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    业务员
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客户
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单日期
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总金额
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredOrders.map((order) => {
                  const statusConfig = orderStatusConfig[order.status] || orderStatusConfig.PENDING;
                  const StatusIcon = statusConfig.icon;
                  return (
                  <tr key={order.id} className={`hover:bg-gray-50 ${selectedOrderIds.has(order.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.has(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Hash className="w-4 h-4 text-gray-400" />
                        {order.orderNumber}
                      </div>
                      {order.erpOrderNo && (
                        <div className="text-xs text-green-600 mt-1">
                          ERP: {order.erpOrderNo}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                          <StatusIcon size={12} />
                          {statusConfig.label}
                        </span>
                        {order.status === 'REJECTED' && order.rejectReason && (
                          <span className="text-xs text-red-600 truncate max-w-[120px]" title={order.rejectReason}>
                            {order.rejectReason}
                          </span>
                        )}
                        {order.status === 'SYNC_FAILED' && order.erpSyncError && (
                          <span className="text-xs text-orange-600 truncate max-w-[120px]" title={order.erpSyncError}>
                            {order.erpSyncError}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.salesperson?.chineseName || order.salesperson?.accountId || '-'}</div>
                          <div className="text-xs text-gray-500">{order.salesperson?.accountId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900 max-w-[150px] truncate">
                            {order.customer?.name || order.erpCustomer?.name || '-'}
                          </div>
                          {order.erpCustomer?.cusNo && (
                            <div className="text-xs text-gray-500">{order.erpCustomer.cusNo}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(order.orderDate).toLocaleDateString('zh-CN')}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.orderType === 'FORMAL'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {order.orderType === 'FORMAL' ? '销售' : '报价'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                        ¥{formatAmount(order.totalAmount)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => viewOrderDetail(order.id)}
                          className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="查看详情"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleExport(order.id)}
                          className="flex items-center gap-1 px-2 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="导出Excel"
                        >
                          <Download size={14} />
                        </button>
                        {/* 审核按钮 - 仅待审核状态显示 */}
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => openReviewModal(order)}
                            className="flex items-center gap-1 px-2 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title="审核订单"
                          >
                            <CheckCircle size={14} />
                            审核
                          </button>
                        )}
                        {/* 同步ERP按钮 - 已审核或同步失败状态显示 */}
                        {(order.status === 'APPROVED' || order.status === 'SYNC_FAILED') && (
                          <button
                            onClick={() => handleSyncToErp(order.id)}
                            disabled={reviewLoading}
                            className="flex items-center gap-1 px-2 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
                            title={order.status === 'SYNC_FAILED' ? '重新同步ERP' : '同步到ERP'}
                          >
                            {order.status === 'SYNC_FAILED' ? <RefreshCw size={14} /> : <Upload size={14} />}
                            {order.status === 'SYNC_FAILED' ? '重试' : '同步'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 订单详情模态框 */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 模态框头部 */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-start justify-between">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">订单详情</h3>
                  <div className="flex items-center gap-4 text-sm text-blue-100">
                    <span className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      {selectedOrder.orderNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedOrder.orderDate).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* 模态框内容 */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* 业务员和客户信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* 业务员信息 */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    业务员信息
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">姓名：</span>
                      <span className="font-medium text-gray-900">{selectedOrder.salesperson?.chineseName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">工号：</span>
                      <span className="font-medium text-gray-900">{selectedOrder.salesperson?.accountId || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* 客户信息 */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    客户信息
                  </h4>
                  {(() => {
                    const customer = selectedOrder.customer || selectedOrder.erpCustomer;
                    if (!customer) return <div className="text-sm text-gray-500">暂无客户信息</div>;
                    return (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">客户名称：</span>
                          <span className="font-medium text-gray-900">{customer.name || '-'}</span>
                        </div>
                        {(customer as any).cusNo && (
                          <div>
                            <span className="text-gray-600">客户编号：</span>
                            <span className="font-medium text-gray-900 font-mono">{(customer as any).cusNo}</span>
                          </div>
                        )}
                        {(customer as any).contactPerson && (
                          <div>
                            <span className="text-gray-600">联系人：</span>
                            <span className="font-medium text-gray-900">{(customer as any).contactPerson}</span>
                          </div>
                        )}
                        {(customer as any).email && (
                          <div>
                            <span className="text-gray-600">邮箱：</span>
                            <span className="font-medium text-gray-900">{(customer as any).email}</span>
                          </div>
                        )}
                        {(customer as any).phone && (
                          <div>
                            <span className="text-gray-600">电话：</span>
                            <span className="font-medium text-gray-900">{(customer as any).phone}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 订单基本信息 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">订单基本信息</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">订单类型：</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                      selectedOrder.orderType === 'FORMAL'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {selectedOrder.orderType === 'FORMAL' ? '销售订单' : '报价单'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">创建时间：</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">更新时间：</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedOrder.updatedAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 产品列表 */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  产品列表 ({selectedOrder.items.length})
                </h4>

                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      {/* 产品基本信息 */}
                      <div className="flex items-start gap-4 mb-4">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt="产品图片"
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                        )}
                        <div className="flex-1">
                          <div className="text-sm text-gray-600 mb-1">
                            品号: <span className="font-mono font-semibold text-primary">{item.productSku?.productCode || '-'}</span>
                          </div>
                          <div className="font-medium text-gray-900 mb-1">
                            品名: {item.productSku?.productName || item.productSku?.productNameEn || '-'}
                          </div>
                          {item.productSpec && (
                            <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                              规格: {item.productSpec}
                            </div>
                          )}
                          {item.additionalAttributes && (
                            <div className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                              附加属性: {(() => {
                                try {
                                  const attr = item.additionalAttributes;
                                  if (typeof attr === 'string') {
                                    const parsed = JSON.parse(attr);
                                    return parsed.nameZh || parsed.nameEn || '';
                                  } else if (typeof attr === 'object' && attr !== null && 'nameZh' in attr) {
                                    return (attr as any).nameZh;
                                  }
                                  return extractChineseText(attr as string);
                                } catch (e) {
                                  return extractChineseText(item.additionalAttributes as string);
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 价格和数量 */}
                      <div className="grid grid-cols-3 gap-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        {editingItemId === item.id && expandedItems.has(item.id) ? (
                          // 编辑模式 - 可编辑输入框
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-1">单价 *</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editingData.price ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const newPrice = val ? parseFloat(val) : 0;
                                  const newData = {...editingData, price: newPrice};
                                  // 自动计算未税本位币
                                  if (editingData.quantity) {
                                    newData.untaxedLocalCurrency = newPrice * editingData.quantity;
                                  }
                                  setEditingData(newData);
                                }}
                                className="w-full px-3 py-2 border rounded text-sm font-semibold"
                                placeholder="请输入单价"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-1">数量 *</label>
                              <input
                                type="number"
                                step="1"
                                min="1"
                                value={editingData.quantity ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const newQuantity = val ? parseInt(val) : 1;
                                  const newData = {...editingData, quantity: newQuantity};
                                  // 自动计算箱数
                                  if (editingData.packingQuantity && newQuantity) {
                                    newData.cartonQuantity = Math.ceil(newQuantity / editingData.packingQuantity);
                                  }
                                  // 自动计算未税本位币
                                  if (editingData.price) {
                                    newData.untaxedLocalCurrency = Number(editingData.price) * newQuantity;
                                  }
                                  setEditingData(newData);
                                }}
                                className="w-full px-3 py-2 border rounded text-sm font-semibold"
                                placeholder="请输入数量"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-1">未税本位币</label>
                              <div className="text-lg font-bold text-primary bg-white px-3 py-2 border rounded">
                                ¥{formatAmount((Number(editingData.price) || 0) * (Number(editingData.quantity) || 0))}
                              </div>
                            </div>
                          </>
                        ) : (
                          // 查看模式 - 只读显示
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-1">单价</label>
                              <div className="text-sm font-semibold text-gray-900">¥{formatAmount(item.price)}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-1">数量</label>
                              <div className="text-sm font-semibold text-gray-900">{item.quantity}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-1">未税本位币</label>
                              <div className="text-sm font-bold text-blue-600">
                                ¥{formatAmount(item.subtotal)}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* 包装信息 - 始终展开 */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <button
                            onClick={() => toggleItemExpand(item.id)}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            {expandedItems.has(item.id) ? (
                              <>
                                <ChevronUp size={16} />
                                <span>收起包装信息</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown size={16} />
                                <span>展开包装信息</span>
                              </>
                            )}
                          </button>
                          {expandedItems.has(item.id) && editingItemId !== item.id && (
                            <button
                              onClick={() => handleEditItem(item)}
                              className="flex items-center gap-1 px-3 py-1 text-sm text-primary border border-primary rounded hover:bg-primary/5"
                            >
                              <Edit2 size={14} />
                              编辑
                            </button>
                          )}
                        </div>

                        {expandedItems.has(item.id) && (
                          editingItemId === item.id ? (
                            // 编辑模式
                            <div className="pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-4 gap-3 mb-4">
                                <div>
                                  <label className="text-xs text-gray-600">装箱数</label>
                                  <input
                                    type="number"
                                    value={editingData.packingQuantity || ''}
                                    onChange={(e) => {
                                      const packingQty = parseInt(e.target.value) || undefined;
                                      const newData = {...editingData, packingQuantity: packingQty};
                                      // 自动计算箱数
                                      if (packingQty && editingData.quantity) {
                                        newData.cartonQuantity = Math.ceil(editingData.quantity / packingQty);
                                      }
                                      setEditingData(newData);
                                    }}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">箱数</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      value={editingData.cartonQuantity || ''}
                                      onChange={(e) => setEditingData({...editingData, cartonQuantity: parseInt(e.target.value) || undefined})}
                                      className={`w-full mt-1 px-2 py-1 border rounded text-sm ${
                                        editingData.packingQuantity && editingData.quantity && editingData.quantity % editingData.packingQuantity !== 0
                                          ? 'border-orange-400 bg-orange-50'
                                          : ''
                                      }`}
                                    />
                                    {editingData.packingQuantity && editingData.quantity && editingData.quantity % editingData.packingQuantity !== 0 && (
                                      <div className="text-xs text-orange-600 mt-1">⚠️ 不能整除</div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">包装方式</label>
                                  <input
                                    type="text"
                                    value={editingData.packagingMethod || ''}
                                    onChange={(e) => setEditingData({...editingData, packagingMethod: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">纸卡编码</label>
                                  <input
                                    type="text"
                                    value={editingData.paperCardCode || ''}
                                    onChange={(e) => setEditingData({...editingData, paperCardCode: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">水洗标编码</label>
                                  <input
                                    type="text"
                                    value={editingData.washLabelCode || ''}
                                    onChange={(e) => setEditingData({...editingData, washLabelCode: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">外箱编码</label>
                                  <input
                                    type="text"
                                    value={editingData.outerCartonCode || ''}
                                    onChange={(e) => setEditingData({...editingData, outerCartonCode: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">箱规 (cm)</label>
                                  <input
                                    type="text"
                                    value={editingData.cartonSpecification || ''}
                                    onChange={(e) => {
                                      const newCartonSpec = e.target.value;
                                      const calculatedVolume = calculateVolumeFromCartonSpec(newCartonSpec);
                                      setEditingData({
                                        ...editingData,
                                        cartonSpecification: newCartonSpec,
                                        volume: calculatedVolume !== undefined ? calculatedVolume : editingData.volume
                                      });
                                    }}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                    placeholder="例如: 74*44*20"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">体积 (m³)</label>
                                  <input
                                    type="number"
                                    value={editingData.volume || ''}
                                    onChange={(e) => setEditingData({...editingData, volume: parseFloat(e.target.value) || undefined})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div className="col-span-4">
                                  <label className="text-xs text-gray-600">厂商备注</label>
                                  <textarea
                                    value={editingData.supplierNote || ''}
                                    onChange={(e) => setEditingData({...editingData, supplierNote: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                    rows={2}
                                  />
                                </div>
                                <div className="col-span-4">
                                  <label className="text-xs text-gray-600">摘要</label>
                                  <textarea
                                    value={editingData.summary || ''}
                                    onChange={(e) => setEditingData({...editingData, summary: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                    rows={2}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 border border-gray-300 rounded text-sm flex items-center gap-1"
                                >
                                  <X size={14} />
                                  取消
                                </button>
                                <button
                                  onClick={handleSaveItem}
                                  className="px-3 py-1 bg-primary text-white rounded text-sm flex items-center gap-1"
                                >
                                  <Save size={14} />
                                  保存
                                </button>
                              </div>
                            </div>
                          ) : (
                            // 查看模式
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                              {[
                                { key: 'customerProductCode', label: '客户料号' },
                                { key: 'packingQuantity', label: '装箱数' },
                                { key: 'cartonQuantity', label: '箱数', highlight: (item: any) =>
                                  item.packingQuantity && item.quantity && item.quantity % item.packingQuantity !== 0
                                },
                                { key: 'packagingMethod', label: '包装方式' },
                                { key: 'paperCardCode', label: '纸卡编码' },
                                { key: 'washLabelCode', label: '水洗标编码' },
                                { key: 'outerCartonCode', label: '外箱编码' },
                                { key: 'cartonSpecification', label: '箱规' },
                                { key: 'volume', label: '体积' },
                              ].map(({ key, label, highlight }) => (
                                <div key={key}>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                                  <div className={`text-sm ${highlight && highlight(item) ? 'text-orange-600' : 'text-gray-900'}`}>
                                    {(item as any)[key] ?? '-'}
                                    {key === 'cartonQuantity' && item.packingQuantity && item.quantity && item.quantity % item.packingQuantity !== 0 && (
                                      <span className="ml-1 text-orange-600">⚠️ 不能整除</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">预交日</label>
                                <div className="text-sm text-gray-900">
                                  {item.expectedDeliveryDate
                                    ? new Date(item.expectedDeliveryDate).toLocaleDateString('zh-CN')
                                    : '-'
                                  }
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">厂商备注</label>
                                <div className="text-sm text-gray-900">{item.supplierNote || '-'}</div>
                              </div>
                              <div className="md:col-span-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">摘要</label>
                                <div className="text-sm text-gray-900">{item.summary || '-'}</div>
                              </div>
                              {/* 小计 - 右下角 */}
                              <div className="md:col-span-4 flex justify-end">
                                <span className="text-lg font-bold text-primary">
                                  小计: ¥{formatAmount(item.subtotal)}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 订单总计 */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-gray-700">订单总额：</span>
                  <span className="text-blue-600">¥{formatAmount(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* 模态框底部 */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleExport(selectedOrder.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                >
                  <Download size={18} />
                  导出Excel
                </button>

                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 审核模态框 */}
      {reviewModalOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* 模态框头部 */}
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-yellow-500 to-yellow-600">
              <div className="flex items-start justify-between">
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-1">订单审核</h3>
                  <div className="flex items-center gap-2 text-sm text-yellow-100">
                    <Hash className="w-4 h-4" />
                    {reviewModalOrder.orderNumber}
                  </div>
                </div>
                <button
                  onClick={closeReviewModal}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* 模态框内容 */}
            <div className="p-5">
              {/* 订单信息摘要 */}
              <div className="mb-5 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">客户：</span>
                    <span className="font-medium">{reviewModalOrder.customer?.name || reviewModalOrder.erpCustomer?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">业务员：</span>
                    <span className="font-medium">{reviewModalOrder.salesperson?.chineseName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">订单日期：</span>
                    <span className="font-medium">{new Date(reviewModalOrder.orderDate).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">订单金额：</span>
                    <span className="font-medium text-blue-600">¥{formatAmount(reviewModalOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* 驳回原因输入 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  驳回原因（仅驳回时需要填写）
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请输入驳回原因..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleReject(reviewModalOrder.id)}
                  disabled={reviewLoading || !rejectReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle size={18} />
                  驳回
                </button>
                <button
                  onClick={() => handleApprove(reviewModalOrder.id)}
                  disabled={reviewLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={18} />
                  审核通过
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
