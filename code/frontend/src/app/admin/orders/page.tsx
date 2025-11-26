'use client';

import { useEffect, useState } from 'react';
import { orderApi, salespersonApi, customerApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import {
  Package, Calendar, Hash, Eye, X, Filter,
  Download, ChevronDown, ChevronUp, Edit2, Save,
  User, Building, UserCircle
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import CustomSelect from '@/components/common/CustomSelect';
import SearchableSelect from '@/components/common/SearchableSelect';

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  orderType: 'FORMAL' | 'INTENTION';
  totalAmount: number | string;
  salesperson: {
    id: string;
    chineseName?: string;
    accountId: string;
  };
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
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
}

// 格式化金额
const formatAmount = (amount: any) => {
  const num = typeof amount === 'number' ? amount : Number(amount || 0);
  return num.toFixed(2);
};

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

  // 筛选条件
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSalesperson, setFilterSalesperson] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');

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
      const [ordersRes, salespersonsRes, customersRes] = await Promise.all([
        orderApi.getAll({ limit: 1000 }),
        salespersonApi.getAll({ limit: 1000 }),
        customerApi.getAll({ limit: 1000 }),
      ]);

      setOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes.data || []);
      setSalespersons(Array.isArray(salespersonsRes) ? salespersonsRes : salespersonsRes.data || []);
      setCustomers(Array.isArray(customersRes) ? customersRes : customersRes.data || []);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error(error.message || '加载数据失败');
    } finally {
      setLoading(false);
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
      const numberFields = ['packagingConversion', 'netWeight', 'grossWeight', 'packingQuantity', 'cartonQuantity', 'volume', 'quantity', 'price'];
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
    setEditingData({
      price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
      quantity: item.quantity,
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

    // 客户过滤
    if (filterCustomer && order.customer?.id !== filterCustomer) {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-xs font-medium text-gray-700 mb-1">客户</label>
            <SearchableSelect
              options={[
                { value: '', label: '全部客户' },
                ...customers.map((customer) => ({
                  value: customer.id,
                  label: customer.name
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
            <p>{searchTerm || filterSalesperson || filterCustomer ? '没有找到匹配的订单' : '暂无订单数据'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    业务员
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Hash className="w-4 h-4 text-gray-400" />
                        {order.orderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.salesperson?.chineseName || order.salesperson?.accountId || '-'}</div>
                          <div className="text-xs text-gray-500">{order.salesperson?.accountId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-900">{order.customer?.name || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(order.orderDate).toLocaleDateString('zh-CN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.orderType === 'FORMAL'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {order.orderType === 'FORMAL' ? '正式' : '意向'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                        
                        ¥{formatAmount(order.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewOrderDetail(order.id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                          查看
                        </button>
                        <button
                          onClick={() => handleExport(order.id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Download size={16} />
                          导出
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">客户名称：</span>
                      <span className="font-medium text-gray-900">{selectedOrder.customer?.name || '-'}</span>
                    </div>
                    {selectedOrder.customer.email && (
                      <div>
                        <span className="text-gray-600">邮箱：</span>
                        <span className="font-medium text-gray-900">{selectedOrder.customer.email}</span>
                      </div>
                    )}
                    {selectedOrder.customer.phone && (
                      <div>
                        <span className="text-gray-600">电话：</span>
                        <span className="font-medium text-gray-900">{selectedOrder.customer.phone}</span>
                      </div>
                    )}
                  </div>
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
                      {selectedOrder.orderType === 'FORMAL' ? '正式订单' : '意向订单'}
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
                                  setEditingData({...editingData, price: val ? parseFloat(val) : 0});
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
                                  setEditingData({...editingData, quantity: val ? parseInt(val) : 1});
                                }}
                                className="w-full px-3 py-2 border rounded text-sm font-semibold"
                                placeholder="请输入数量"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-1">小计</label>
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
                              <label className="block text-sm font-semibold text-gray-900 mb-1">小计</label>
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
                                  <label className="text-xs text-gray-600">包装换算</label>
                                  <input
                                    type="text"
                                    value={editingData.packagingConversion || ''}
                                    onChange={(e) => setEditingData({...editingData, packagingConversion: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">包装单位</label>
                                  <input
                                    type="text"
                                    value={editingData.packagingUnit || ''}
                                    onChange={(e) => setEditingData({...editingData, packagingUnit: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">重量单位</label>
                                  <input
                                    type="text"
                                    value={editingData.weightUnit || ''}
                                    onChange={(e) => setEditingData({...editingData, weightUnit: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">净重</label>
                                  <input
                                    type="number"
                                    value={editingData.netWeight || ''}
                                    onChange={(e) => setEditingData({...editingData, netWeight: parseFloat(e.target.value) || undefined})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">毛重</label>
                                  <input
                                    type="number"
                                    value={editingData.grossWeight || ''}
                                    onChange={(e) => setEditingData({...editingData, grossWeight: parseFloat(e.target.value) || undefined})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">包装类型</label>
                                  <input
                                    type="text"
                                    value={editingData.packagingType || ''}
                                    onChange={(e) => setEditingData({...editingData, packagingType: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">包装尺寸</label>
                                  <input
                                    type="text"
                                    value={editingData.packagingSize || ''}
                                    onChange={(e) => setEditingData({...editingData, packagingSize: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">装箱数量</label>
                                  <input
                                    type="number"
                                    value={editingData.packingQuantity || ''}
                                    onChange={(e) => setEditingData({...editingData, packingQuantity: parseInt(e.target.value) || undefined})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">外箱数量</label>
                                  <input
                                    type="number"
                                    value={editingData.cartonQuantity || ''}
                                    onChange={(e) => setEditingData({...editingData, cartonQuantity: parseInt(e.target.value) || undefined})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
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
                                { key: 'packagingConversion', label: '包装换算' },
                                { key: 'packagingUnit', label: '包装单位' },
                                { key: 'weightUnit', label: '重量单位' },
                                { key: 'netWeight', label: '包装净重' },
                                { key: 'grossWeight', label: '包装毛重' },
                                { key: 'packagingType', label: '包装类型' },
                                { key: 'packagingSize', label: '包装大小' },
                                { key: 'packingQuantity', label: '装箱数' },
                                { key: 'cartonQuantity', label: '箱数' },
                                { key: 'packagingMethod', label: '包装方式' },
                                { key: 'paperCardCode', label: '纸卡编码' },
                                { key: 'washLabelCode', label: '水洗标编码' },
                                { key: 'outerCartonCode', label: '外箱编码' },
                                { key: 'cartonSpecification', label: '箱规' },
                                { key: 'volume', label: '体积' },
                              ].map(({ key, label }) => (
                                <div key={key}>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                                  <div className="text-sm text-gray-900">{(item as any)[key] ?? '-'}</div>
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
    </div>
  );
}
