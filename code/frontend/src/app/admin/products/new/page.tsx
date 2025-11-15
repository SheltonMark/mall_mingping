'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  productNameEn?: string;
  title?: string;        // 主标题
  subtitle?: string;     // 副标题
  brand?: string;
  specification?: string;
  specificationEn?: string;
  productSpec?: any;
  additionalAttributes?: any;
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

export default function NewSkuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const toast = useToast();
  const { confirm, isOpen, options, handleConfirm, handleClose } = useConfirm();

  const [sku, setSku] = useState<ProductSku>({
    id: '',
    productCode: '',
    productName: '',
    productNameEn: '',
    specification: '',
    specificationEn: '',
    status: 'ACTIVE',
    group: undefined
  });
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
    if (!groupId) {
      toast.error('缺少产品组ID');
      router.push('/admin/products');
      return;
    }
    loadGroup();
    loadAvailableComponents();
  }, [groupId]);

  const loadGroup = async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const data = await productApi.getGroup(groupId);
      setSku((prev) => ({
        ...prev,
        group: {
          id: data.id,
          prefix: data.prefix,
          groupNameZh: data.groupNameZh,
          sharedVideo: data.sharedVideo
        }
      }));
    } catch (error: any) {
      console.error('Failed to load group:', error);
      toast.error('加载产品组失败: ' + error.message);
      router.push('/admin/products');
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

  const handleSubmit = async () => {
    if (!groupId) {
      toast.error('缺少产品组ID');
      return;
    }

    // 验证必填字段
    if (!sku.productCode || !sku.productCode.trim()) {
      toast.error('请输入品号');
      return;
    }

    if (!sku.productName || !sku.productName.trim()) {
      toast.error('请输入品名');
      return;
    }

    if (!sku.productNameEn || !sku.productNameEn.trim()) {
      toast.error('请输入品名英文');
      return;
    }

    if (!sku.specification || !sku.specification.trim()) {
      toast.error('请输入货品规格');
      return;
    }

    if (!sku.specificationEn || !sku.specificationEn.trim()) {
      toast.error('请输入货品规格英文');
      return;
    }

    setSaving(true);
    try {
      // 准备创建数据
      const createData: any = {
        groupId: groupId,
        productCode: sku.productCode,
        productName: sku.productName,
        productNameEn: sku.productNameEn,
        specification: sku.specification,
        specificationEn: sku.specificationEn,
        status: sku.status,
        images: images,
        title: sku.title || null,
        subtitle: sku.subtitle || null,
      };

      // 只有在有数据时才添加这两个字段（避免@IsObject验证器拒绝空数组）
      if (components.length > 0) {
        createData.productSpec = components;
      }
      if (componentColors.length > 0) {
        createData.additionalAttributes = componentColors;
      }

      // 如果有新上传的视频文件，先上传视频（使用带认证的API）
      if (videoFile) {
        const videoResult = await uploadApi.uploadSingle(videoFile, 'video' as any);
        createData.video = { url: videoResult.url, type: videoFile.type }; // ✅ 直接传对象
      } else {
        // 无视频
        createData.video = null;
      }

      // 调用API创建SKU
      await productApi.createSku(createData);

      toast.success('创建成功');

      // 跳转回产品列表
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error('创建失败: ' + error.message);
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

  if (!groupId || !sku.group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">产品组未找到</p>
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
                <h1 className="text-2xl font-bold text-gray-900">新增产品规格</h1>
                <p className="text-sm text-gray-600 font-mono mt-1">{sku.group?.prefix} - {sku.group?.groupNameZh}</p>
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

          </div>

          {/* 右侧：基本信息（可编辑） */}
          <div className="h-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <h2 className="text-lg font-bold text-gray-900 mb-6">基本信息</h2>

              {/* 品号 (可编辑) */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  品号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sku.productCode}
                  onChange={(e) => setSku({ ...sku, productCode: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                  placeholder="例如: MP001-001"
                />
              </div>

              {/* 品名 (可编辑) */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  品名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sku.productName}
                  onChange={(e) => setSku({ ...sku, productName: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="例如: 多功能拖把"
                />
              </div>

              {/* 品名英文 */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  品名英文 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sku.productNameEn || ''}
                  onChange={(e) => setSku({ ...sku, productNameEn: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="例如: Premium Cleaning Tool"
                  required
                />
              </div>

              {/* 货品规格 */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  货品规格 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sku.specification || ''}
                  onChange={(e) => setSku({ ...sku, specification: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="例如：家用型"
                  required
                />
              </div>

              {/* 货品规格英文 */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  货品规格英文 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sku.specificationEn || ''}
                  onChange={(e) => setSku({ ...sku, specificationEn: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="例如: Household Type"
                  required
                />
              </div>


              {/* 状态 */}
              <div className="mb-5">
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
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <ButtonLoader />
                  创建中...
                </>
              ) : (
                <>
                  <Save size={18} />
                  创建
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
