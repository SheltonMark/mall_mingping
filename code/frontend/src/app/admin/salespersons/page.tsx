'use client';

import { useEffect, useState } from 'react';
import { salespersonApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import { Plus, Edit2, Trash2, Search, X, User, Lock, Hash } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';

interface Salesperson {
  id: string;
  accountId: string;
  chineseName: string;
  createdAt: string;
  _count?: {
    customers: number;
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
  const [formData, setFormData] = useState({
    accountId: '',
    chineseName: '',
    password: '',
  });

  useEffect(() => {
    loadSalespersons();
  }, []);

  const loadSalespersons = async () => {
    try {
      setLoading(true);
      const response = await salespersonApi.getAll({ limit: 1000 });
      setSalespersons(Array.isArray(response) ? response : response.data || []);
    } catch (error: any) {
      console.error('Failed to load salespersons:', error);
      toast.error('加载业务员列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSalesperson(null);
    setFormData({
      accountId: '',
      chineseName: '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (salesperson: Salesperson) => {
    setEditingSalesperson(salesperson);
    setFormData({
      accountId: salesperson.accountId,
      chineseName: salesperson.chineseName,
      password: '', // 编辑时不显示密码
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.accountId.trim()) {
      toast.error('请输入工号');
      return;
    }
    if (!formData.chineseName.trim()) {
      toast.error('请输入中文名');
      return;
    }
    if (!editingSalesperson && !formData.password.trim()) {
      toast.error('请输入密码');
      return;
    }
    if (!editingSalesperson && formData.password.length < 6) {
      toast.error('密码至少6位');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSalesperson) {
        // 更新业务员
        const updateData: any = {
          accountId: formData.accountId,
          chineseName: formData.chineseName,
        };
        // 只有填写了新密码才更新密码
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        await salespersonApi.update(editingSalesperson.id, updateData);
        toast.success('业务员信息已更新');
      } else {
        // 新增业务员
        await salespersonApi.create({
          accountId: formData.accountId,
          chineseName: formData.chineseName,
          password: formData.password,
        });
        toast.success('业务员已创建');
      }
      setIsModalOpen(false);
      setEditingSalesperson(null);
      setFormData({
        accountId: '',
        chineseName: '',
        password: '',
      });
      loadSalespersons();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || (editingSalesperson ? '更新失败' : '创建失败'));
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
      sp.chineseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        title="业务员管理"
        subtitle={`共 ${salespersons.length} 个业务员`}
      />

      {/* 搜索栏和新增按钮 */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索工号、姓名..."
            className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
        >
          <Plus size={18} />
          新增业务员
        </button>
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
            <p className="text-gray-600 mb-8 text-lg">点击上方按钮添加第一个业务员</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">工号</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">客户数量</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSalespersons.map((salesperson) => (
                  <tr key={salesperson.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                        {salesperson.accountId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {salesperson.chineseName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {salesperson._count?.customers || 0} 个客户
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(salesperson.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(salesperson)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 size={18} />
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

      {/* 新增/编辑模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingSalesperson ? '编辑业务员' : '新增业务员'}
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
              {/* 工号 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  工号 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                    placeholder="例如: SP001"
                    required
                    disabled={!!editingSalesperson} // 编辑时不能修改工号
                  />
                </div>
              </div>

              {/* 中文名 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  中文名 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.chineseName}
                    onChange={(e) => setFormData({ ...formData, chineseName: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="例如: 张三"
                    required
                  />
                </div>
              </div>

              {/* 密码 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  密码 {!editingSalesperson && <span className="text-red-500">*</span>}
                  {editingSalesperson && <span className="text-gray-500 text-xs">(留空则不修改)</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={editingSalesperson ? "留空则不修改密码" : "至少6位"}
                    required={!editingSalesperson}
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
                      <span>{editingSalesperson ? '更新中...' : '创建中...'}</span>
                    </>
                  ) : (
                    <span>{editingSalesperson ? '更新' : '创建'}</span>
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
