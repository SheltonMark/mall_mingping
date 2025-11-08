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
  Edit2,
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
  additionalAttributes?: any;
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

interface Component {
  code: string;
  name: string;
  spec: string;
  description?: string;
}

interface ColorPart {
  part: string;
  color: string;
  hexColor?: string; // 新增：16进制颜色值
}

interface ComponentColor {
  componentCode: string;
  colors: ColorPart[];
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

  // 组件管理状态
  const [components, setComponents] = useState<Component[]>([]);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);

  // 配色管理状态
  const [componentColors, setComponentColors] = useState<ComponentColor[]>([]);
  const [editingColor, setEditingColor] = useState<ComponentColor | null>(null);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

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

      // 解析组件数据
      if (data.productSpec) {
        try {
          const specs = typeof data.productSpec === 'string'
            ? JSON.parse(data.productSpec)
            : data.productSpec;
          setComponents(Array.isArray(specs) ? specs : []);
        } catch (e) {
          console.error('Failed to parse productSpec:', e);
          setComponents([]);
        }
      }

      // 解析配色数据
      if (data.additionalAttributes) {
        try {
          const attrs = typeof data.additionalAttributes === 'string'
            ? JSON.parse(data.additionalAttributes)
            : data.additionalAttributes;
          setComponentColors(Array.isArray(attrs) ? attrs : []);
        } catch (e) {
          console.error('Failed to parse additionalAttributes:', e);
          setComponentColors([]);
        }
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

  // 组件管理函数
  const handleAddComponent = () => {
    setEditingComponent({ code: '', name: '', spec: '', description: '' });
    setIsComponentModalOpen(true);
  };

  const handleEditComponent = (comp: Component) => {
    setEditingComponent({ ...comp });
    setIsComponentModalOpen(true);
  };

  const handleSaveComponent = () => {
    if (!editingComponent) return;

    if (!editingComponent.code.trim()) {
      toast.error('请输入组件编号');
      return;
    }

    if (!editingComponent.name.trim()) {
      toast.error('请输入组件名称');
      return;
    }

    const existingIndex = components.findIndex(c => c.code === editingComponent.code);

    if (existingIndex >= 0) {
      const newComponents = [...components];
      newComponents[existingIndex] = editingComponent;
      setComponents(newComponents);
    } else {
      setComponents([...components, editingComponent]);
    }

    setIsComponentModalOpen(false);
    setEditingComponent(null);
    toast.success('组件已保存');
  };

  const handleDeleteComponent = (code: string) => {
    if (confirm('确定要删除这个组件吗?')) {
      setComponents(components.filter(c => c.code !== code));
      setComponentColors(componentColors.filter(cc => cc.componentCode !== code));
      toast.success('组件已删除');
    }
  };

  // 配色管理函数
  const handleAddColor = () => {
    setEditingColor({ componentCode: '', colors: [] });
    setIsColorModalOpen(true);
  };

  const handleEditColor = (color: ComponentColor) => {
    setEditingColor({ ...color, colors: [...color.colors] });
    setIsColorModalOpen(true);
  };

  const handleSaveColor = () => {
    if (!editingColor) return;

    if (!editingColor.componentCode.trim()) {
      toast.error('请选择组件编号');
      return;
    }

    if (editingColor.colors.length === 0) {
      toast.error('请至少添加一个配色部件');
      return;
    }

    const existingIndex = componentColors.findIndex(cc => cc.componentCode === editingColor.componentCode);

    if (existingIndex >= 0) {
      const newColors = [...componentColors];
      newColors[existingIndex] = editingColor;
      setComponentColors(newColors);
    } else {
      setComponentColors([...componentColors, editingColor]);
    }

    setIsColorModalOpen(false);
    setEditingColor(null);
    toast.success('配色已保存');
  };

  const handleDeleteColor = (componentCode: string) => {
    if (confirm('确定要删除这个配色方案吗?')) {
      setComponentColors(componentColors.filter(cc => cc.componentCode !== componentCode));
      toast.success('配色方案已删除');
    }
  };

  const handleAddColorPart = () => {
    if (!editingColor) return;
    setEditingColor({
      ...editingColor,
      colors: [...editingColor.colors, { part: '', color: '', hexColor: '' }]
    });
  };

  const handleUpdateColorPart = (index: number, field: 'part' | 'color' | 'hexColor', value: string) => {
    if (!editingColor) return;
    const newColors = [...editingColor.colors];
    newColors[index][field] = value;
    setEditingColor({ ...editingColor, colors: newColors });
  };

  const handleDeleteColorPart = (index: number) => {
    if (!editingColor) return;
    const newColors = editingColor.colors.filter((_, i) => i !== index);
    setEditingColor({ ...editingColor, colors: newColors });
  };

  const handleSave = async () => {
    if (!sku) return;

    // 验证必填字段
    if (!sku.productCode || !sku.productCode.trim()) {
      toast.error('请输入品号');
      return;
    }

    if (!sku.productName || !sku.productName.trim()) {
      toast.error('请输入品名');
      return;
    }

    if (!sku.price || Number(sku.price) <= 0) {
      toast.error('请输入有效的价格');
      return;
    }

    setSaving(true);
    try {
      // 准备更新数据
      const updateData: any = {
        productCode: sku.productCode,
        productName: sku.productName,
        price: Number(sku.price),
        status: sku.status,
        images: images,
        specification: sku.specification || null,
        title: sku.title || null,
        subtitle: sku.subtitle || null,
        productSpec: components.length > 0 ? components : null,
        additionalAttributes: componentColors.length > 0 ? componentColors : null,
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

            {/* 组件管理 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">组件管理</h2>
                <button
                  onClick={handleAddComponent}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                >
                  <Plus size={16} />
                  添加组件
                </button>
              </div>

              {components.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无组件数据，点击"添加组件"开始添加
                </div>
              ) : (
                <div className="space-y-3">
                  {components.map((comp, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-blue-600">{comp.code}</span>
                            <span className="text-gray-700 font-medium">{comp.name}</span>
                          </div>
                          {comp.spec && (
                            <div className="text-sm text-gray-600 mb-1">
                              规格: {comp.spec}
                            </div>
                          )}
                          {comp.description && (
                            <div className="text-sm text-gray-500">
                              说明: {comp.description}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditComponent(comp)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteComponent(comp.code)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 配色管理 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">配色管理</h2>
                <button
                  onClick={handleAddColor}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium"
                >
                  <Plus size={16} />
                  添加配色
                </button>
              </div>

              {componentColors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无配色数据，点击"添加配色"开始添加
                </div>
              ) : (
                <div className="space-y-3">
                  {componentColors.map((compColor, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-green-600 mb-2">
                            组件 {compColor.componentCode}
                          </div>
                          <div className="space-y-1">
                            {compColor.colors && Array.isArray(compColor.colors) && compColor.colors.length > 0 ? (
                              compColor.colors.map((colorPart, partIndex) => (
                                <div key={partIndex} className="text-sm text-gray-700 flex items-center gap-2">
                                  {colorPart.hexColor && (
                                    <div
                                      className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                                      style={{ backgroundColor: colorPart.hexColor }}
                                      title={colorPart.hexColor}
                                    />
                                  )}
                                  <span className="font-medium">{colorPart.part}:</span>{' '}
                                  <span>{colorPart.color}</span>
                                  {colorPart.hexColor && (
                                    <span className="text-xs text-gray-400 font-mono">{colorPart.hexColor}</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-500">暂无配色数据</div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditColor(compColor)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteColor(compColor.componentCode)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：基本信息（可编辑） */}
          <div className="h-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col justify-between">
              <h2 className="text-lg font-bold text-gray-900">基本信息</h2>

              {/* 品号 (可编辑) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">品号 *</label>
                <input
                  type="text"
                  value={sku.productCode}
                  onChange={(e) => setSku({ ...sku, productCode: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                  placeholder="例如: MP001-001"
                />
              </div>

              {/* 品名 (可编辑) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">品名 *</label>
                <input
                  type="text"
                  value={sku.productName}
                  onChange={(e) => setSku({ ...sku, productName: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="例如: 多功能拖把"
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

      {/* 组件编辑模态框 */}
      {isComponentModalOpen && editingComponent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {components.find(c => c.code === editingComponent.code) ? '编辑组件' : '添加组件'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  组件编号 * <span className="text-xs text-gray-500">(如: A, B, C)</span>
                </label>
                <input
                  type="text"
                  value={editingComponent.code}
                  onChange={(e) => setEditingComponent({ ...editingComponent, code: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="A"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">组件名称 *</label>
                <input
                  type="text"
                  value={editingComponent.name}
                  onChange={(e) => setEditingComponent({ ...editingComponent, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 伸缩铁杆"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">规格参数 *</label>
                <input
                  type="text"
                  value={editingComponent.spec}
                  onChange={(e) => setEditingComponent({ ...editingComponent, spec: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: φ19/22*0.27mm*1200mm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  说明 <span className="text-xs text-gray-500">(选填)</span>
                </label>
                <input
                  type="text"
                  value={editingComponent.description || ''}
                  onChange={(e) => setEditingComponent({ ...editingComponent, description: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 意标螺纹"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setIsComponentModalOpen(false);
                  setEditingComponent(null);
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSaveComponent}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 配色编辑模态框 */}
      {isColorModalOpen && editingColor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {componentColors.find(cc => cc.componentCode === editingColor.componentCode) ? '编辑配色' : '添加配色'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">组件编号 *</label>
                <select
                  value={editingColor.componentCode}
                  onChange={(e) => setEditingColor({ ...editingColor, componentCode: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">请选择组件</option>
                  {components.map(comp => (
                    <option key={comp.code} value={comp.code}>
                      {comp.code} - {comp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">配色部件</label>
                  <button
                    onClick={handleAddColorPart}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium"
                  >
                    <Plus size={14} />
                    添加部件
                  </button>
                </div>

                {editingColor.colors.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    暂无配色部件，点击"添加部件"开始添加
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editingColor.colors.map((colorPart, index) => (
                      <div key={index} className="border-2 border-gray-200 rounded-lg p-3 space-y-2">
                        {/* 部件名 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">部件名称</label>
                          <input
                            type="text"
                            value={colorPart.part}
                            onChange={(e) => handleUpdateColorPart(index, 'part', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            placeholder="如: 喷塑、电镀、拉丝"
                          />
                        </div>

                        {/* 颜色名称 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">颜色名称</label>
                          <input
                            type="text"
                            value={colorPart.color}
                            onChange={(e) => handleUpdateColorPart(index, 'color', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            placeholder="如: 3C冷灰、磨砂黑"
                          />
                        </div>

                        {/* 16进制色号 + 颜色选择器 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">色号 (选填)</label>
                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={colorPart.hexColor || ''}
                                onChange={(e) => handleUpdateColorPart(index, 'hexColor', e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
                                placeholder="#3C3C3C"
                                maxLength={7}
                              />
                              {colorPart.hexColor && (
                                <div
                                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-gray-300"
                                  style={{ backgroundColor: colorPart.hexColor }}
                                />
                              )}
                            </div>
                            <input
                              type="color"
                              value={colorPart.hexColor || '#000000'}
                              onChange={(e) => handleUpdateColorPart(index, 'hexColor', e.target.value)}
                              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                              title="选择颜色"
                            />
                          </div>
                        </div>

                        {/* 常用色板 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">常用色</label>
                          <div className="grid grid-cols-8 gap-1">
                            {[
                              { name: '黑色', hex: '#000000' },
                              { name: '白色', hex: '#FFFFFF' },
                              { name: '冷灰', hex: '#3C3C3C' },
                              { name: '暖灰', hex: '#6B6B6B' },
                              { name: '银色', hex: '#C0C0C0' },
                              { name: '金色', hex: '#FFD700' },
                              { name: '红色', hex: '#E74C3C' },
                              { name: '蓝色', hex: '#3498DB' },
                            ].map((preset) => (
                              <button
                                key={preset.hex}
                                type="button"
                                onClick={() => {
                                  handleUpdateColorPart(index, 'hexColor', preset.hex);
                                  if (!colorPart.color) {
                                    handleUpdateColorPart(index, 'color', preset.name);
                                  }
                                }}
                                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-green-500 transition-all"
                                style={{ backgroundColor: preset.hex }}
                                title={preset.name}
                              />
                            ))}
                          </div>
                        </div>

                        {/* 删除按钮 */}
                        <button
                          type="button"
                          onClick={() => handleDeleteColorPart(index)}
                          className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <Trash2 size={14} />
                          删除此部件
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setIsColorModalOpen(false);
                  setEditingColor(null);
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSaveColor}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
