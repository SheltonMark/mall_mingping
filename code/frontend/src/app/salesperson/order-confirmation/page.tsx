'use client';

import { useState, useEffect } from 'react';
import { useSalespersonAuth } from '@/context/SalespersonAuthContext';
import { useRouter } from 'next/navigation';
import { orderApi, customerApi } from '@/lib/adminApi';

export default function OrderConfirmationPage() {
  const { salesperson, loading: authLoading } = useSalespersonAuth();
  const router = useRouter();

  // 客户信息状态
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [remarks, setRemarks] = useState('');

  // 订单基本信息
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState('');
  const [customerType, setCustomerType] = useState<'NEW' | 'OLD'>('NEW');
  const [orderType, setOrderType] = useState<'FORMAL' | 'INTENTION'>('INTENTION');

  // 客户列表
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // UI状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 检查认证
  useEffect(() => {
    if (!authLoading && !salesperson) {
      router.push('/salesperson/login');
    }
  }, [authLoading, salesperson, router]);

  // 生成订单号
  useEffect(() => {
    const generateOrderNumber = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `ORD${year}${month}${day}${random}`;
    };
    setOrderNumber(generateOrderNumber());
  }, []);

  // 加载客户列表
  useEffect(() => {
    const loadCustomers = async () => {
      if (!salesperson) return;
      setLoadingCustomers(true);
      try {
        const response = await customerApi.getAll({
          salespersonId: salesperson.id,
          limit: 1000,
        });
        setCustomers(response.data || []);
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoadingCustomers(false);
      }
    };
    loadCustomers();
  }, [salesperson]);

  // 提交订单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证客户信息
    if (!customerCompany || !customerContact || !customerPhone) {
      setError('请填写完整的客户信息');
      return;
    }

    // 验证订单基本信息
    if (!customerId || !orderNumber || !orderDate) {
      setError('请填写完整的订单信息');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        orderNumber,
        customerId,
        salespersonId: salesperson!.id,
        customerType,
        orderType,
        orderDate: new Date(orderDate).toISOString(),
        status: 'PENDING',
        customerCompany,
        customerContact,
        customerPhone,
        customerEmail: customerEmail || undefined,
        remarks: remarks || undefined,
        items: [], // 暂时空数组，后续添加产品选择功能
      };

      await orderApi.create(orderData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '订单创建失败');
    } finally {
      setLoading(false);
    }
  };

  // 选择客户时自动填充信息
  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setCustomerId(selectedId);

    if (selectedId) {
      const customer = customers.find(c => c.id === selectedId);
      if (customer) {
        setCustomerCompany(customer.name || '');
        setCustomerContact(customer.contactPerson || '');
        setCustomerPhone(customer.phone || '');
        setCustomerEmail(customer.email || '');
        setCustomerType(customer.type || 'NEW');
      }
    } else {
      // 清空客户信息
      setCustomerCompany('');
      setCustomerContact('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerType('NEW');
    }
  };

  if (authLoading) {
    return <div className="p-8">加载中...</div>;
  }

  if (!salesperson) {
    return null;
  }

  // 成功页面
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">订单创建成功</h2>
            <p className="text-gray-600 mb-2">订单号</p>
            <p className="text-xl font-bold text-gray-900 mb-6">{orderNumber}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSuccess(false);
                  window.location.reload();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                创建新订单
              </button>
              <button
                onClick={() => router.push('/salesperson/dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                返回工作台
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 订单表单页面
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">创建订单</h1>
          <p className="text-gray-600 mt-1">填写订单信息并提交</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 订单基本信息 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">订单信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  订单号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="订单号"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  订单日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  选择客户 <span className="text-red-500">*</span>
                </label>
                <select
                  value={customerId}
                  onChange={handleCustomerSelect}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">请选择客户</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.contactPerson}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  客户类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value as 'NEW' | 'OLD')}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="NEW">新客户</option>
                  <option value="OLD">老客户</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  订单类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as 'FORMAL' | 'INTENTION')}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="INTENTION">意向订单</option>
                  <option value="FORMAL">正式订单</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  业务员
                </label>
                <input
                  type="text"
                  value={salesperson.chineseName}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* 客户信息 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">客户信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  公司名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="请输入公司名称"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  联系人 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="请输入联系人姓名"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  联系电话 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="请输入联系电话"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  联系邮箱
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="请输入邮箱（可选）"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  订单备注
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="如有特殊要求请在此说明"
                />
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/salesperson/dashboard')}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '提交中...' : '提交订单'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
