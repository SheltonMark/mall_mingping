/**
 * 前台公开API - 用于前台商城（不需要认证）
 * 与后端 backend-api 对接
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 导出服务器基础URL（用于图片等静态资源）
export const getServerUrl = () => API_BASE_URL.replace('/api', '');

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // 如果客户已登录，自动附带JWT token以便后端进行权限过滤
  if (typeof window !== 'undefined') {
    const customerToken = localStorage.getItem('customer_token');
    if (customerToken) {
      headers['Authorization'] = `Bearer ${customerToken}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============ 产品相关 (公开接口) ============

export interface Category {
  id: string;
  code: string; // Category code (MP, TB, T, B, S, CG, CD, MB, QC, CW, W)
  nameZh: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Material {
  id: string;
  nameZh: string;
  nameEn: string;
  isActive: boolean;
}

export interface ProductGroup {
  id: string;
  prefix: string; // Product prefix (MP007, TB001, etc.)
  groupNameZh: string;
  groupNameEn: string;
  descriptionZh?: string;
  descriptionEn?: string;
  categoryId?: string;
  categoryCode?: string; // Redundant category code (MP, TB, T, B, etc.)
  materialId?: string;
  isPublished: boolean;
  displayOrder: number;
  optionalAttributes?: any; // 产品组级别的可选属性 (JSON数组, 包含nameZh, nameEn)
  category?: Category;
  material?: Material;
  skus: ProductSku[];
}

export interface ProductSku {
  id: string;
  groupId: string;
  productCode: string; // 品号
  productName: string; // 品名 (中文)
  productNameEn?: string; // 品名英文
  title?: string; // 主标题 (显示在规格选择器)
  subtitle?: string; // 副标题 (显示在主标题下方)
  brand?: string; // 商标
  specification?: string; // 规格原始文本 (中文)
  specificationEn?: string; // 规格原始文本 (英文)
  productSpec?: any; // 解析后的部件规格 (JSON)
  additionalAttributes?: any; // 解析后的颜色属性 (JSON)
  optionalAttributes?: any; // 可选属性配置 (JSON数组)
  price: number;
  stock?: number;
  images?: any; // 图片集 (JSON数组)
  video?: any; // 独立视频 (JSON)
  useSharedVideo?: boolean; // 是否使用SKU组共用视频
  mainImage?: string;
  status: 'ACTIVE' | 'INACTIVE';
  group?: ProductGroup;
}

export const productApi = {
  // 获取分类列表（仅激活的）
  getCategories: () =>
    request<Category[]>('/products/categories?activeOnly=true'),

  // 获取材料列表（仅激活的）
  getMaterials: () =>
    request<Material[]>('/products/materials?activeOnly=true'),

  // 获取产品组列表（仅已发布的）
  getGroups: (params?: {
    categoryId?: string;
    materialId?: string;
    search?: string;
    page?: number;
    limit?: number
  }) => {
    const query = new URLSearchParams({
      publishedOnly: 'true',
      ...params as any
    }).toString();
    return request<{
      data: ProductGroup[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/products/groups${query ? `?${query}` : ''}`);
  },

  // 获取单个产品组详情（含SKUs）
  getGroup: (id: string) =>
    request<ProductGroup>(`/products/groups/${id}`),

  // 获取SKU详情
  getSku: (id: string) =>
    request<ProductSku>(`/products/skus/${id}`),
};

// ============ 系统配置相关 (公开接口) ============

export const systemApi = {
  // 获取首页配置
  getHomepage: () => request<any>('/system/homepage'),

  // 获取关于我们配置
  getAbout: () => request<any>('/system/about'),

  // 获取站点配置
  getSite: () => request<any>('/system/site'),
};

// ============ 合作申请 (公开接口) ============

export interface PartnershipForm {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  message?: string;
}

export const partnershipApi = {
  // 提交合作申请（无需认证）
  submit: (data: PartnershipForm) =>
    request<any>('/partnerships', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============ 订阅相关 (公开接口) ============

export const subscriptionApi = {
  // 订阅邮箱通知（无需认证）
  subscribe: (email: string, source?: string) =>
    request<any>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ email, source }),
    }),
};

// ============ 导出API ============
export const publicApi = {
  product: productApi,
  system: systemApi,
  partnership: partnershipApi,
  subscription: subscriptionApi,
};

// ============ 订单相关 (需要认证，但暂时放在公开API中) ============

export interface Customer {
  id: string;
  name: string;
  type: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface Salesperson {
  id: string;
  code: string;
  name: string;
}

export interface OrderItem {
  // System fields
  itemNumber?: number;
  productSkuId: string;
  productCode?: string;
  customerProductCode?: string;
  productImage?: string;
  productName?: string;
  productSpec?: string;
  additionalAttributes?: string;
  quantity: number;
  packagingConversion?: number;
  packagingUnit?: string;
  weightUnit?: string;
  netWeight?: number;
  grossWeight?: number;
  packagingType?: string;
  packagingSize?: string;
  supplierNote?: string;
  expectedDeliveryDate?: string;

  // Sales fields
  price: number;
  untaxedLocalCurrency?: number;
  packingQuantity?: number;
  cartonQuantity?: number;
  packagingMethod?: string;
  paperCardCode?: string;
  washLabelCode?: string;
  outerCartonCode?: string;
  cartonSpecification?: string;
  volume?: number;
  summary?: string;

  // Auto-calculated
  subtotal?: number;
}

export interface CreateOrderDto {
  orderNumber: string;
  customerId: string;
  salespersonId: string;
  customerType: 'NEW' | 'OLD';
  orderType: 'FORMAL' | 'INTENTION';
  orderDate: string;
  companyName?: string;
  status?: string;
  items: OrderItem[];
  customParams?: Array<{ paramKey: string; paramValue: string }>;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  salespersonId: string;
  customerType: 'NEW' | 'OLD';
  orderType: 'FORMAL' | 'INTENTION';
  orderDate: string;
  companyName?: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  salesperson?: Salesperson;
  items?: OrderItem[];
}

export const orderApi = {
  // 创建订单
  createOrder: (data: CreateOrderDto) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取订单列表
  getOrders: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{
      data: Order[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/orders${query ? `?${query}` : ''}`);
  },

  // 获取单个订单
  getOrder: (id: string) =>
    request<Order>(`/orders/${id}`),
};

export const customerApi = {
  // 搜索客户
  searchCustomers: (search: string) =>
    request<Customer[]>(`/customers?search=${encodeURIComponent(search)}`),

  // 创建客户
  createCustomer: (data: {
    name: string;
    type: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
  }) =>
    request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取客户详情
  getCustomer: (id: string) =>
    request<Customer>(`/customers/${id}`),
};

export const salespersonApi = {
  // 获取业务员列表
  getSalespeople: () =>
    request<Salesperson[]>('/salespersons'),

  // 获取业务员详情
  getSalesperson: (id: string) =>
    request<Salesperson>(`/salespersons/${id}`),
};
