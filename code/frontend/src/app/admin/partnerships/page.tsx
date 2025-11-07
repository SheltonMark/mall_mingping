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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
    } catch (error) {
      console.error('Failed to load partnerships:', error);
      alert('加载合作申请失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (partnership: Partnership) => {
    setSelectedPartnership(partnership);
    setIsDetailModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">合作申请</h1>
        <p className="text-gray-600 mt-1">查看所有合作伙伴申请</p>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <input
          type="text"
          placeholder="搜索合作申请（公司名称、联系人、联系电话）..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公司名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系电话</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">团队规模</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(partnership.submittedAt || partnership.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetail(partnership)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        查看详情
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
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">公司地址</div>
                <div className="font-medium">{selectedPartnership.companyAddress || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">业务范围</div>
                <div className="font-medium whitespace-pre-wrap">{selectedPartnership.businessScope || '-'}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-600 mb-1">提交时间</div>
                  <div className="text-sm">{new Date(selectedPartnership.submittedAt || selectedPartnership.createdAt).toLocaleString('zh-CN')}</div>
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
    </div>
  );
}
