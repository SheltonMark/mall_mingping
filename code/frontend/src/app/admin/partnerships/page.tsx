'use client';

import { useEffect, useState } from 'react';
import { partnershipApi } from '@/lib/adminApi';

interface Partnership {
  id: string;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  companyAddress?: string;
  businessScope?: string;
  annualRevenue?: string;
  teamSize?: string;
  website?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason?: string;
  submittedAt: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const statusLabels = {
  PENDING: { label: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: '已通过', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
};

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [statistics, setStatistics] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processAction, setProcessAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPartnerships();
    loadStatistics();
  }, [statusFilter]);

  const loadPartnerships = async () => {
    try {
      setLoading(true);
      const response = await partnershipApi.getAll({
        status: statusFilter || undefined,
      });
      setPartnerships(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Failed to load partnerships:', error);
      alert('加载合作申请失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await partnershipApi.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleViewDetail = (partnership: Partnership) => {
    setSelectedPartnership(partnership);
    setIsDetailModalOpen(true);
  };

  const handleOpenProcess = (partnership: Partnership, action: 'APPROVED' | 'REJECTED') => {
    setSelectedPartnership(partnership);
    setProcessAction(action);
    setRejectReason('');
    setIsProcessModalOpen(true);
  };

  const handleProcess = async () => {
    if (!selectedPartnership) return;
    if (processAction === 'REJECTED' && !rejectReason.trim()) {
      alert('请填写拒绝原因');
      return;
    }

    setSubmitting(true);
    try {
      await partnershipApi.update(selectedPartnership.id, {
        status: processAction,
        rejectReason: processAction === 'REJECTED' ? rejectReason : undefined,
      });
      alert(processAction === 'APPROVED' ? '已通过申请' : '已拒绝申请');
      setIsProcessModalOpen(false);
      loadPartnerships();
      loadStatistics();
    } catch (error: any) {
      console.error('Failed to process partnership:', error);
      alert(error.message || '处理失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条合作申请吗？')) return;
    try {
      await partnershipApi.delete(id);
      alert('删除成功');
      loadPartnerships();
      loadStatistics();
    } catch (error) {
      console.error('Failed to delete partnership:', error);
      alert('删除失败');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">合作申请管理</h1>
        <p className="text-gray-600 mt-1">管理所有合作伙伴申请</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">总申请数</div>
          <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-4">
          <div className="text-sm text-yellow-700 mb-1">待审核</div>
          <div className="text-2xl font-bold text-yellow-700">{statistics.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
          <div className="text-sm text-green-700 mb-1">已通过</div>
          <div className="text-2xl font-bold text-green-700">{statistics.approved}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
          <div className="text-sm text-red-700 mb-1">已拒绝</div>
          <div className="text-2xl font-bold text-red-700">{statistics.rejected}</div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">全部状态</option>
          {Object.entries(statusLabels).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公司名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系电话</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">团队规模</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {partnerships.map((partnership) => (
                  <tr key={partnership.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {partnership.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {partnership.contactPerson}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {partnership.contactPhone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {partnership.teamSize || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusLabels[partnership.status]?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {statusLabels[partnership.status]?.label || partnership.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(partnership.submittedAt || partnership.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetail(partnership)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        详情
                      </button>
                      {partnership.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleOpenProcess(partnership, 'APPROVED')}
                            className="text-green-600 hover:text-green-800"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => handleOpenProcess(partnership, 'REJECTED')}
                            className="text-red-600 hover:text-red-800"
                          >
                            拒绝
                          </button>
                        </>
                      )}
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
                  <div className="text-sm text-gray-600 mb-1">公司名称</div>
                  <div className="font-medium">{selectedPartnership.companyName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">联系人</div>
                  <div className="font-medium">{selectedPartnership.contactPerson}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">联系电话</div>
                  <div className="font-medium">{selectedPartnership.contactPhone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">联系邮箱</div>
                  <div className="font-medium">{selectedPartnership.contactEmail || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">团队规模</div>
                  <div className="font-medium">{selectedPartnership.teamSize || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">年营业额</div>
                  <div className="font-medium">{selectedPartnership.annualRevenue || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">网站</div>
                  <div className="font-medium">{selectedPartnership.website || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">状态</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusLabels[selectedPartnership.status]?.color
                  }`}>
                    {statusLabels[selectedPartnership.status]?.label}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">公司地址</div>
                <div className="font-medium">{selectedPartnership.companyAddress || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">业务范围</div>
                <div className="font-medium whitespace-pre-wrap">{selectedPartnership.businessScope || '-'}</div>
              </div>
              {selectedPartnership.status === 'REJECTED' && selectedPartnership.rejectReason && (
                <div>
                  <div className="text-sm text-red-600 mb-1">拒绝原因</div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    {selectedPartnership.rejectReason}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-600 mb-1">提交时间</div>
                  <div className="text-sm">{new Date(selectedPartnership.submittedAt || selectedPartnership.createdAt).toLocaleString('zh-CN')}</div>
                </div>
                {selectedPartnership.processedAt && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">处理时间</div>
                    <div className="text-sm">{new Date(selectedPartnership.processedAt).toLocaleString('zh-CN')}</div>
                  </div>
                )}
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

      {/* 处理模态框 */}
      {isProcessModalOpen && selectedPartnership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {processAction === 'APPROVED' ? '通过申请' : '拒绝申请'}
            </h2>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">公司名称</div>
              <div className="font-medium">{selectedPartnership.companyName}</div>
            </div>
            {processAction === 'REJECTED' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  拒绝原因 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="请输入拒绝原因..."
                  required
                />
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsProcessModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleProcess}
                disabled={submitting}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  processAction === 'APPROVED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submitting ? '处理中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
