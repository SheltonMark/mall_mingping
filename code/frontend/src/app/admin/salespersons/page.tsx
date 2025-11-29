'use client';

import { useEffect, useState } from 'react';
import { salespersonApi, erpApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import { Edit2, Trash2, Search, X, Lock, RefreshCw, Building2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';

interface Salesperson {
  id: string;
  accountId: string;
  chineseName: string;
  englishName?: string;
  department?: string;
  position?: string;
  erpSyncAt?: string;
  createdAt: string;
  _count?: {
    customers: number;
    erpCustomers: number;
    orders: number;
  };
}

export default function SalespersonsPage() {
  const toast = useToast();
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalesperson, setEditingSalesperson] = useState<Salesperson | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [salespersonToDelete, setSalespersonToDelete] = useState<Salesperson | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [formData, setFormData] = useState({
    password: '',
  });

  useEffect(() => {
    loadSalespersons();
    loadLastSyncTime();
  }, []);

  const loadSalespersons = async () => {
    try {
      setLoading(true);
      const response = await erpApi.getErpSalespersons({ limit: 1000 });
      setSalespersons(response.data || []);
    } catch (error: any) {
      console.error('Failed to load salespersons:', error);
      toast.error('加载业务员列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadLastSyncTime = async () => {
    try {
      const response = await erpApi.getErpSalespersonLastSyncTime();
      setLastSyncTime(response.lastSyncTimeFormatted || '从未同步');
    } catch (error) {
      console.error('Failed to load last sync time:', error);
    }
  };

  // 同步ERP业务员
  const handleSyncErp = async () => {
    setSyncing(true);
    try {
      const result = await erpApi.syncErpSalespersons();
      if (result.success) {
        toast.success(`同步成功！新增 ${result.created} 个，更新 ${result.updated} 个，共 ${result.total} 个业务员`);
        loadSalespersons();
        loadLastSyncTime();
      } else {
        toast.error(result.error || '同步失败');
      }
    } catch (error: any) {
      console.error('Failed to sync ERP salespersons:', error);
      toast.error(error.message || '同步ERP业务员失败');
    } finally {
      setSyncing(false);
    }
  };

  const handleEdit = (salesperson: Salesperson) => {
    setEditingSalesperson(salesperson);
    setFormData({
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password.trim()) {
      toast.error('请输入新密码');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('密码至少6位');
      return;
    }

    setSubmitting(true);
    try {
      await salespersonApi.update(editingSalesperson!.id, {
        password: formData.password,
      });
      toast.success('密码已更新');
      setIsModalOpen(false);
      setEditingSalesperson(null);
      setFormData({ password: '' });
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || '更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (salesperson: Salesperson) => {
    setSalespersonToDelete(salesperson);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!salespersonToDelete) return;

    try {
      await salespersonApi.delete(salespersonToDelete.id);
      toast.success('业务员已删除');
      setDeleteConfirmOpen(false);
      setSalespersonToDelete(null);
      loadSalespersons();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || '删除失败');
    }
  };

  const filteredSalespersons = salespersons.filter(
    (sp) =>
      sp.accountId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sp.chineseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sp.englishName && sp.englishName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        title="业务员管理"
        subtitle={`共 ${salespersons.length} 个业务员`}
        actions={
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              上次同步: {lastSyncTime}
            </span>
            <button
              onClick={handleSyncErp}
              disabled={syncing}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
              {syncing ? '同步中...' : '同步ERP业务员'}
            </button>
          </div>
        }
      />

      {/* 搜索栏 */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索工号、中文名、英文名..."
            className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Building2 size={16} />
          业务员数据来自ERP系统同步
        </div>
      </div>

      {/* 业务员列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <ButtonLoader />
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          </div>
        ) : filteredSalespersons.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-8xl mb-6">👔</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">还没有业务员</h3>
            <p className="text-gray-600 mb-8 text-lg">点击"同步ERP业务员"从ERP系统获取业务员数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">工号</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">中文名</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">英文名</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">部门</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">职位</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">客户数</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">订单数</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">同步时间</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSalespersons.map((salesperson) => (
                  <tr key={salesperson.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                        {salesperson.accountId}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {salesperson.chineseName}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {salesperson.englishName || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {salesperson.department || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {salesperson.position || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          网站: {salesperson._count?.customers || 0}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          ERP: {salesperson._count?.erpCustomers || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {salesperson._count?.orders || 0} 单
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {salesperson.erpSyncAt
                        ? new Date(salesperson.erpSyncAt).toLocaleString('zh-CN')
                        : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(salesperson)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="修改密码"
                        >
                          <Lock size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(salesperson)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 size={18} />
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

      {/* 修改密码模态框 */}
      {isModalOpen && editingSalesperson && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  修改密码
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
              {/* 业务员信息（只读） */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">工号：</span>
                  <span className="text-sm font-mono font-semibold text-blue-600">{editingSalesperson.accountId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">姓名：</span>
                  <span className="text-sm font-medium">{editingSalesperson.chineseName}</span>
                </div>
                {editingSalesperson.department && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">部门：</span>
                    <span className="text-sm">{editingSalesperson.department}</span>
                  </div>
                )}
              </div>

              {/* 新密码 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  新密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="请输入新密码（至少6位）"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <ButtonLoader />
                      <span>更新中...</span>
                    </>
                  ) : (
                    <span>确认修改</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {deleteConfirmOpen && salespersonToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b bg-gradient-to-r from-red-50 to-rose-50 border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">删除业务员</h3>
                  <p className="text-sm text-gray-600 mt-0.5">此操作需要您确认</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <p className="text-gray-700 text-base leading-relaxed">
                确定要删除业务员 <strong>{salespersonToDelete.chineseName}</strong> ({salespersonToDelete.accountId}) 吗？此操作不可恢复！
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                <span>确认删除</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
