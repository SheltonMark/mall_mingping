'use client';

import { useEffect, useState } from 'react';
import { partnershipApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmModal from '@/components/common/ConfirmModal';
import PageHeader from '@/components/admin/PageHeader';
import CustomSelect from '@/components/common/CustomSelect';

interface Partnership {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'PENDING' | 'CONTACTED' | 'PARTNERED' | 'REJECTED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusLabels = {
  PENDING: { label: '待处理', color: 'bg-yellow-100 text-yellow-800' },
  CONTACTED: { label: '已联系', color: 'bg-blue-100 text-blue-800' },
  PARTNERED: { label: '已合作', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
};

export default function PartnershipsPage() {
  const toast = useToast();
  const { confirm, isOpen, options, handleConfirm, handleClose } = useConfirm();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    loadPartnerships();
  }, [searchTerm]);

  const loadPartnerships = async () => {
    try {
      setLoading(true);
      const response = await partnershipApi.getAll({
        search: searchTerm || undefined,
      });
      setPartnerships(Array.isArray(response) ? response : response.data || []);
    } catch (error: any) {
      console.error('Failed to load partnerships:', error);
      toast.error(error.message || '加载合作申请失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (partnership: Partnership) => {
    setSelectedPartnership(partnership);
    setIsDetailModalOpen(true);
  };

  const handleOpenStatusModal = (partnership: Partnership) => {
    setSelectedPartnership(partnership);
    setNewStatus(partnership.status);
    setStatusNotes(partnership.notes || '');
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedPartnership) return;

    try {
      await partnershipApi.update(selectedPartnership.id, {
        status: newStatus as any,
        notes: statusNotes || undefined,
      });
      toast.success('状态更新成功');
      setIsStatusModalOpen(false);
      loadPartnerships();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.message || '状态更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: '确认删除',
      message: '确定要删除这个合作申请吗？此操作不可撤销。',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      await partnershipApi.delete(id);
      toast.success('删除成功');
      loadPartnerships();
    } catch (error: any) {
      console.error('Failed to delete partnership:', error);
      toast.error(error.message || '删除失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        title="合作申请"
        subtitle="查看所有合作伙伴申请"
      />

      {/* 搜索栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          placeholder="搜索合作申请（姓名、公司、邮箱）..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">加载中...</div>
          </div>
        ) : partnerships.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <div>暂无合作申请</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公司</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系方式</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {partnerships.map((partnership) => (
                  <tr key={partnership.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {partnership.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {partnership.company || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>{partnership.email}</div>
                      {partnership.phone && (
                        <div className="text-xs text-gray-500">{partnership.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusLabels[partnership.status]?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {statusLabels[partnership.status]?.label || partnership.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(partnership.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetail(partnership)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => handleOpenStatusModal(partnership)}
                        className="text-green-600 hover:text-green-800"
                      >
                        处理
                      </button>
                      <button
                        onClick={() => handleDelete(partnership.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 详情模态框 */}
      {isDetailModalOpen && selectedPartnership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">合作申请详情</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">姓名</div>
                  <div className="font-medium">{selectedPartnership.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">公司</div>
                  <div className="font-medium">{selectedPartnership.company || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">邮箱</div>
                  <div className="font-medium">{selectedPartnership.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">电话</div>
                  <div className="font-medium">{selectedPartnership.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">状态</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusLabels[selectedPartnership.status]?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {statusLabels[selectedPartnership.status]?.label || selectedPartnership.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">留言</div>
                <div className="font-medium whitespace-pre-wrap">{selectedPartnership.message || '-'}</div>
              </div>
              {selectedPartnership.notes && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">处理备注</div>
                  <div className="font-medium whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedPartnership.notes}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-600 mb-1">提交时间</div>
                  <div className="text-sm">{new Date(selectedPartnership.createdAt).toLocaleString('zh-CN')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">更新时间</div>
                  <div className="text-sm">{new Date(selectedPartnership.updatedAt).toLocaleString('zh-CN')}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 状态更新模态框 */}
      {isStatusModalOpen && selectedPartnership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">处理合作申请</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">申请人</div>
                <div className="font-medium">{selectedPartnership.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  更新状态
                </label>
                <CustomSelect
                  options={[
                    { value: 'PENDING', label: '待处理' },
                    { value: 'CONTACTED', label: '已联系' },
                    { value: 'PARTNERED', label: '已合作' },
                    { value: 'REJECTED', label: '已拒绝' }
                  ]}
                  value={newStatus}
                  onChange={(value) => setNewStatus(value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注（可选）
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="添加处理备注..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
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
