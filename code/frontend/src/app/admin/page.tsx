'use client';

import { useEffect, useState } from 'react';
import { salespersonApi, customerApi, orderApi, partnershipApi } from '@/lib/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    salespersons: 0,
    customers: 0,
    orders: 0,
    partnerships: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [salespersons, customers, orders, partnerships] = await Promise.all([
        salespersonApi.getAll({ limit: 1 }),
        customerApi.getAll({ limit: 1 }),
        orderApi.getAll({ limit: 1 }),
        partnershipApi.getStatistics(),
      ]);

      setStats({
        salespersons: salespersons.total || salespersons.length,
        customers: customers.total || customers.length,
        orders: orders.total || orders.length,
        partnerships: partnerships.total || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '业务员总数',
      value: stats.salespersons,
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '客户总数',
      value: stats.customers,
      icon: '👤',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '订单总数',
      value: stats.orders,
      icon: '📦',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '合作申请',
      value: stats.partnerships,
      icon: '🤝',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">仪表盘</h1>
        <p className="text-gray-600">欢迎回来！这是您的数据概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                {card.value}
              </div>
            </div>
            <div className="text-gray-600 font-medium">{card.title}</div>
          </div>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/salespersons"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <span className="text-3xl">👥</span>
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                管理业务员
              </div>
              <div className="text-sm text-gray-500">添加或编辑业务员信息</div>
            </div>
          </a>

          <a
            href="/admin/customers"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <span className="text-3xl">👤</span>
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-green-600">
                管理客户
              </div>
              <div className="text-sm text-gray-500">查看和管理客户信息</div>
            </div>
          </a>

          <a
            href="/admin/orders"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <span className="text-3xl">📦</span>
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-purple-600">
                管理订单
              </div>
              <div className="text-sm text-gray-500">处理客户订单</div>
            </div>
          </a>
        </div>
      </div>

      {/* API信息 */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">💡 系统信息</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-mono bg-white px-3 py-1 rounded border border-gray-300">
              后台服务运行在: http://localhost:3001
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-white px-3 py-1 rounded border border-gray-300">
              数据库: SQLite (dev.db)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-white px-3 py-1 rounded border border-gray-300">
              API端点: 73个
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
