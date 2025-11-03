'use client';

import { useEffect, useState } from 'react';
import { orderApi, customerApi } from '@/lib/adminApi';

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  salespersonId: string;
  customer: {
    id: string;
    name: string;
  };
  salesperson: {
    id: string;
    chineseName: string;
    englishName: string;
  };
  customerType: 'NEW' | 'OLD';
  orderType: 'FORMAL' | 'INTENTION';
  orderDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'production' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  items?: any[];
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  type: string;
}

const statusLabels = {
  pending: { label: '待确认', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '已确认', color: 'bg-blue-100 text-blue-800' },
  production: { label: '生产中', color: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: '已发货', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: '已送达', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' },
};

const customerTypeLabels = {
  NEW: '新客户',
  OLD: '老客户',
};

const orderTypeLabels = {
  FORMAL: '正式单',
  INTENTION: '意向单',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('');

  useEffect(() => {
    loadOrders();
  }, [searchTerm, statusFilter, orderTypeFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAll({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        orderType: orderTypeFilter || undefined,
      });
      setOrders(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      alert('加载订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个订单吗？此操作不可撤销。')) return;

    try {
      await orderApi.delete(id);
      alert('删除成功');
      loadOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('删除失败');
    }
  };

  const handleExport = (id: string) => {
    orderApi.exportOne(id);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm(`确定要将订单状态更改为"${statusLabels[newStatus as keyof typeof statusLabels]?.label}"吗？`)) return;

    try {
      await orderApi.update(id, { status: newStatus });
      alert('状态更新成功');
      loadOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('状态更新失败');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">订单管理</h1>
        <p className="text-gray-600 mt-1">查看和管理所有业务员创建的订单</p>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="搜索订单（订单号、客户名称）..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">全部状态</option>
            {Object.entries(statusLabels).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <select
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">全部订单类型</option>
            {Object.entries(orderTypeLabels).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">加载中...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <div>暂无订单数据</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">业务员</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单日期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总金额</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.salesperson?.chineseName || '-'}
                      <div className="text-xs text-gray-500">{order.salesperson?.englishName || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.orderType === 'FORMAL' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {orderTypeLabels[order.orderType] || order.orderType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.customerType === 'NEW' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {customerTypeLabels[order.customerType] || order.customerType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ¥{order.totalAmount?.toLocaleString() || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${
                          statusLabels[order.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {Object.entries(statusLabels).map(([key, value]) => (
                          <option key={key} value={key}>{value.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => window.location.href = `/admin/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => handleExport(order.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        导出
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
