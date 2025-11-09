'use client';

import { useEffect, useState } from 'react';
import { systemApi, uploadApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import { Upload, X, Image as ImageIcon, Video, Plus, Trash2, Save } from 'lucide-react';

interface AboutConfig {
  // Hero区域
  hero_image?: string;
  hero_title_line1_en?: string;
  hero_title_line1_zh?: string;
  hero_title_line2_en?: string;
  hero_title_line2_zh?: string;
  hero_subtitle_en?: string;
  hero_subtitle_zh?: string;

  // 品牌故事 - 第一组
  story1_image?: string;
  story1_title_en?: string;
  story1_title_zh?: string;
  story1_desc1_en?: string;
  story1_desc1_zh?: string;
  story1_desc2_en?: string;
  story1_desc2_zh?: string;

  // 品牌故事 - 第二组
  story2_image?: string;
  story2_title_en?: string;
  story2_title_zh?: string;
  story2_desc1_en?: string;
  story2_desc1_zh?: string;
  story2_desc2_en?: string;
  story2_desc2_zh?: string;

  // 工厂展示区
  factory_carousel?: Array<{
    media_type: 'image' | 'video';
    media_url: string;
    label_en: string;
    label_zh: string;
    video_autoplay?: boolean;
    video_loop?: boolean;
    video_muted?: boolean;
  }> | string;

  // 联系方式
  contact_email?: string;
  contact_phone?: string;
  contact_address_en?: string;
  contact_address_zh?: string;
}

export default function AboutConfigPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [config, setConfig] = useState<AboutConfig>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await systemApi.getAbout();
      setConfig(data || {});
    } catch (error) {
      console.error('Failed to load config:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await systemApi.updateAbout(config);
      toast.success('配置保存成功');
    } catch (error: any) {
      console.error('Failed to save config:', error);
      toast.error(error.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof AboutConfig) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'image');
      setConfig({ ...config, [fieldName]: result.url });
      toast.success('图片上传成功');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 视频上传
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, carouselIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('请上传视频文件');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('视频大小不能超过50MB');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'video');

      const carousel = getFactoryCarousel();
      carousel[carouselIndex] = {
        ...carousel[carouselIndex],
        media_type: 'video',
        media_url: result.url,
      };
      setConfig({ ...config, factory_carousel: carousel });
      toast.success('视频上传成功');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '视频上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 获取工厂轮播数组
  const getFactoryCarousel = () => {
    if (Array.isArray(config.factory_carousel)) {
      return config.factory_carousel;
    }
    if (typeof config.factory_carousel === 'string') {
      try {
        return JSON.parse(config.factory_carousel);
      } catch {
        return [];
      }
    }
    return [];
  };

  // 添加轮播项
  const addCarouselItem = () => {
    const carousel = getFactoryCarousel();
    if (carousel.length >= 6) {
      toast.warning('最多支持6个轮播项');
      return;
    }
    carousel.push({
      media_type: 'image',
      media_url: '',
      label_en: '',
      label_zh: '',
      video_autoplay: true,
      video_loop: true,
      video_muted: true,
    });
    setConfig({ ...config, factory_carousel: carousel });
  };

  // 删除轮播项
  const removeCarouselItem = (index: number) => {
    const carousel = getFactoryCarousel();
    carousel.splice(index, 1);
    setConfig({ ...config, factory_carousel: carousel });
  };

  // 更新轮播项
  const updateCarouselItem = (index: number, field: string, value: any) => {
    const carousel = getFactoryCarousel();
    carousel[index] = { ...carousel[index], [field]: value };
    setConfig({ ...config, factory_carousel: carousel });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部标题栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">关于我们配置</h1>
              <p className="text-sm text-gray-600 mt-1">配置关于我们页面的所有内容</p>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* 1. Hero区域 */}
          <Section title="1. Hero区域配置" description="页面顶部的大图和标题">
            {/* Hero背景图 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Hero背景图</label>
              <ImageUploadBox
                image={config.hero_image}
                onUpload={(e) => handleImageUpload(e, 'hero_image')}
                onRemove={() => setConfig({ ...config, hero_image: '' })}
                uploading={uploading}
                height="h-56"
              />
            </div>

            {/* 标题配置 */}
            <BilingualInput
              label="主标题第一行"
              valueEn={config.hero_title_line1_en || ''}
              valueZh={config.hero_title_line1_zh || ''}
              onChangeEn={(val) => setConfig({ ...config, hero_title_line1_en: val })}
              onChangeZh={(val) => setConfig({ ...config, hero_title_line1_zh: val })}
              placeholderEn="Crafting Tomorrow's"
              placeholderZh="匠心打造"
            />

            <BilingualInput
              label="主标题第二行 (金色斜体)"
              valueEn={config.hero_title_line2_en || ''}
              valueZh={config.hero_title_line2_zh || ''}
              onChangeEn={(val) => setConfig({ ...config, hero_title_line2_en: val })}
              onChangeZh={(val) => setConfig({ ...config, hero_title_line2_zh: val })}
              placeholderEn="Cleaning Solutions"
              placeholderZh="清洁方案"
            />

            <BilingualInput
              label="副标题"
              valueEn={config.hero_subtitle_en || ''}
              valueZh={config.hero_subtitle_zh || ''}
              onChangeEn={(val) => setConfig({ ...config, hero_subtitle_en: val })}
              onChangeZh={(val) => setConfig({ ...config, hero_subtitle_zh: val })}
              placeholderEn="Professional cleaning tools manufacturer"
              placeholderZh="专业清洁工具制造商"
            />
          </Section>

          {/* 2. 品牌故事 */}
          <Section title="2. 品牌故事区配置" description="左右图文展示区域">
            {/* 第一组 */}
            <StoryGroup
              title="第一组 - 工匠精神"
              image={config.story1_image}
              titleEn={config.story1_title_en || ''}
              titleZh={config.story1_title_zh || ''}
              desc1En={config.story1_desc1_en || ''}
              desc1Zh={config.story1_desc1_zh || ''}
              desc2En={config.story1_desc2_en || ''}
              desc2Zh={config.story1_desc2_zh || ''}
              onImageUpload={(e) => handleImageUpload(e, 'story1_image')}
              onImageRemove={() => setConfig({ ...config, story1_image: '' })}
              onTitleEnChange={(val) => setConfig({ ...config, story1_title_en: val })}
              onTitleZhChange={(val) => setConfig({ ...config, story1_title_zh: val })}
              onDesc1EnChange={(val) => setConfig({ ...config, story1_desc1_en: val })}
              onDesc1ZhChange={(val) => setConfig({ ...config, story1_desc1_zh: val })}
              onDesc2EnChange={(val) => setConfig({ ...config, story1_desc2_en: val })}
              onDesc2ZhChange={(val) => setConfig({ ...config, story1_desc2_zh: val })}
              uploading={uploading}
            />

            {/* 第二组 */}
            <StoryGroup
              title="第二组 - 工厂直供"
              image={config.story2_image}
              titleEn={config.story2_title_en || ''}
              titleZh={config.story2_title_zh || ''}
              desc1En={config.story2_desc1_en || ''}
              desc1Zh={config.story2_desc1_zh || ''}
              desc2En={config.story2_desc2_en || ''}
              desc2Zh={config.story2_desc2_zh || ''}
              onImageUpload={(e) => handleImageUpload(e, 'story2_image')}
              onImageRemove={() => setConfig({ ...config, story2_image: '' })}
              onTitleEnChange={(val) => setConfig({ ...config, story2_title_en: val })}
              onTitleZhChange={(val) => setConfig({ ...config, story2_title_zh: val })}
              onDesc1EnChange={(val) => setConfig({ ...config, story2_desc1_en: val })}
              onDesc1ZhChange={(val) => setConfig({ ...config, story2_desc1_zh: val })}
              onDesc2EnChange={(val) => setConfig({ ...config, story2_desc2_en: val })}
              onDesc2ZhChange={(val) => setConfig({ ...config, story2_desc2_zh: val })}
              uploading={uploading}
            />
          </Section>

          {/* 3. 工厂展示区 */}
          <Section
            title="3. 工厂展示区配置"
            description="轮播图，支持图片和视频混合"
            action={
              <button
                onClick={addCarouselItem}
                disabled={getFactoryCarousel().length >= 6}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Plus size={16} />
                添加轮播项 ({getFactoryCarousel().length}/6)
              </button>
            }
          >
            {getFactoryCarousel().length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-lg mb-2">暂无轮播项</p>
                <p className="text-sm">点击右上角"添加轮播项"按钮开始配置</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFactoryCarousel().map((item: any, index: number) => (
                  <CarouselItem
                    key={index}
                    index={index}
                    item={item}
                    onUpdate={updateCarouselItem}
                    onRemove={removeCarouselItem}
                    onImageUpload={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setUploading(true);
                        const result = await uploadApi.uploadSingle(file, 'image');
                        updateCarouselItem(index, 'media_url', result.url);
                        updateCarouselItem(index, 'media_type', 'image');
                        toast.success('图片上传成功');
                      } catch (error: any) {
                        toast.error(error.message || '上传失败');
                      } finally {
                        setUploading(false);
                      }
                    }}
                    onVideoUpload={(e) => handleVideoUpload(e, index)}
                    uploading={uploading}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">💡</span>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">提示:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>图片格式: JPG, PNG, WEBP (最大5MB)</li>
                    <li>视频格式: MP4, WEBM (最大50MB)</li>
                    <li>建议图片尺寸: 1200x800 像素</li>
                    <li>最多支持6个轮播项</li>
                  </ul>
                </div>
              </div>
            </div>
          </Section>

          {/* 4. 联系方式 */}
          <Section title="4. 联系方式配置" description="页面底部显示的联系信息">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">邮箱</label>
                <input
                  type="email"
                  value={config.contact_email || ''}
                  onChange={(e) => setConfig({ ...config, contact_email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="XXL7702@163.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">电话</label>
                <input
                  type="tel"
                  value={config.contact_phone || ''}
                  onChange={(e) => setConfig({ ...config, contact_phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+86 13806777702"
                />
              </div>
            </div>

            <BilingualInput
              label="地址"
              valueEn={config.contact_address_en || ''}
              valueZh={config.contact_address_zh || ''}
              onChangeEn={(val) => setConfig({ ...config, contact_address_en: val })}
              onChangeZh={(val) => setConfig({ ...config, contact_address_zh: val })}
              placeholderEn="Dongyang, Zhejiang, China"
              placeholderZh="浙江省东阳市"
            />
          </Section>
        </div>
      </div>

      {/* 粘性底部按钮栏 */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {submitting ? <ButtonLoader /> : <><Save size={18} /> 保存配置</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 子组件 ==========

function Section({
  title,
  description,
  action,
  children
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
          {action}
        </div>
      </div>
      <div className="p-6 space-y-6">
        {children}
      </div>
    </div>
  );
}

function BilingualInput({
  label,
  valueEn,
  valueZh,
  onChangeEn,
  onChangeZh,
  placeholderEn,
  placeholderZh,
  textarea = false,
  rows = 3,
}: {
  label: string;
  valueEn: string;
  valueZh: string;
  onChangeEn: (val: string) => void;
  onChangeZh: (val: string) => void;
  placeholderEn?: string;
  placeholderZh?: string;
  textarea?: boolean;
  rows?: number;
}) {
  const InputComponent = textarea ? 'textarea' : 'input';

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-600">🇬🇧 English</span>
          </div>
          <InputComponent
            value={valueEn}
            onChange={(e: any) => onChangeEn(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={placeholderEn}
            rows={textarea ? rows : undefined}
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-600">🇨🇳 中文</span>
          </div>
          <InputComponent
            value={valueZh}
            onChange={(e: any) => onChangeZh(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={placeholderZh}
            rows={textarea ? rows : undefined}
          />
        </div>
      </div>
    </div>
  );
}

function ImageUploadBox({
  image,
  onUpload,
  onRemove,
  uploading,
  height = 'h-48',
}: {
  image?: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  uploading: boolean;
  height?: string;
}) {
  return image ? (
    <div className="relative group">
      <img
        src={image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${image}`}
        alt="Preview"
        className={`w-full ${height} object-cover rounded-lg`}
      />
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={18} />
      </button>
    </div>
  ) : (
    <label className={`flex flex-col items-center justify-center w-full ${height} border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors`}>
      <div className="text-center">
        <Upload className="mx-auto mb-3 text-gray-400" size={32} />
        <div className="text-sm font-medium text-gray-700 mb-1">
          {uploading ? '上传中...' : '点击上传图片'}
        </div>
        <div className="text-xs text-gray-500">支持 JPG、PNG、WebP，最大5MB</div>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
        disabled={uploading}
      />
    </label>
  );
}

function StoryGroup({
  title,
  image,
  titleEn,
  titleZh,
  desc1En,
  desc1Zh,
  desc2En,
  desc2Zh,
  onImageUpload,
  onImageRemove,
  onTitleEnChange,
  onTitleZhChange,
  onDesc1EnChange,
  onDesc1ZhChange,
  onDesc2EnChange,
  onDesc2ZhChange,
  uploading,
}: any) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200 mb-6">
      <h3 className="font-bold text-gray-900 mb-4 text-base">{title}</h3>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">配图</label>
        <ImageUploadBox
          image={image}
          onUpload={onImageUpload}
          onRemove={onImageRemove}
          uploading={uploading}
          height="h-44"
        />
      </div>

      <BilingualInput
        label="标题"
        valueEn={titleEn}
        valueZh={titleZh}
        onChangeEn={onTitleEnChange}
        onChangeZh={onTitleZhChange}
        placeholderEn="Craftsmanship Excellence"
        placeholderZh="工匠精神"
      />

      <BilingualInput
        label="介绍段落1"
        valueEn={desc1En}
        valueZh={desc1Zh}
        onChangeEn={onDesc1EnChange}
        onChangeZh={onDesc1ZhChange}
        placeholderEn="Since 1995..."
        placeholderZh="自1995年以来..."
        textarea
        rows={3}
      />

      <BilingualInput
        label="介绍段落2"
        valueEn={desc2En}
        valueZh={desc2Zh}
        onChangeEn={onDesc2EnChange}
        onChangeZh={onDesc2ZhChange}
        placeholderEn="Our mission is..."
        placeholderZh="我们的使命是..."
        textarea
        rows={3}
      />
    </div>
  );
}

function CarouselItem({
  index,
  item,
  onUpdate,
  onRemove,
  onImageUpload,
  onVideoUpload,
  uploading,
}: any) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">轮播项 {index + 1}</h3>
        <button
          onClick={() => onRemove(index)}
          className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
        >
          <Trash2 size={16} />
          删除
        </button>
      </div>

      {/* 媒体类型选择 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">媒体类型</label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={item.media_type === 'image'}
              onChange={() => onUpdate(index, 'media_type', 'image')}
              className="mr-2"
            />
            <ImageIcon size={18} className="mr-1 text-gray-600" />
            <span className="text-sm font-medium">图片</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={item.media_type === 'video'}
              onChange={() => onUpdate(index, 'media_type', 'video')}
              className="mr-2"
            />
            <Video size={18} className="mr-1 text-gray-600" />
            <span className="text-sm font-medium">视频</span>
          </label>
        </div>
      </div>

      {/* 媒体文件 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">媒体文件</label>
        {item.media_url ? (
          <div className="relative group">
            {item.media_type === 'video' ? (
              <video
                src={item.media_url.startsWith('http') ? item.media_url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.media_url}`}
                className="w-full h-48 object-cover rounded-lg"
                controls
              />
            ) : (
              <img
                src={item.media_url.startsWith('http') ? item.media_url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.media_url}`}
                alt={`Carousel ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <button
              onClick={() => onUpdate(index, 'media_url', '')}
              className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors">
              <ImageIcon size={32} className="mb-2 text-gray-400" />
              <div className="text-sm font-medium text-gray-700">{uploading ? '上传中...' : '上传图片'}</div>
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors">
              <Video size={32} className="mb-2 text-gray-400" />
              <div className="text-sm font-medium text-gray-700">{uploading ? '上传中...' : '上传视频'}</div>
              <input
                type="file"
                accept="video/*"
                onChange={onVideoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        )}
      </div>

      {/* 视频设置 */}
      {item.media_type === 'video' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-3">🎬 视频设置</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={item.video_autoplay !== false}
                onChange={(e) => onUpdate(index, 'video_autoplay', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">自动播放</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={item.video_loop !== false}
                onChange={(e) => onUpdate(index, 'video_loop', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">循环播放</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={item.video_muted !== false}
                onChange={(e) => onUpdate(index, 'video_muted', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">静音</span>
            </label>
          </div>
        </div>
      )}

      {/* 标签文字 */}
      <BilingualInput
        label="标签文字"
        valueEn={item.label_en || ''}
        valueZh={item.label_zh || ''}
        onChangeEn={(val) => onUpdate(index, 'label_en', val)}
        onChangeZh={(val) => onUpdate(index, 'label_zh', val)}
        placeholderEn="Production Line A"
        placeholderZh="生产线A"
      />
    </div>
  );
}
