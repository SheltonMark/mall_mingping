'use client';

import { useEffect, useState } from 'react';
import { orderFormApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { Package, Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';

interface OrderForm {
  id: string;
  formNumber: string;
  customerId: string;
  customer: {
    id: string;
    email: string;
    name?: string;
    contactPerson?: string;
  };
  contactName: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  items: any[];
  totalAmount: string;
  status: string;
  submittedAt: string;
  createdAt: string;
}

export default function OrdersPage() {
  const toast = useToast();
  const [orderForms, setOrderForms] = useState<OrderForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadOrderForms();
  }, []);

  const loadOrderForms = async () => {
    try {
      setLoading(true);
      const response = await orderFormApi.getAll();
      setOrderForms(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error('Failed to load order forms:', error);
      toast.error(error.message || '加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrderForms = orderForms.filter((form) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      form.formNumber.toLowerCase().includes(search) ||
      form.contactName.toLowerCase().includes(search) ||
      form.email.toLowerCase().includes(search) ||
      form.phone.includes(search) ||
      (form.customer?.name && form.customer.name.toLowerCase().includes(search))
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        title="订单管理"
        subtitle="查看和管理客户订单"
      />

      {/* 搜索栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          placeholder="搜索订单（订单号、客户名称、联系人、邮箱、电话）..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">总订单</div>
          <div className="text-2xl font-bold text-gray-900">{orderForms.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">本周订单</div>
          <div className="text-2xl font-bold text-blue-600">
            {orderForms.filter((f) => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(f.submittedAt) > weekAgo;
            }).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">总金额</div>
          <div className="text-2xl font-bold text-green-600">
            ¥{orderForms.reduce((sum, f) => sum + Number(f.totalAmount || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">加载中...</div>
          </div>
        ) : filteredOrderForms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <div>{searchTerm ? '未找到匹配的订单' : '暂无订单数据'}</div>
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
                    客户信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    联系方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    提交时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrderForms.map((form) => (
                  <>
                    <tr key={form.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {form.formNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{form.contactName}</div>
                            {form.customer?.name && (
                              <div className="text-xs text-gray-500">{form.customer.name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{form.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{form.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            {new Date(form.submittedAt).toLocaleDateString('zh-CN')}
                            <div className="text-xs text-gray-500">
                              {new Date(form.submittedAt).toLocaleTimeString('zh-CN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ¥{Number(form.totalAmount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => toggleExpand(form.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {expandedId === form.id ? '收起' : '查看详情'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === form.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            {/* 地址 */}
                            <div>
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-4 h-4" />
                                <span>收货地址</span>
                              </div>
                              <div className="text-sm text-gray-900 pl-6">{form.address}</div>
                            </div>

                            {/* 备注 */}
                            {form.notes && (
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-2">备注</div>
                                <div className="text-sm text-gray-900 pl-6">{form.notes}</div>
                              </div>
                            )}

                            {/* 商品明细 */}
                            <div>
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Package className="w-4 h-4" />
                                <span>商品明细 ({form.items.length} 件)</span>
                              </div>
                              <div className="pl-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-white">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                        品号
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                        品名
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                        配置
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                        数量
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                        单价
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                        小计
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {form.items.map((item: any, index: number) => (
                                      <tr key={index}>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {item.product_code || item.sku || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {item.product_name || item.groupName || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                          {item.configuration
                                            ? Object.entries(item.configuration)
                                                .map(([key, value]) => `${key}: ${value}`)
                                                .join(', ')
                                            : item.colorCombination
                                            ? Object.entries(item.colorCombination)
                                                .map(([key, value]) => `${key}: ${value}`)
                                                .join(', ')
                                            : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {item.quantity}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          ¥{Number(item.unit_price || item.price || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                          ¥
                                          {(
                                            Number(item.unit_price || item.price || 0) *
                                            item.quantity
                                          ).toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
