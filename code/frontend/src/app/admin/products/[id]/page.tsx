'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productApi, uploadApi, getServerUrl } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import {
  ArrowLeft,
  Upload,
  X,
  GripVertical,
  Image as ImageIcon,
  Video,
  Save,
  Trash2,
  Plus,
} from 'lucide-react';

interface ProductSku {
  id: string;
  productCode: string;
  productName: string;
  title?: string;        // 主标题
  subtitle?: string;     // 副标题
  brand?: string;
  specification?: string;
  productSpec?: any;
  additionalAttributes?: string;
  price?: string;
  images?: string;
  mainImage?: string;
  video?: string;
  status: string;
  group?: {
    id: string;
    prefix: string;
    groupNameZh: string;
    sharedVideo?: string;
  };
}

export default function EditSkuPage() {
  const router = useRouter();
  const params = useParams();
  const skuId = params.id as string;
  const toast = useToast();

  const [sku, setSku] = useState<ProductSku | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 图片管理状态
  const [images, setImages] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 视频上传（每个规格独立）
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');

  useEffect(() => {
    loadSku();
  }, [skuId]);

  const loadSku = async () => {
    try {
      setLoading(true);
      const data = await productApi.getSku(skuId);
      setSku(data);

      // 解析图片 - Prisma JSON 字段可能已经是数组或字符串
      if (data.images) {
        if (Array.isArray(data.images)) {
          // 已经是数组，直接使用
          setImages(data.images);
        } else if (typeof data.images === 'string') {
          // 是字符串，需要解析
          try {
            const parsedImages = JSON.parse(data.images);
            setImages(Array.isArray(parsedImages) ? parsedImages : []);
          } catch (e) {
            console.error('Failed to parse images:', e);
            setImages([]);
          }
        }
      } else {
        setImages([]);
      }

      // 解析视频 - Prisma JSON 字段可能已经是对象或字符串
      if (data.video) {
        if (typeof data.video === 'object' && data.video.url) {
          // 已经是对象，直接使用
          setVideoPreview(data.video.url);
        } else if (typeof data.video === 'string') {
          // 是字符串，需要解析
          try {
            const videoData = JSON.parse(data.video);
            if (videoData && videoData.url) {
              setVideoPreview(videoData.url);
            }
          } catch (e) {
            console.error('Failed to parse video:', e);
          }
        }
      } else {
        setVideoPreview('');
      }
    } catch (error: any) {
      console.error('Failed to load SKU:', error);
      toast.error('加载失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 限制5张图片
    if (images.length + files.length > 5) {
      toast.error('最多只能上传5张图片');
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        // 验证文件类型
        if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
          toast.error(`${file.name} 不是有效的图片格式`);
          continue;
        }

        // 验证文件大小
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} 文件大小超过5MB`);
          continue;
        }

        // 上传到服务器（使用带认证的API）
        const result = await uploadApi.uploadSingle(file, 'image');
        uploadedUrls.push(result.url);
      }

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(`成功上传 ${uploadedUrls.length} 张图片`);
      }
    } catch (error: any) {
      toast.error('上传失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    toast.success('图片已删除');
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.match(/^video\/(mp4|webm|ogg|quicktime)$/)) {
      toast.error('只支持 MP4、WebM、OGG、MOV 格式的视频');
      return;
    }

    // 验证文件大小 (限制50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('视频文件大小不能超过 50MB');
      return;
    }

    setVideoFile(file);

    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);

    toast.success('视频已选择，保存后上传');
  };

  const handleVideoDelete = () => {
    setVideoFile(null);
    setVideoPreview('');
    toast.success('视频已删除');
  };

  const handleSave = async () => {
    if (!sku) return;

    // 验证必填字段
    if (!sku.price || Number(sku.price) <= 0) {
      toast.error('请输入有效的价格');
      return;
    }

    setSaving(true);
    try {
      // 准备更新数据
      const updateData: any = {
        price: Number(sku.price),
        status: sku.status,
        images: images, // ✅ 直接传数组对象，后端要求 @IsObject()
        specification: sku.specification || null,
        title: sku.title || null,
        subtitle: sku.subtitle || null,
      };

      // 如果有新上传的视频文件，先上传视频（使用带认证的API）
      if (videoFile) {
        const videoResult = await uploadApi.uploadSingle(videoFile, 'video' as any);
        updateData.video = { url: videoResult.url, type: videoFile.type }; // ✅ 直接传对象
      } else if (videoPreview && !videoFile) {
        // 保留原有视频
        updateData.video = sku.video;
      } else {
        // 删除视频
        updateData.video = null;
      }

      // 调用API更新SKU
      await productApi.updateSku(sku.id, updateData);

      toast.success('保存成功');

      // 重新加载数据以确保前端显示最新内容
      await loadSku();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('保存失败: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ButtonLoader />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!sku) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">产品未找到</p>
          <button
            onClick={() => router.push('/admin/products')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/products')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">编辑规格</h1>
                <p className="text-sm text-gray-600 font-mono mt-1">{sku.productCode}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/products')}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <ButtonLoader />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    保存
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[65fr_35fr] gap-6">
          {/* 左侧：图片、视频、货品规格、颜色展示 */}
          <div className="space-y-6">
            {/* 图片管理 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">产品图片</h2>
                <span className="text-sm text-gray-600">{images.length}/5</span>
              </div>

              {/* 图片网格 */}
              <div className="grid grid-cols-5 gap-4 mb-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 cursor-move group hover:border-blue-500 transition-all"
                  >
                    <img
                      src={img.startsWith('http') ? img : `${getServerUrl()}${img}`}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <button
                        onClick={() => handleImageDelete(index)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-bold text-gray-700">
                      {index + 1}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={18} className="text-white drop-shadow-lg" />
                    </div>
                  </div>
                ))}

                {/* 上传按钮 */}
                {images.length < 5 && (
                  <label
                    className={`aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    {uploading ? (
                      <ButtonLoader />
                    ) : (
                      <>
                        <Plus size={24} className="text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 font-medium">添加图片</span>
                      </>
                    )}
                  </label>
                )}
              </div>

              <p className="text-xs text-gray-500">
                • 支持 JPG、PNG、GIF、WebP 格式<br />
                • 单个文件最大 5MB<br />
                • 拖拽图片可调整顺序
              </p>
            </div>

            {/* 视频管理 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">产品视频（选填）</h2>

              {!videoPreview ? (
                <label className="flex items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <Upload size={24} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold text-gray-700">点击上传视频</div>
                    <div className="text-xs text-gray-500 mt-1">支持 MP4、WebM、OGG、MOV，最大 50MB</div>
                  </div>
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                    <video
                      src={videoPreview.startsWith('http') || videoPreview.startsWith('blob:') ? videoPreview : `${getServerUrl()}${videoPreview}`}
                      className="w-full h-full object-contain"
                      controls
                    />
                    <button
                      onClick={handleVideoDelete}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  {videoFile && (
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <div className="font-semibold">文件名: {videoFile.name}</div>
                      <div className="text-xs mt-1">大小: {(videoFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 货品规格（只读） */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">货品规格</h2>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Excel导入 · 只读</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {(() => {
                  if (!sku.productSpec) {
                    return (
                      <div className="text-sm text-gray-500 text-center py-2">
                        暂无货品规格数据，请从Excel导入产品规格
                      </div>
                    );
                  }

                  try {
                    const specs = typeof sku.productSpec === 'string'
                      ? JSON.parse(sku.productSpec)
                      : sku.productSpec;

                    if (!Array.isArray(specs) || specs.length === 0) {
                      return (
                        <div className="text-sm text-gray-500 text-center py-2">
                          暂无货品规格数据
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2 text-sm text-gray-700 leading-relaxed text-center">
                        {specs.map((part: any, index: number) => (
                          <div key={index}>
                            <span className="font-semibold">{part.code || 'A'}</span>
                            {part.name && `: ${part.name}`}
                            {part.spec && ` ${part.spec}`}
                          </div>
                        ))}
                      </div>
                    );
                  } catch (e) {
                    return (
                      <div className="text-sm text-gray-500 text-center py-2">
                        无法解析产品规格数据
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

            {/* 颜色方案（只读） */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">附加属性（颜色）</h2>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Excel导入 · 只读</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {(() => {
                  if (!sku.additionalAttributes) {
                    return (
                      <div className="text-sm text-gray-500 text-center py-2">
                        暂无颜色方案数据，请从Excel导入附加属性
                      </div>
                    );
                  }

                  try {
                    const attrs = typeof sku.additionalAttributes === 'string'
                      ? JSON.parse(sku.additionalAttributes)
                      : sku.additionalAttributes;

                    if (!Array.isArray(attrs) || attrs.length === 0) {
                      // 如果是字符串，直接显示
                      const rawText = typeof sku.additionalAttributes === 'string'
                        ? sku.additionalAttributes
                        : '';

                      if (!rawText) {
                        return (
                          <div className="text-sm text-gray-500 text-center py-2">
                            暂无颜色方案数据
                          </div>
                        );
                      }

                      return (
                        <div className="text-sm text-gray-700 leading-relaxed text-center whitespace-pre-wrap">
                          {rawText}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {attrs.map((component: any, index: number) => (
                          <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                            <div className="font-semibold text-gray-800 mb-2">
                              组件 {component.componentCode}
                            </div>
                            {component.colorOptions && Array.isArray(component.colorOptions) ? (
                              <div className="space-y-1 pl-4">
                                {component.colorOptions.map((option: any, optionIndex: number) => (
                                  <div key={optionIndex} className="text-sm text-gray-600">
                                    方案{optionIndex + 1}: {option.colors && option.colors.map((colorPart: any) =>
                                      `${colorPart.part}:${colorPart.color}`
                                    ).join(' + ')}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">暂无颜色方案</div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  } catch (e) {
                    // 如果是字符串，直接显示
                    const rawText = typeof sku.additionalAttributes === 'string'
                      ? sku.additionalAttributes
                      : '';

                    if (!rawText) {
                      return (
                        <div className="text-sm text-gray-500 text-center py-2">
                          无法解析颜色方案数据
                        </div>
                      );
                    }

                    return (
                      <div className="text-sm text-gray-700 leading-relaxed text-center whitespace-pre-wrap">
                        {rawText}
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>

          {/* 右侧：基本信息（可编辑） */}
          <div className="h-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col justify-between">
              <h2 className="text-lg font-bold text-gray-900">基本信息</h2>

              {/* 品号 (只读) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">品号</label>
                <input
                  type="text"
                  value={sku.productCode}
                  disabled
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-mono cursor-not-allowed"
                />
              </div>

              {/* 品名 (只读) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">品名</label>
                <input
                  type="text"
                  value={sku.productName}
                  disabled
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* 规格标题（可编辑） */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  规格标题
                  <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    规格选择器显示
                  </span>
                </label>
                <input
                  type="text"
                  value={sku.title || ''}
                  onChange={(e) => setSku({ ...sku, title: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={sku.productName}
                />
                <p className="text-xs text-gray-500 mt-1">
                  留空则使用"品名"显示，建议填写简短易懂的标题
                </p>
              </div>

              {/* 规格副标题（可编辑） */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  规格副标题
                  <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    可选
                  </span>
                </label>
                <input
                  type="text"
                  value={sku.subtitle || ''}
                  onChange={(e) => setSku({ ...sku, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="例如：六件全能清洁套装"
                />
                <p className="text-xs text-gray-500 mt-1">
                  显示在规格标题下方，用于补充说明
                </p>
              </div>

              {/* 产品参数（用于前端展示） */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  产品参数
                  <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    前端展示
                  </span>
                </label>
                <textarea
                  value={sku.specification || ''}
                  onChange={(e) => setSku({ ...sku, specification: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="例如：φ22*1200mm（客户在前端看到的简洁规格说明）"
                />
                <p className="text-xs text-gray-500 mt-1">
                  此参数将在产品详情页的"产品参数"视图中向客户展示
                </p>
              </div>

              {/* 价格 */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">价格 (¥) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sku.price || ''}
                  onChange={(e) => setSku({ ...sku, price: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* 状态 */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">状态</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSku({ ...sku, status: 'ACTIVE' })}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                      sku.status === 'ACTIVE'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    ✓ 上架
                  </button>
                  <button
                    onClick={() => setSku({ ...sku, status: 'INACTIVE' })}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                      sku.status === 'INACTIVE'
                        ? 'bg-gray-50 border-gray-500 text-gray-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    ✕ 下架
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
