'use client';

import { useEffect, useState } from 'react';
import { Edit2, Trash2, RefreshCw, Building2, Globe, X, Search as SearchIcon } from 'lucide-react';
import { customerApi, salespersonApi, erpApi } from '@/lib/adminApi';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useToast } from '@/components/common/ToastContainer';
import CustomSelect from '@/components/common/CustomSelect';
import PageHeader from '@/components/admin/PageHeader';
import { ButtonLoader } from '@/components/common/Loader';

// 网站客户类型
interface Customer {
  id: string;
  name: string;
  customerType: 'NEW' | 'OLD';
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  country?: string;
  remarks?: string;
  salespersonId?: string;
  salesperson?: {
    id: string;
    chineseName?: string;
    accountId: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ERP客户类型
interface ErpCustomer {
  id: string;
  cusNo: string;
  name: string;
  shortName?: string;
  country?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  salespersonNo?: string;
  salespersonId?: string;
  salesperson?: {
    id: string;
    accountId: string;
    chineseName?: string;
  };
  erpSyncAt: string;
  createdAt: string;
}

interface Salesperson {
  id: string;
  accountId: string;
  chineseName?: string;
}

type TabType = 'erp' | 'website';

export default function CustomersPage() {
  // Tab状态
  const [activeTab, setActiveTab] = useState<TabType>('erp');

  // 网站客户状态
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
    phone: '',
    email: '',
    address: '',
    country: '',
    remarks: '',
    salespersonId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // ERP客户状态
  const [erpCustomers, setErpCustomers] = useState<ErpCustomer[]>([]);
  const [erpLoading, setErpLoading] = useState(true);
  const [erpSearchTerm, setErpSearchTerm] = useState('');
  const [erpSalespersonFilter, setErpSalespersonFilter] = useState('');
  const [erpPage, setErpPage] = useState(1);
  const [erpTotalPages, setErpTotalPages] = useState(1);
  const [erpTotal, setErpTotal] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // ERP 客户预览同步状态
  const [showSyncPreview, setShowSyncPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    success: boolean;
    customers: Array<{
      cusNo: string;
      name: string;
      shortName: string | null;
      salespersonNo: string | null;
      isNew: boolean;
    }>;
    total: number;
    newCount: number;
    updateCount: number;
    error?: string;
  } | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [previewSearchTerm, setPreviewSearchTerm] = useState('');

  const { confirm, isOpen, options, handleConfirm, handleClose } = useConfirm();
  const toast = useToast();

  // 加载业务员列表（两个Tab共用）
  useEffect(() => {
    loadSalespersons();
  }, []);

  // 根据当前Tab加载对应数据
  useEffect(() => {
    if (activeTab === 'website') {
      loadCustomers();
    } else {
      loadErpCustomers();
      loadLastSyncTime();
    }
  }, [activeTab, searchTerm, typeFilter, erpSearchTerm, erpSalespersonFilter, erpPage]);

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

  const loadErpCustomers = async () => {
    try {
      setErpLoading(true);
      const response = await erpApi.getErpCustomers({
        search: erpSearchTerm || undefined,
        salespersonId: erpSalespersonFilter || undefined,
        page: erpPage,
        limit: 20,
      });
      setErpCustomers(response.data || []);
      setErpTotalPages(response.meta?.totalPages || 1);
      setErpTotal(response.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load ERP customers:', error);
      toast.error('加载ERP客户列表失败');
    } finally {
      setErpLoading(false);
    }
  };

  const loadLastSyncTime = async () => {
    try {
      const response = await erpApi.getErpCustomerLastSyncTime();
      setLastSyncTime(response.lastSyncTimeFormatted || '从未同步');
    } catch (error) {
      console.error('Failed to load last sync time:', error);
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

  // 同步ERP客户 - 打开预览弹窗
  const handleSyncErpCustomers = async () => {
    setShowSyncPreview(true);
    setPreviewLoading(true);
    setSelectedCustomers(new Set());
    setPreviewSearchTerm('');

    try {
      const result = await erpApi.previewErpCustomers();
      setPreviewData(result);

      if (!result.success) {
        toast.error(`加载预览失败: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`加载预览失败: ${error.message || '未知错误'}`);
      setPreviewData(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // 切换客户选择
  const toggleCustomerSelection = (cusNo: string) => {
    setSelectedCustomers(prev => {
      const next = new Set(prev);
      if (next.has(cusNo)) {
        next.delete(cusNo);
      } else {
        next.add(cusNo);
      }
      return next;
    });
  };

  // 全选/取消全选客户
  const toggleAllCustomers = () => {
    if (!previewData) return;

    const filteredCustomers = previewData.customers.filter(c =>
      !previewSearchTerm ||
      c.cusNo.toLowerCase().includes(previewSearchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(previewSearchTerm.toLowerCase()) ||
      (c.shortName && c.shortName.toLowerCase().includes(previewSearchTerm.toLowerCase()))
    );

    if (selectedCustomers.size === filteredCustomers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(filteredCustomers.map(c => c.cusNo)));
    }
  };

  // 执行选择性同步
  const handleSyncSelected = async () => {
    const cusNosArray = Array.from(selectedCustomers);

    if (cusNosArray.length === 0) {
      toast.warning('请至少选择一个客户');
      return;
    }

    setSyncing(true);
    try {
      const result = await erpApi.syncSelectedErpCustomers(cusNosArray);

      setShowSyncPreview(false);

      if (result.success) {
        toast.success(`同步成功！新增 ${result.created} 个，更新 ${result.updated} 个，共 ${result.total} 个客户`);
        loadErpCustomers();
        loadLastSyncTime();
      } else {
        toast.error(`同步失败: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`同步失败: ${error.message || '未知错误'}`);
    } finally {
      setSyncing(false);
    }
  };

  // 过滤预览列表
  const filteredPreviewCustomers = previewData?.customers.filter(c =>
    !previewSearchTerm ||
    c.cusNo.toLowerCase().includes(previewSearchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(previewSearchTerm.toLowerCase()) ||
    (c.shortName && c.shortName.toLowerCase().includes(previewSearchTerm.toLowerCase()))
  ) || [];

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      customerType: 'NEW',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      country: '',
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
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      country: customer.country || '',
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

  // Tab切换组件
  const TabButton = ({ tab, icon: Icon, label }: { tab: TabType; icon: any; label: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        // 切换时重置分页
        if (tab === 'erp') {
          setErpPage(1);
        }
      }}
      className={`flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2 ${
        activeTab === tab
          ? 'text-green-600 border-green-600 bg-green-50'
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div>
      <PageHeader
        title="客户管理"
        actions={
          activeTab === 'erp' ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                上次同步: {lastSyncTime}
              </span>
              <button
                onClick={handleSyncErpCustomers}
                disabled={syncing}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                {syncing ? '同步中...' : '同步ERP客户'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              + 添加客户
            </button>
          )
        }
      />

      {/* Tab导航 */}
      <div className="bg-white rounded-t-lg border border-b-0 border-gray-200 flex">
        <TabButton tab="erp" icon={Building2} label={`ERP客户 (${erpTotal})`} />
        <TabButton tab="website" icon={Globe} label="网站客户" />
      </div>

      {/* ERP客户Tab内容 */}
      {activeTab === 'erp' && (
        <>
          {/* 搜索和筛选栏 */}
          <div className="bg-white border-x border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="搜索客户（编号、名称、简称）..."
                value={erpSearchTerm}
                onChange={(e) => {
                  setErpSearchTerm(e.target.value);
                  setErpPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <CustomSelect
                options={[
                  { value: '', label: '全部业务员' },
                  ...salespersons.map((sp) => ({
                    value: sp.id,
                    label: `${sp.chineseName || sp.accountId} (${sp.accountId})`
                  }))
                ]}
                value={erpSalespersonFilter}
                onChange={(value) => {
                  setErpSalespersonFilter(value);
                  setErpPage(1);
                }}
                placeholder="选择业务员"
              />
            </div>
          </div>

          {/* ERP客户表格 */}
          <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 overflow-hidden">
            {erpLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">加载中...</div>
              </div>
            ) : erpCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Building2 size={48} className="mb-2 text-gray-300" />
                <div>暂无ERP客户数据</div>
                <div className="text-sm mt-1">点击"同步ERP客户"从ERP系统获取客户数据</div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户编号</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户名称</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">简称</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系人</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电话</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">业务员</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">同步时间</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {erpCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-blue-600">
                            {customer.cusNo}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate" title={customer.name}>
                            {customer.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {customer.shortName || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {customer.contactPerson || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {customer.phone || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {customer.email || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {customer.salesperson ? (
                              <span className="text-green-600">{customer.salesperson.chineseName || customer.salesperson.accountId}</span>
                            ) : customer.salespersonNo ? (
                              <span className="text-orange-500" title="业务员未同步">{customer.salespersonNo}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(customer.erpSyncAt).toLocaleString('zh-CN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                {erpTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-500">
                      共 {erpTotal} 条记录，第 {erpPage}/{erpTotalPages} 页
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setErpPage(p => Math.max(1, p - 1))}
                        disabled={erpPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setErpPage(p => Math.min(erpTotalPages, p + 1))}
                        disabled={erpPage === erpTotalPages}
                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* 网站客户Tab内容 */}
      {activeTab === 'website' && (
        <>
          {/* 搜索和筛选栏 */}
          <div className="bg-white border-x border-gray-200 p-4">
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

          {/* 网站客户表格 */}
          <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">加载中...</div>
              </div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Globe size={48} className="mb-2 text-gray-300" />
                <div>暂无网站客户数据</div>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
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
                          {customer.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {customer.email || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {customer.remarks || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {customer.salesperson ? (
                            <span className="text-blue-600">{customer.salesperson.chineseName || customer.salesperson.accountId}</span>
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
        </>
      )}

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
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="请输入联系电话"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系邮箱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="请输入联系邮箱"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分配业务员 <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    options={salespersons.map((sp) => ({
                      value: sp.id,
                      label: `${sp.chineseName || sp.accountId} (${sp.accountId})`
                    }))}
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

      {/* ERP 客户同步预览弹窗 */}
      {showSyncPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* 弹窗头部 */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">ERP客户同步预览</h2>
                  <p className="text-blue-100 mt-1">选择要导入的客户</p>
                </div>
                <button
                  onClick={() => setShowSyncPreview(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <ButtonLoader />
                    <p className="mt-4 text-gray-600">正在从ERP加载客户数据...</p>
                  </div>
                </div>
              ) : !previewData || !previewData.success ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">❌</div>
                  <p className="text-gray-600">{previewData?.error || '加载预览数据失败'}</p>
                </div>
              ) : previewData.customers.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-600">暂无待同步的客户</p>
                </div>
              ) : (
                <>
                  {/* 统计信息和搜索栏 */}
                  <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="text-sm text-gray-600">
                        共 <span className="font-semibold text-gray-900">{previewData.total}</span> 个客户
                      </div>
                      <div className="text-sm flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">新增 {previewData.newCount}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">更新 {previewData.updateCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:flex-initial md:w-64">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={previewSearchTerm}
                          onChange={(e) => setPreviewSearchTerm(e.target.value)}
                          placeholder="搜索客户..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        已选 {selectedCustomers.size}
                      </span>
                      <button
                        onClick={toggleAllCustomers}
                        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition whitespace-nowrap"
                      >
                        {selectedCustomers.size === filteredPreviewCustomers.length ? '取消全选' : '全选'}
                      </button>
                    </div>
                  </div>

                  {/* 客户列表 */}
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {filteredPreviewCustomers.map((customer) => {
                      const isSelected = selectedCustomers.has(customer.cusNo);
                      return (
                        <label
                          key={customer.cusNo}
                          className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition border-2 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCustomerSelection(customer.cusNo)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                {customer.cusNo}
                              </span>
                              {customer.isNew && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                  新客户
                                </span>
                              )}
                              {customer.salespersonNo && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                                  业务员: {customer.salespersonNo}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900 mt-1 truncate">
                              {customer.name}
                            </div>
                            {customer.shortName && (
                              <div className="text-xs text-gray-500 truncate">
                                简称: {customer.shortName}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* 弹窗底部 */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedCustomers.size > 0 && (
                  <span>
                    将同步 <span className="font-semibold text-blue-700">{selectedCustomers.size}</span> 个客户
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSyncPreview(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleSyncSelected}
                  disabled={syncing || selectedCustomers.size === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? '同步中...' : '开始同步'}
                </button>
              </div>
            </div>
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
