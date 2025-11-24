'use client';

import { useEffect, useState } from 'react';
import { orderApi, salespersonApi, customerApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import {
  Package, Calendar, DollarSign, Hash, Eye, X, Filter,
  Download, ChevronDown, ChevronUp,
  User, Building, UserCircle
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import CustomSelect from '@/components/common/CustomSelect';
import SearchableSelect from '@/components/common/SearchableSelect';

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  orderType: 'formal' | 'intention';
  totalAmount: number;
  salesperson: {
    id: string;
    name: string;
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
  productGroup: {
    id: string;
    productCode: string;
    nameZh: string;
    nameEn: string;
    specification: string;
    mainImage?: string;
  };
  price: number;
  quantity: number;

  // 可选字段
  customerProductCode?: string;
  packagingConversion?: string;
  packagingUnit?: string;
  weightUnit?: string;
  netWeight?: string;
  grossWeight?: string;
  packagingType?: string;
  packagingSize?: string;
  packingQuantity?: string;
  cartonQuantity?: string;
  packagingMethod?: string;
  paperCardCode?: string;
  washLabelCode?: string;
  outerCartonCode?: string;
  cartonSpecification?: string;
  volume?: string;
  expectedDeliveryDate?: string;
  supplierNote?: string;
  summary?: string;
}

interface Salesperson {
  id: string;
  name: string;
  accountId: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
}

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
    } catch (error: any) {
      console.error('Failed to load order detail:', error);
      toast.error(error.message || '加载订单详情失败');
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setExpandedItems(new Set());
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

  const filteredOrders = orders.filter((order) => {
    // 搜索过滤
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!order.orderNumber.toLowerCase().includes(search)) {
        return false;
      }
    }

    // 业务员过滤
    if (filterSalesperson && order.salesperson.id !== filterSalesperson) {
      return false;
    }

    // 客户过滤
    if (filterCustomer && order.customer.id !== filterCustomer) {
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
                  label: `${sp.name} (${sp.accountId})`
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
                          <div className="text-sm font-medium text-gray-900">{order.salesperson.name}</div>
                          <div className="text-xs text-gray-500">{order.salesperson.accountId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-900">{order.customer.name}</div>
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
                        order.orderType === 'formal'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {order.orderType === 'formal' ? '正式' : '意向'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        ¥{order.totalAmount.toFixed(2)}
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
                      <span className="font-medium text-gray-900">{selectedOrder.salesperson.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">工号：</span>
                      <span className="font-medium text-gray-900">{selectedOrder.salesperson.accountId}</span>
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
                      <span className="font-medium text-gray-900">{selectedOrder.customer.name}</span>
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
                      selectedOrder.orderType === 'formal'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {selectedOrder.orderType === 'formal' ? '正式订单' : '意向订单'}
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
                        {item.productGroup.mainImage && (
                          <img
                            src={item.productGroup.mainImage}
                            alt={item.productGroup.nameZh}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">
                            {index + 1}. {item.productGroup.nameZh} / {item.productGroup.nameEn}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            品号: <span className="font-mono font-semibold">{item.productGroup.productCode}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            规格: {item.productGroup.specification}
                          </div>
                        </div>
                      </div>

                      {/* 价格和数量 */}
                      <div className="grid grid-cols-3 gap-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1">单价</label>
                          <div className="text-sm font-semibold text-gray-900">¥{item.price.toFixed(2)}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1">数量</label>
                          <div className="text-sm font-semibold text-gray-900">{item.quantity}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1">小计</label>
                          <div className="text-sm font-bold text-blue-600">
                            ¥{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* 可选字段 - 可展开/收起 */}
                      <div>
                        <button
                          onClick={() => toggleItemExpand(item.id)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-3"
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

                        {expandedItems.has(item.id) && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                            {/* 所有可选字段 */}
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
                                <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                                <div className="text-sm text-gray-900">{(item as any)[key] || '-'}</div>
                              </div>
                            ))}

                            {/* 预交日 */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">预交日</label>
                              <div className="text-sm text-gray-900">
                                {item.expectedDeliveryDate
                                  ? new Date(item.expectedDeliveryDate).toLocaleDateString('zh-CN')
                                  : '-'
                                }
                              </div>
                            </div>

                            {/* 厂商备注 */}
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">厂商备注</label>
                              <div className="text-sm text-gray-900">{item.supplierNote || '-'}</div>
                            </div>

                            {/* 摘要 */}
                            <div className="md:col-span-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">摘要</label>
                              <div className="text-sm text-gray-900">{item.summary || '-'}</div>
                            </div>
                          </div>
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
                  <span className="text-blue-600">¥{selectedOrder.totalAmount.toFixed(2)}</span>
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
