'use client';

import { useEffect, useState } from 'react';
import { orderApi, partnershipApi, productApi } from '@/lib/adminApi';
import { Package, ShoppingCart, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalOrders: number;
  totalProducts: number;
  totalPartnerships: number;
  pendingPartnerships: number;
  recentOrders: number;
  orderTrend: 'up' | 'down' | 'stable';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalProducts: 0,
    totalPartnerships: 0,
    pendingPartnerships: 0,
    recentOrders: 0,
    orderTrend: 'stable',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [orders, products, partnerships] = await Promise.all([
        orderApi.getAll({ limit: 1 }),
        productApi.getGroups({ limit: 1 }),
        partnershipApi.getStatistics(),
      ]);

      setStats({
        totalOrders: orders.total || orders.length || 0,
        totalProducts: products.total || products.length || 0,
        totalPartnerships: partnerships.total || 0,
        pendingPartnerships: partnerships.pending || 0,
        recentOrders: 0,
        orderTrend: 'stable',
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600 font-light">加载数据中...</div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: '订单总数',
      subtitle: '所有订单',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      link: '/admin/orders',
      trend: stats.orderTrend,
      change: '+12%',
    },
    {
      title: '产品总数',
      subtitle: '在售产品',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-primary to-gold-600',
      bgColor: 'bg-gold-50',
      iconBg: 'bg-gold-100',
      iconColor: 'text-primary',
      link: '/admin/products',
    },
    {
      title: '合作申请',
      subtitle: `${stats.pendingPartnerships} 待处理`,
      value: stats.totalPartnerships,
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      link: '/admin/partnerships',
      badge: stats.pendingPartnerships > 0 ? stats.pendingPartnerships : null,
    },
  ];

  const quickActions = [
    {
      title: '订单管理',
      description: '查看和处理客户订单',
      icon: ShoppingCart,
      link: '/admin/orders',
      color: 'blue',
      hoverColor: 'hover:border-blue-500 hover:bg-blue-50',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      title: '产品管理',
      description: '添加或编辑产品目录',
      icon: Package,
      link: '/admin/products',
      color: 'primary',
      hoverColor: 'hover:border-primary hover:bg-gold-50',
      iconColor: 'text-primary',
      iconBg: 'bg-gold-100',
    },
    {
      title: '合作申请',
      description: '审核合作伙伴申请',
      icon: Users,
      link: '/admin/partnerships',
      color: 'orange',
      hoverColor: 'hover:border-orange-500 hover:bg-orange-50',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      badge: stats.pendingPartnerships > 0 ? stats.pendingPartnerships : null,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1
          className="text-4xl font-light text-black tracking-wide mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          仪表板
        </h1>
        <div className="w-20 h-[2px] bg-gradient-to-r from-primary to-transparent mb-4"></div>
        <p className="text-gray-600 font-light">
          欢迎回来！这是您的业务概览
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? TrendingUp : card.trend === 'down' ? TrendingDown : Minus;

          return (
            <Link
              key={index}
              href={card.link}
              className="group bg-white rounded-none border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Badge */}
              {card.badge && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {card.badge}
                </div>
              )}

              <div className="relative">
                {/* Icon */}
                <div className={`w-14 h-14 ${card.iconBg} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${card.iconColor}`} strokeWidth={1.5} />
                </div>

                {/* Value */}
                <div className="mb-2">
                  <div className="text-4xl font-light text-black mb-1">
                    {card.value}
                  </div>
                  {card.trend && (
                    <div className="flex items-center gap-1 text-sm">
                      <TrendIcon className={`w-4 h-4 ${card.trend === 'up' ? 'text-green-600' : card.trend === 'down' ? 'text-red-600' : 'text-gray-400'}`} />
                      <span className={`${card.trend === 'up' ? 'text-green-600' : card.trend === 'down' ? 'text-red-600' : 'text-gray-400'}`}>
                        {card.change}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-none border border-gray-200 p-8">
        <div className="mb-6">
          <h2
            className="text-2xl font-light text-black tracking-wide mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            快捷操作
          </h2>
          <div className="w-16 h-[1px] bg-primary"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.link}
                className={`group relative flex items-center gap-4 p-6 border-2 border-gray-200 rounded-lg ${action.hoverColor} transition-all duration-300`}
              >
                {/* Badge */}
                {action.badge && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {action.badge}
                  </div>
                )}

                <div className={`w-12 h-12 ${action.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${action.iconColor}`} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1 group-hover:text-black">
                    {action.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {action.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-br from-neutral-900 to-black rounded-none border border-gray-800 p-10 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary opacity-10 rounded-full blur-3xl"></div>

        <div className="relative">
          <h2
            className="text-3xl font-light mb-3 tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            欢迎使用 LEMOPX 管理后台
          </h2>
          <p className="text-gray-400 font-light max-w-2xl">
            从这个中央仪表板管理您的产品目录、跟踪订单并发展您的业务。使用上面的快捷操作开始。
          </p>
        </div>
      </div>
    </div>
  );
}
