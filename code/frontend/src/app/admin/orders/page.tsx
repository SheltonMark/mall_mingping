'use client';

import { useEffect, useState } from 'react';
import { orderFormApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { Package, Mail, Phone, MapPin, Calendar, User, Download } from 'lucide-react';
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

  const exportToExcel = (form: OrderForm) => {
    // 创建CSV内容
    const headers = [
      '订单号',
      '客户姓名',
      '客户邮箱',
      '联系电话',
      '收货地址',
      '提交时间',
      '备注',
      '品号',
      '品名',
      '品名(英文)',
      '货品规格',
      '附加属性',
      '数量'
    ];

    const rows = form.items.map((item: any, index: number) => {
      const isFirstItem = index === 0;
      return [
        isFirstItem ? form.formNumber : '',
        isFirstItem ? form.contactName : '',
        isFirstItem ? form.email : '',
        isFirstItem ? form.phone : '',
        isFirstItem ? form.address : '',
        isFirstItem ? new Date(form.submittedAt).toLocaleString('zh-CN') : '',
        isFirstItem ? (form.notes || '') : '',
        item.product_code || item.sku || '',
        item.productName || item.product_name || item.groupName || '',
        item.productNameEn || '',
        item.specification ? item.specification.replace(/\n/g, ' ') : '',
        typeof item.optionalAttributes === 'object'
          ? (item.optionalAttributes?.nameZh || item.optionalAttributes?.nameEn || '')
          : (item.optionalAttributes || ''),
        item.quantity || 0
      ];
    });

    // 组合CSV内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // 添加BOM以支持中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `订单_${form.formNumber}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('订单已导出');
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleExpand(form.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {expandedId === form.id ? '收起' : '查看详情'}
                          </button>
                          <button
                            onClick={() => exportToExcel(form)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                          >
                            <Download size={14} />
                            导出订单
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === form.id && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
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
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {form.items.map((item: any, index: number) => (
                                      <tr key={index}>
                                        <td className="px-4 py-2 text-sm text-gray-900 font-mono">
                                          {item.product_code || item.sku || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          <div>
                                            <div className="font-medium">
                                              {item.productName || item.product_name || item.groupName || '-'}
                                            </div>
                                            {item.productNameEn && item.productNameEn !== item.productName && (
                                              <div className="text-xs text-gray-500 mt-0.5">
                                                {item.productNameEn}
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                          <div className="space-y-2">
                                            {/* 显示货品规格 */}
                                            {item.specification && (
                                              <div>
                                                <span className="text-xs font-semibold text-gray-800">货品规格：</span>
                                                <div className="text-xs text-gray-900 whitespace-pre-line mt-1">
                                                  {item.specification}
                                                </div>
                                              </div>
                                            )}

                                            {/* 显示附加属性 */}
                                            {item.optionalAttributes && (
                                              <div>
                                                <span className="text-xs font-semibold text-gray-800">附加属性：</span>
                                                <div className="text-xs text-gray-900 mt-1">
                                                  {typeof item.optionalAttributes === 'object'
                                                    ? item.optionalAttributes.nameZh || item.optionalAttributes.nameEn || '-'
                                                    : item.optionalAttributes
                                                  }
                                                </div>
                                              </div>
                                            )}

                                            {/* 如果都没有，显示"-" */}
                                            {!item.specification && !item.optionalAttributes && '-'}
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {item.quantity}
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
