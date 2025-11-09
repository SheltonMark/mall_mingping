'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/adminApi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(username, password);
      localStorage.setItem('admin_token', response.access_token);
      localStorage.setItem('admin_username', response.user.username);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* 科技风背景装饰 - 蓝绿色线条 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 网格线 - 青色/蓝绿色 */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />

        {/* 动态光晕效果 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* 科技感几何线条 */}
        <div className="absolute top-20 left-20 w-64 h-64 border border-cyan-500/30 rotate-45 rounded-lg" />
        <div className="absolute bottom-20 right-20 w-48 h-48 border border-teal-500/30 -rotate-12" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-cyan-400/20 rotate-12 rounded-full" />

        {/* SVG科技线条 */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          {/* 对角线 */}
          <line x1="0" y1="0" x2="30%" y2="40%" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1" />
          <line x1="100%" y1="0" x2="70%" y2="60%" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1" />
          <line x1="0" y1="100%" x2="40%" y2="60%" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1" />
          <line x1="100%" y1="100%" x2="60%" y2="40%" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1" />

          {/* 圆环 */}
          <circle cx="20%" cy="30%" r="100" fill="none" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1.5" />
          <circle cx="80%" cy="70%" r="120" fill="none" stroke="rgba(20, 184, 166, 0.2)" strokeWidth="1.5" />
          <circle cx="50%" cy="50%" r="200" fill="none" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="1" />

          {/* 科技感小方块 */}
          <rect x="10%" y="80%" width="60" height="60" fill="none" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1.5" transform="rotate(45 calc(10% + 30) calc(80% + 30))" />
          <rect x="85%" y="15%" width="40" height="40" fill="none" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1.5" transform="rotate(-30 calc(85% + 20) calc(15% + 20))" />
        </svg>

        {/* 扫描线效果 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-scan" />
        </div>
      </div>

      {/* 登录卡片 - 半透明深色玻璃态 */}
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 border border-cyan-500/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl mb-4 relative shadow-lg shadow-cyan-500/30">
            <span className="text-3xl text-white font-bold">L</span>
            {/* 科技感图标装饰 */}
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-300" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-teal-300" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">LEMOPX 管理后台</h1>
          <p className="text-cyan-400">欢迎回来，请登录您的账号</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-gray-500"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-gray-500"
              placeholder="请输入密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
