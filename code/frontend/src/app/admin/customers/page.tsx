'use client';

import { useEffect, useState } from 'react';
import { customerApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import { Plus, Edit2, Trash2, Search, X, Mail, Lock, User, Phone, MapPin, Building } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';

interface Customer {
  id: string;
  email: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  tier: 'STANDARD' | 'VIP' | 'SVIP';
  status: string;
  createdAt: string;
}

export default function CustomersPage() {
  const toast = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    contactPerson: '',
    phone: '',
    address: '',
    tier: 'STANDARD' as 'STANDARD' | 'VIP' | 'SVIP',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getAll({ limit: 1000 });
      setCustomers(Array.isArray(response) ? response : response.data || []);
    } catch (error: any) {
      console.error('Failed to load customers:', error);
      toast.error('加载客户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      contactPerson: '',
      phone: '',
      address: '',
      tier: 'STANDARD',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      email: customer.email,
      password: '', // 编辑时不显示密码
      name: customer.name,
      contactPerson: customer.contactPerson || '',
      phone: customer.phone || '',
      address: customer.address || '',
      tier: customer.tier,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.email.trim()) {
      toast.error('请输入邮箱');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('请输入公司名称');
      return;
    }
    if (!editingCustomer && !formData.password.trim()) {
      toast.error('请输入密码');
      return;
    }
    if (!editingCustomer && formData.password.length < 8) {
      toast.error('密码至少8位');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCustomer) {
        // 更新客户
        await customerApi.update(editingCustomer.id, {
          name: formData.name,
          contactPerson: formData.contactPerson || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          tier: formData.tier,
        });
        toast.success('客户信息已更新');
      } else {
        // 新增客户
        await customerApi.create({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          contactPerson: formData.contactPerson || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          tier: formData.tier,
        });
        toast.success('客户已创建');
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      setFormData({
        email: '',
        password: '',
        name: '',
        contactPerson: '',
        phone: '',
        address: '',
        tier: 'STANDARD',
      });
      loadCustomers();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || editingCustomer ? '更新失败' : '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await customerApi.delete(customerToDelete.id);
      toast.success('客户已删除');
      loadCustomers();
      setDeleteConfirmOpen(false);
      setCustomerToDelete(null);
    } catch (error: any) {
      toast.error('删除失败: ' + error.message);
    }
  };

  // 过滤客户
  const filteredCustomers = customers.filter(customer =>
    searchTerm === '' ||
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.contactPerson && customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 等级标签样式
  const getTierBadge = (tier: string) => {
    const styles = {
      STANDARD: 'bg-gray-100 text-gray-700 border-gray-300',
      VIP: 'bg-blue-100 text-blue-700 border-blue-300',
      SVIP: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 border-amber-300',
    };
    const labels = {
      STANDARD: '普通',
      VIP: 'VIP',
      SVIP: 'SVIP ⭐',
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[tier as keyof typeof styles]}`}>
        {labels[tier as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        title="客户管理"
        subtitle={`共 ${filteredCustomers.length} 个客户`}
        actions={
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-gold-600 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            新增客户
          </button>
        }
      />

      {/* 搜索栏 */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索公司名称、邮箱、联系人..."
          className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* 客户列表 */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <ButtonLoader />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="text-8xl mb-6">👥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">还没有客户</h3>
            <p className="text-gray-600 mb-8 text-lg">点击"新增客户"创建第一个客户</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">公司名称</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">邮箱</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">联系人</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">电话</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">客户等级</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.contactPerson || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.phone || '-'}</td>
                    <td className="px-6 py-4">{getTierBadge(customer.tier)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(customer.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
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

      {/* 新增/编辑客户模态框 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingCustomer ? '编辑客户' : '新增客户'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* 邮箱 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  邮箱 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingCustomer}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="customer@example.com"
                    required
                  />
                </div>
                {editingCustomer && (
                  <p className="text-xs text-gray-500 mt-1">邮箱不可修改</p>
                )}
              </div>

              {/* 密码 (仅新增时显示) */}
              {!editingCustomer && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="至少8位字符"
                      minLength={8}
                      required
                    />
                  </div>
                </div>
              )}

              {/* 公司名称 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  公司名称 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：铭品日用品有限公司"
                    required
                  />
                </div>
              </div>

              {/* 客户等级 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  客户等级 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'STANDARD', label: '普通客户', desc: '标准权限' },
                    { value: 'VIP', label: 'VIP客户', desc: '查看VIP产品' },
                    { value: 'SVIP', label: 'SVIP客户 ⭐', desc: '查看全部产品' },
                  ].map((tier) => (
                    <button
                      key={tier.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, tier: tier.value as any })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.tier === tier.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{tier.label}</div>
                      <div className="text-xs text-gray-500">{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 联系人 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">联系人</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：张三"
                  />
                </div>
              </div>

              {/* 电话 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">电话</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：13800138000"
                  />
                </div>
              </div>

              {/* 地址 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">地址</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="例如：浙江省杭州市西湖区..."
                  />
                </div>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
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
                      <span>{editingCustomer ? '更新中...' : '创建中...'}</span>
                    </>
                  ) : (
                    <span>{editingCustomer ? '更新客户' : '创建客户'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {deleteConfirmOpen && customerToDelete && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeleteConfirmOpen(false);
              setCustomerToDelete(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">确认删除</h3>
              <p className="text-gray-600 mb-2">
                确定要删除客户
              </p>
              <p className="text-xl font-semibold text-gray-900 mb-6">
                "{customerToDelete.name}"
              </p>
              <p className="text-sm text-gray-500 mb-8">
                此操作无法撤销，该客户的所有相关数据将被永久删除
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setCustomerToDelete(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg shadow-red-500/30"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
