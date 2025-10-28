'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_username');

    if (token && user) {
      setIsAuthenticated(true);
      setUsername(user);
    } else if (pathname !== '/admin/login') {
      router.push('/admin/login');
    }
    setIsLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    { icon: '📊', label: '仪表盘', path: '/admin' },
    { icon: '👥', label: '业务员管理', path: '/admin/salespersons' },
    { icon: '👤', label: '客户管理', path: '/admin/customers' },
    { icon: '📦', label: '订单管理', path: '/admin/orders' },
    { icon: '🏷️', label: '产品管理', path: '/admin/products' },
    { icon: '🤝', label: '合作申请', path: '/admin/partnerships' },
    { icon: '⚙️', label: '系统配置', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-xl font-bold">
            L
          </div>
          <span className="text-xl font-bold">LEMOPX 管理后台</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">👤 {username}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            退出登录
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gray-900 text-white overflow-y-auto">
        <nav className="p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path ||
                           (item.path !== '/admin' && pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
}
