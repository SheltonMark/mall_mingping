'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productApi, uploadApi, getServerUrl, componentApi } from '@/lib/adminApi';
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
  Copy,
} from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmModal from '@/components/common/ConfirmModal';
import CustomSelect from '@/components/common/CustomSelect';

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
  name_en?: string;   // 组件英文名称
  spec?: string;      // 规格描述(可选)
  parts: string[];    // 部件列表(必须至少1个),如["喷塑", "塑件"]
}

interface ColorPart {
  part: string;       // 部件名称
  part_en?: string;   // 部件英文名称
  color: string;      // 颜色描述
  hexColor: string;   // 十六进制颜色
}

interface ColorScheme {
  id: string;
  name: string;
  name_en?: string;   // 方案英文名称
  colors: ColorPart[];
}

interface ComponentColor {
  componentCode: string;  // 对应Component的code
  colorSchemes: ColorScheme[]; // 改为多方案
}

export default function EditSkuPage() {
  const router = useRouter();
  const params = useParams();
  const skuId = params.id as string;
  const toast = useToast();
  const { confirm, isOpen, options, handleConfirm, handleClose } = useConfirm();

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
  const [editingScheme, setEditingScheme] = useState<ColorScheme | null>(null);
  const [editingSchemeComponentCode, setEditingSchemeComponentCode] = useState<string>('');
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [currentPartIndex, setCurrentPartIndex] = useState(0); // 当前配置的部件索引（渐进式）

  // 可选组件列表（从组件配置管理表中加载）
  const [availableComponents, setAvailableComponents] = useState<any[]>([]);

  useEffect(() => {
    loadSku();
    loadAvailableComponents();
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

          // 确保每个组件都有parts字段，如果没有则初始化为空数组
          const normalizedSpecs = Array.isArray(specs)
            ? specs.map(spec => ({
                ...spec,
                parts: spec.parts || []
              }))
            : [];

          setComponents(normalizedSpecs);
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

          if (Array.isArray(attrs)) {
            // 处理旧格式转换（只有colors字段）到新格式（colorSchemes）
            const normalizedColors = attrs.map(attr => {
              // 如果已经是新格式(有colorSchemes字段)
              if (attr.colorSchemes && Array.isArray(attr.colorSchemes)) {
                return attr;
              }

              // 如果是旧格式(只有colors字段)，转换为新格式
              if (attr.colors && Array.isArray(attr.colors) && attr.colors.length > 0) {
                return {
                  componentCode: attr.componentCode,
                  colorSchemes: [{
                    id: `scheme-${Date.now()}-1`,
                    name: '方案1',
                    colors: attr.colors
                  }]
                };
              }

              // 其他情况返回空方案列表
              return {
                componentCode: attr.componentCode,
                colorSchemes: []
              };
            });

            setComponentColors(normalizedColors);
          } else {
            setComponentColors([]);
          }
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

  const loadAvailableComponents = async () => {
    try {
      const response = await componentApi.getAll({ isActive: true });
      const componentsList = Array.isArray(response) ? response : response.data || [];
      setAvailableComponents(componentsList);
    } catch (error: any) {
      console.error('Failed to load components:', error);
      // 不显示错误提示，静默失败
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
    setEditingComponent({ code: '', name: '', spec: '', parts: [] });
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

    if (!editingComponent.parts || editingComponent.parts.length === 0) {
      toast.error('请至少添加一个部件');
      return;
    }

    // 过滤掉空的部件名
    const validParts = editingComponent.parts.filter(p => p.trim());
    if (validParts.length === 0) {
      toast.error('请至少添加一个有效的部件');
      return;
    }

    const componentToSave = { ...editingComponent, parts: validParts };
    const existingIndex = components.findIndex(c => c.code === editingComponent.code);

    if (existingIndex >= 0) {
      const newComponents = [...components];
      newComponents[existingIndex] = componentToSave;
      setComponents(newComponents);
    } else {
      setComponents([...components, componentToSave]);
    }

    setIsComponentModalOpen(false);
    setEditingComponent(null);
    toast.success('组件已保存');
  };

  const handleDeleteComponent = async (code: string) => {
    const confirmed = await confirm({
      title: '确认删除',
      message: '确定要删除这个组件吗?',
      type: 'danger',
    });
    if (!confirmed) return;

    setComponents(components.filter(c => c.code !== code));
    setComponentColors(componentColors.filter(cc => cc.componentCode !== code));
    toast.success('组件已删除');
  };

  // 配色管理函数
  const handleAddColorScheme = (componentCode: string) => {
    const component = components.find(c => c.code === componentCode);
    if (!component) {
      toast.error('组件不存在');
      return;
    }

    // 获取当前组件的配色数据
    const componentColor = componentColors.find(cc => cc.componentCode === componentCode);
    const existingSchemeCount = componentColor?.colorSchemes?.length || 0;

    // 根据组件的parts创建初始颜色配置
    const initialColors: ColorPart[] = component.parts.map(part => ({
      part,
      color: '',
      hexColor: '#000000'
    }));

    setEditingScheme({
      id: `scheme-${Date.now()}`,
      name: `方案${existingSchemeCount + 1}`,
      colors: initialColors
    });
    setEditingSchemeComponentCode(componentCode);
    setCurrentPartIndex(0); // 重置为第一个部件
    setIsColorModalOpen(true);
  };

  const handleEditColorScheme = (componentCode: string, scheme: ColorScheme) => {
    // 获取组件信息
    const component = components.find(c => c.code === componentCode);
    if (!component) {
      toast.error('组件不存在');
      return;
    }

    // 按照组件parts的顺序重新构建颜色数组,确保所有部件都有配置
    const existingColorsMap = new Map(scheme.colors.map(c => [c.part, c]));
    const allColors: ColorPart[] = component.parts.map(part => {
      // 如果该部件已有颜色配置,使用现有的;否则创建默认配置
      return existingColorsMap.get(part) || {
        part,
        color: '',
        hexColor: '#000000'
      };
    });

    setEditingScheme({
      ...scheme,
      colors: allColors
    });
    setEditingSchemeComponentCode(componentCode);
    setCurrentPartIndex(0); // 重置为第一个部件
    setIsColorModalOpen(true);
  };

  // 渐进式导航：下一个部件
  const handleNextPart = () => {
    if (!editingScheme) return;
    if (currentPartIndex < editingScheme.colors.length - 1) {
      setCurrentPartIndex(currentPartIndex + 1);
    }
  };

  // 渐进式导航：上一个部件
  const handlePrevPart = () => {
    if (currentPartIndex > 0) {
      setCurrentPartIndex(currentPartIndex - 1);
    }
  };

  const handleSaveColorScheme = () => {
    if (!editingScheme || !editingSchemeComponentCode) return;

    // 验证必填字段
    if (!editingScheme.name.trim()) {
      toast.error('请输入方案名称');
      return;
    }

    if (!editingScheme.colors || editingScheme.colors.length === 0) {
      toast.error('请至少添加一个部件颜色');
      return;
    }

    // 验证每个颜色配置都有hexColor
    const hasEmptyHex = editingScheme.colors.some(c => !c.hexColor.trim());
    if (hasEmptyHex) {
      toast.error('每个颜色配置都需要填写色号');
      return;
    }

    // 查找或创建组件配色数据
    const existingIndex = componentColors.findIndex(cc => cc.componentCode === editingSchemeComponentCode);

    if (existingIndex >= 0) {
      // 组件已存在，更新或添加方案
      const newComponentColors = [...componentColors];
      const componentColor = newComponentColors[existingIndex];

      // 查找方案是否已存在
      const schemeIndex = componentColor.colorSchemes.findIndex(s => s.id === editingScheme.id);

      if (schemeIndex >= 0) {
        // 更新现有方案
        componentColor.colorSchemes[schemeIndex] = editingScheme;
      } else {
        // 添加新方案
        componentColor.colorSchemes.push(editingScheme);
      }

      setComponentColors(newComponentColors);
    } else {
      // 组件不存在，创建新的组件配色
      setComponentColors([...componentColors, {
        componentCode: editingSchemeComponentCode,
        colorSchemes: [editingScheme]
      }]);
    }

    setIsColorModalOpen(false);
    setEditingScheme(null);
    setEditingSchemeComponentCode('');
    toast.success('配色方案已保存');
  };

  const handleDeleteColorScheme = async (componentCode: string, schemeId: string) => {
    const confirmed = await confirm({
      title: '确认删除',
      message: '确定要删除这个配色方案吗?',
      type: 'danger',
    });
    if (!confirmed) return;

    const newComponentColors = componentColors.map(cc => {
      if (cc.componentCode === componentCode) {
        return {
          ...cc,
          colorSchemes: cc.colorSchemes.filter(s => s.id !== schemeId)
        };
      }
      return cc;
    }).filter(cc => cc.colorSchemes.length > 0); // 移除没有方案的组件

    setComponentColors(newComponentColors);
    toast.success('配色方案已删除');
  };

  const handleDeleteComponentColor = async (componentCode: string) => {
    const confirmed = await confirm({
      title: '确认删除',
      message: '确定要删除该组件的所有配色方案吗?',
      type: 'danger',
    });
    if (!confirmed) return;

    setComponentColors(componentColors.filter(cc => cc.componentCode !== componentCode));
    toast.success('配色已删除');
  };

  // 颜色部件管理函数
  const handleAddColorPart = () => {
    if (!editingScheme) return;
    setEditingScheme({
      ...editingScheme,
      colors: [...editingScheme.colors, { part: '', color: '', hexColor: '#000000' }]
    });
  };

  const handleUpdateColorPart = (index: number, field: 'part' | 'color' | 'hexColor', value: string) => {
    if (!editingScheme) return;
    const newColors = [...editingScheme.colors];
    newColors[index][field] = value;
    setEditingScheme({
      ...editingScheme,
      colors: newColors
    });
  };

  const handleDeleteColorPart = (index: number) => {
    if (!editingScheme) return;
    setEditingScheme({
      ...editingScheme,
      colors: editingScheme.colors.filter((_, i) => i !== index)
    });
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
      };

      // 只有在有数据时才添加这两个字段（避免@IsObject验证器拒绝空数组）
      if (components.length > 0) {
        updateData.productSpec = components;
      }
      if (componentColors.length > 0) {
        updateData.additionalAttributes = componentColors;
      }

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
            {/* Buttons moved to bottom-right */}
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
                            <div className="text-sm text-gray-600 mb-2">
                              规格: {comp.spec}
                            </div>
                          )}
                          {comp.parts && comp.parts.length > 0 && (
                            <div className="text-sm text-gray-600">
                              部件: {comp.parts.join('、')}
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
              </div>

              {componentColors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  请先在组件管理中添加组件，然后为组件添加配色方案
                </div>
              ) : (
                <div className="space-y-6">
                  {componentColors.map((compColor, index) => {
                    const component = components.find(c => c.code === compColor.componentCode);
                    return (
                      <div
                        key={index}
                        className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all"
                      >
                        {/* 组件标题 */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-blue-600 text-lg">[{compColor.componentCode}]</span>
                              <span className="font-semibold text-gray-900">{component?.name || '未知组件'}</span>
                            </div>
                            {component?.spec && (
                              <div className="text-sm text-gray-600">
                                规格: {component.spec}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddColorScheme(compColor.componentCode)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="添加配色方案"
                          >
                            <Plus size={18} />
                          </button>
                        </div>

                        {/* 配色方案列表 */}
                        {compColor.colorSchemes && compColor.colorSchemes.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {compColor.colorSchemes.map((scheme) => (
                              <div
                                key={scheme.id}
                                className="bg-gray-50 border border-gray-300 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition-all group"
                              >
                                {/* 方案名称和操作图标 */}
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-gray-900">{scheme.name}</h4>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEditColorScheme(compColor.componentCode, scheme)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all"
                                      title="编辑方案"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteColorScheme(compColor.componentCode, scheme.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                                      title="删除方案"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                {/* 颜色方块显示 */}
                                <div className="space-y-2">
                                  {scheme.colors && scheme.colors.length > 0 ? (
                                    scheme.colors.map((colorPart, colorIndex) => (
                                      <div
                                        key={colorIndex}
                                        className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-gray-200"
                                      >
                                        {/* 颜色方块 */}
                                        {colorPart.hexColor && (
                                          <div
                                            className="w-6 h-6 rounded border-2 border-gray-400 flex-shrink-0"
                                            style={{ backgroundColor: colorPart.hexColor }}
                                            title={colorPart.hexColor}
                                          />
                                        )}
                                        {/* 部件名和颜色名 */}
                                        <div className="flex-1 min-w-0">
                                          <div className="text-xs font-semibold text-gray-700 truncate">
                                            {colorPart.part}
                                          </div>
                                          <div className="text-xs text-gray-500 truncate">
                                            {colorPart.color || colorPart.hexColor}
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-xs text-gray-400 text-center py-2">暂无配色</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <div className="text-gray-400 mb-3">暂无配色方案</div>
                            <button
                              onClick={() => handleAddColorScheme(compColor.componentCode)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium"
                            >
                              <Plus size={16} />
                              添加第一个方案
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 为没有配色的组件显示添加按钮 */}
              {components.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {components
                      .filter(comp => !componentColors.some(cc => cc.componentCode === comp.code))
                      .map(comp => (
                        <button
                          key={comp.code}
                          onClick={() => handleAddColorScheme(comp.code)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium"
                        >
                          <Plus size={16} />
                          为 [{comp.code}] {comp.name} 添加配色
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：基本信息（可编辑） */}
          <div className="h-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col justify-between overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

      {/* 粘性底部按钮栏 */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-end gap-3">
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
                  选择组件 * <span className="text-xs text-gray-500">(从组件配置中选择)</span>
                </label>
                <CustomSelect
                  value={editingComponent.code}
                  onChange={(value) => {
                    const selectedComponent = availableComponents.find(c => c.code === value);
                    if (selectedComponent) {
                      // 从组件配置自动带入所有信息
                      const parts = selectedComponent.parts
                        ? selectedComponent.parts.map((p: any) => p.nameZh)
                        : [];

                      setEditingComponent({
                        ...editingComponent,
                        code: selectedComponent.code,
                        name: selectedComponent.nameZh,
                        name_en: selectedComponent.nameEn,
                        spec: selectedComponent.description || '', // 自动填充规格参数
                        parts: parts // 自动填充部件列表
                      });
                    }
                  }}
                  options={[
                    { label: '请选择组件', value: '' },
                    ...availableComponents.map(comp => ({
                      label: `[${comp.code}] ${comp.nameZh} / ${comp.nameEn}`,
                      value: comp.code
                    }))
                  ]}
                  placeholder="请选择组件"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">组件名称（自动填充）</label>
                <input
                  type="text"
                  value={editingComponent.name}
                  readOnly
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="选择组件后自动填充"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  规格参数 <span className="text-xs text-gray-500">(来自组件配置)</span>
                </label>
                <input
                  type="text"
                  value={editingComponent.spec || ''}
                  readOnly
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="选择组件后自动填充"
                />
              </div>

              {/* 部件列表显示（只读，显示中英文） */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  部件列表 <span className="text-xs text-gray-500">(来自组件配置，至少1个)</span>
                </label>
                <div className="space-y-2">
                  {(editingComponent.parts || []).length > 0 ? (
                    (editingComponent.parts || []).map((part, index) => {
                      // 查找对应的组件配置，获取部件的英文名称
                      const selectedComp = availableComponents.find(c => c.code === editingComponent.code);
                      const partObj = selectedComp?.parts?.find((p: any) => p.nameZh === part);
                      const partEn = partObj?.nameEn || part;

                      return (
                        <div key={index} className="px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          <span className="font-medium">{part}</span>
                          <span className="text-gray-500 ml-2">/ {partEn}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-center">
                      选择组件后自动填充部件列表
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 部件列表由组件配置决定，如需修改请前往"组件配置"模块
                </p>
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

      {/* 配色编辑模态框 - Apple风格渐进式 */}
      {isColorModalOpen && editingScheme && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {componentColors.find(cc => cc.componentCode === editingSchemeComponentCode)?.colorSchemes.some(s => s.id === editingScheme.id)
                  ? '编辑配色方案'
                  : '添加配色方案'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                [{editingSchemeComponentCode}] {components.find(c => c.code === editingSchemeComponentCode)?.name}
              </p>

              {/* 方案名称 */}
              <div className="mt-4">
                <input
                  type="text"
                  value={editingScheme.name}
                  onChange={(e) => setEditingScheme({ ...editingScheme, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium"
                  placeholder="方案名称"
                />
              </div>
            </div>

            {/* Body - 渐进式部件配置 */}
            <div className="p-8">
              {editingScheme.colors.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  此组件没有配置部件，请先在组件管理中添加部件
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 进度指示器 */}
                  <div className="flex items-center gap-3">
                    {editingScheme.colors.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPartIndex(index)}
                        className={`flex-1 h-1.5 rounded-full transition-all ${
                          index === currentPartIndex
                            ? 'bg-green-600'
                            : index < currentPartIndex
                            ? 'bg-green-400'
                            : 'bg-gray-200'
                        }`}
                        title={`${editingScheme.colors[index].part}${index < currentPartIndex ? ' (已完成)' : index === currentPartIndex ? ' (当前)' : ' (待配置)'}`}
                      />
                    ))}
                  </div>

                  {/* 已完成部件预览 */}
                  {currentPartIndex > 0 && (
                    <div className="space-y-2">
                      {editingScheme.colors.slice(0, currentPartIndex).map((colorPart, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="font-medium">{colorPart.part}:</span>
                          <div
                            className="w-5 h-5 rounded border-2 border-gray-300"
                            style={{ backgroundColor: colorPart.hexColor }}
                            title={colorPart.hexColor}
                          />
                          <span className="text-gray-500">{colorPart.color || colorPart.hexColor}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 当前配置的部件 */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                        步骤 {currentPartIndex + 1} / {editingScheme.colors.length}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        配置：{editingScheme.colors[currentPartIndex].part}
                      </h4>
                      <div className="w-16 h-1 bg-green-500 rounded-full mx-auto" />
                    </div>

                    {/* 颜色名称（必填） */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        颜色名称 <span className="text-red-500">*</span>
                        <span className="text-gray-400 text-xs ml-2">(请输入中英文格式，如：红色/red)</span>
                      </label>
                      <input
                        type="text"
                        value={editingScheme.colors[currentPartIndex].color}
                        onChange={(e) => handleUpdateColorPart(currentPartIndex, 'color', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="如: 3C冷灰/Cool Gray, 经典黑/Classic Black"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">提示：使用"中文/English"格式支持多语言显示</p>
                    </div>

                    {/* 色号输入 + 取色器 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        色号 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={editingScheme.colors[currentPartIndex].hexColor || ''}
                            onChange={(e) => handleUpdateColorPart(currentPartIndex, 'hexColor', e.target.value)}
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-base"
                            placeholder="#000000"
                            maxLength={7}
                          />
                          {editingScheme.colors[currentPartIndex].hexColor && (
                            <div
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg border-2 border-gray-400 shadow-sm"
                              style={{ backgroundColor: editingScheme.colors[currentPartIndex].hexColor }}
                            />
                          )}
                        </div>
                        <input
                          type="color"
                          value={editingScheme.colors[currentPartIndex].hexColor || '#000000'}
                          onChange={(e) => handleUpdateColorPart(currentPartIndex, 'hexColor', e.target.value)}
                          className="w-16 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                          title="取色器"
                        />
                      </div>
                    </div>

                    {/* 快速选择色板 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-3">
                        快速选择
                      </label>
                      <div className="grid grid-cols-8 gap-2">
                        {[
                          { name: '黑色', hex: '#000000' },
                          { name: '白色', hex: '#FFFFFF' },
                          { name: '3C冷灰', hex: '#3C3C3C' },
                          { name: '10C冷灰', hex: '#6B6B6B' },
                          { name: '银色', hex: '#C0C0C0' },
                          { name: '金色', hex: '#FFD700' },
                          { name: '红色', hex: '#E74C3C' },
                          { name: '蓝色', hex: '#3498DB' },
                        ].map((preset) => (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => {
                              handleUpdateColorPart(currentPartIndex, 'hexColor', preset.hex);
                              if (!editingScheme.colors[currentPartIndex].color) {
                                handleUpdateColorPart(currentPartIndex, 'color', preset.name);
                              }
                            }}
                            className="aspect-square rounded-lg border-2 border-gray-300 hover:border-green-500 hover:scale-110 transition-all shadow-sm"
                            style={{ backgroundColor: preset.hex }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - 导航按钮 */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setIsColorModalOpen(false);
                  setEditingScheme(null);
                  setEditingSchemeComponentCode('');
                  setCurrentPartIndex(0);
                }}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                取消
              </button>

              {currentPartIndex > 0 && (
                <button
                  onClick={handlePrevPart}
                  className="px-6 py-2.5 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-all font-medium"
                >
                  ← 上一步
                </button>
              )}

              {currentPartIndex < editingScheme.colors.length - 1 ? (
                <button
                  onClick={handleNextPart}
                  className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium"
                >
                  下一步 →
                </button>
              ) : (
                <button
                  onClick={handleSaveColorScheme}
                  className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium"
                >
                  完成配置 ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
