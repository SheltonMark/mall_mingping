'use client';

import { useEffect, useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { customerApi, salespersonApi } from '@/lib/adminApi';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useToast } from '@/components/common/ToastContainer';
import CustomSelect from '@/components/common/CustomSelect';

interface Customer {
  id: string;
  name: string;
  customerType: 'NEW' | 'OLD';
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  remarks?: string;
  salespersonId?: string;
  salesperson?: {
    id: string;
    name: string;
    accountId: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Salesperson {
  id: string;
  accountId: string;
  name: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    customerType: 'NEW' as 'NEW' | 'OLD',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    remarks: '',
    salespersonId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { confirm, isOpen, options, handleConfirm, handleClose } = useConfirm();
  const toast = useToast();

  useEffect(() => {
    loadCustomers();
    loadSalespersons();
  }, [searchTerm, typeFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getAll({
        search: searchTerm || undefined,
        type: typeFilter || undefined,
      });
      setCustomers(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast.error('加载客户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadSalespersons = async () => {
    try {
      const response = await salespersonApi.getAll();
      setSalespersons(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Failed to load salespersons:', error);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      customerType: 'NEW',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      address: '',
    remarks: '',
      salespersonId: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      customerType: customer.customerType,
      contactPerson: customer.contactPerson || '',
      contactPhone: customer.contactPhone || '',
      contactEmail: customer.contactEmail || '',
      address: customer.address || '',
      remarks: customer.remarks || '',
      salespersonId: customer.salespersonId || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: '确认删除',
      message: '确定要删除这个客户吗？此操作不可恢复！',
      type: 'danger',
      confirmText: '删除',
      cancelText: '取消',
    });

    if (!confirmed) return;

    try {
      await customerApi.delete(id);
      toast.success('删除成功');
      loadCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast.error('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        salespersonId: formData.salespersonId || undefined,
      };

      if (editingId) {
        await customerApi.update(editingId, data);
        toast.success('更新成功');
      } else {
        await customerApi.create(data);
        toast.success('创建成功');
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (error: any) {
      console.error('Failed to save customer:', error);
      toast.error(error.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">客户管理</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mt-2"></div>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          ➕ 添加客户
        </button>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="搜索客户（名称、联系人、手机、邮箱）..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <CustomSelect
            options={[
              { value: '', label: '全部类型' },
              { value: 'NEW', label: '新客户' },
              { value: 'OLD', label: '老客户' }
            ]}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value)}
            placeholder="选择客户类型"
          />
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">加载中...</div>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <div>暂无客户数据</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系电话</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">业务员</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.customerType === 'NEW' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {customer.customerType === 'NEW' ? '新客户' : '老客户'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.contactPerson || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.contactPhone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {customer.remarks || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.salesperson ? (
                        <span className="text-blue-600">{customer.salesperson.name}</span>
                      ) : (
                        <span className="text-gray-400">未分配</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(customer.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="编辑"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="删除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 添加/编辑模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? '编辑客户' : '添加客户'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    客户名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="请输入客户名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    客户类型 <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    options={[
                      { value: 'NEW', label: '新客户' },
                      { value: 'OLD', label: '老客户' }
                    ]}
                    value={formData.customerType}
                    onChange={(value) => setFormData({ ...formData, customerType: value as 'NEW' | 'OLD' })}
                    placeholder="选择客户类型"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系人
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="请输入联系人姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系电话
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="请输入联系电话"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系邮箱
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="请输入联系邮箱"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分配业务员
                  </label>
                  <CustomSelect
                    options={[
                      { value: '', label: '未分配' },
                      ...salespersons.map((sp) => ({
                        value: sp.id,
                        label: `${sp.name} (${sp.accountId})`
                      }))
                    ]}
                    value={formData.salespersonId}
                    onChange={(value) => setFormData({ ...formData, salespersonId: value })}
                    placeholder="选择业务员"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  地址
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="请输入详细地址"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="请输入备注信息"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
      />
    </div>
  );
}
