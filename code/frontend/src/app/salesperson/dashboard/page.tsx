'use client';

import { useEffect } from 'react';
import { useSalespersonAuth } from '@/context/SalespersonAuthContext';
import { useRouter } from 'next/navigation';

export default function SalespersonDashboardPage() {
  const { salesperson, loading, logout } = useSalespersonAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !salesperson) {
      router.push('/salesperson/login');
    }
  }, [loading, salesperson, router]);

  if (loading) return <div className="p-8">加载中...</div>;
  if (!salesperson) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">业务员工作台</h1>
        <div className="flex items-center gap-4">
          <span>{salesperson.chineseName}</span>
          <button onClick={logout} className="text-red-600 hover:underline">
            退出登录
          </button>
        </div>
      </nav>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">我的客户</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">我的订单</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">本月业绩</h3>
            <p className="text-3xl font-bold">¥0</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">个人信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">工号：</span>
              <span>{salesperson.accountId}</span>
            </div>
            <div>
              <span className="text-gray-600">中文名：</span>
              <span>{salesperson.chineseName}</span>
            </div>
            <div>
              <span className="text-gray-600">英文名：</span>
              <span>{salesperson.englishName}</span>
            </div>
            <div>
              <span className="text-gray-600">邮箱：</span>
              <span>{salesperson.email || '-'}</span>
            </div>
            <div>
              <span className="text-gray-600">电话：</span>
              <span>{salesperson.phone || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
