// API配置 - 业务员端
const API_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_BASE_URL = API_SERVER_URL.replace('/api', '/api');

// 获取token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('salesperson_token');
  }
  return null;
};

// 获取业务员ID
const getSalespersonId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('salesperson_id');
  }
  return null;
};

// 过滤 undefined、null、空字符串的辅助函数
const filterParams = (params: any): Record<string, string> => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)])
  );
};

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token过期，跳转到登录页
    if (typeof window !== 'undefined') {
      localStorage.removeItem('salesperson_token');
      localStorage.removeItem('salesperson_id');
      localStorage.removeItem('salesperson_name');
      window.location.href = '/salesperson/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// ============ 客户管理 ============
export const customerApi = {
  // 获取业务员自己的客户列表
  getAll: (params?: { search?: string; type?: string; page?: number; limit?: number }) => {
    const salespersonId = getSalespersonId();
    if (!salespersonId) {
      throw new Error('未找到业务员信息');
    }
    const query = new URLSearchParams(filterParams({ ...params, salespersonId })).toString();
    return request<any>(`/customers${query ? `?${query}` : ''}`);
  },

  getOne: (id: string) => request<any>(`/customers/${id}`),

  // 创建客户（自动分配给当前业务员）
  create: (data: any) => {
    const salespersonId = getSalespersonId();
    if (!salespersonId) {
      throw new Error('未找到业务员信息');
    }
    return request<any>('/customers', {
      method: 'POST',
      body: JSON.stringify({ ...data, salespersonId }),
    });
  },

  update: (id: string, data: any) =>
    request<any>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<any>(`/customers/${id}`, {
      method: 'DELETE',
    }),
};

// ============ 产品管理 ============
export const productApi = {
  // 获取产品组列表（业务员只能看到自己有权限的产品）
  getGroups: (params?: { search?: string; categoryId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(filterParams(params)).toString();
    return request<any>(`/products/groups${query ? `?${query}` : ''}`);
  },

  // 获取单个产品组详情
  getGroup: (id: string) => request<any>(`/products/groups/${id}`),

  // 获取产品分类
  getCategories: (activeOnly?: boolean) => {
    const query = activeOnly ? '?activeOnly=true' : '';
    return request<any>(`/products/categories${query}`);
  },
};

// ============ 订单管理 ============
export const orderApi = {
  // 获取业务员自己的订单列表
  getAll: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const salespersonId = getSalespersonId();
    if (!salespersonId) {
      throw new Error('未找到业务员信息');
    }
    const query = new URLSearchParams(filterParams({ ...params, salespersonId })).toString();
    return request<any>(`/orders${query ? `?${query}` : ''}`);
  },

  // 获取单个订单详情
  getOne: (id: string) => request<any>(`/orders/${id}`),

  // 创建订单
  create: (data: any) => {
    const salespersonId = getSalespersonId();
    if (!salespersonId) {
      throw new Error('未找到业务员信息');
    }
    return request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify({ ...data, salespersonId }),
    });
  },

  // 更新订单
  update: (id: string, data: any) =>
    request<any>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // 导出订单
  exportOne: (id: string) => {
    const token = getToken();
    window.open(`${API_BASE_URL}/orders/${id}/export?token=${token}`, '_blank');
  },
};

// ============ 认证相关 ============
export const authApi = {
  login: (accountId: string, password: string) =>
    request<{ salesperson: any; access_token: string }>('/salesperson-auth/login', {
      method: 'POST',
      body: JSON.stringify({ accountId, password }),
    }),

  getProfile: () => request<any>('/salesperson-auth/profile'),

  changePassword: (oldPassword: string, newPassword: string) =>
    request<{ message: string }>('/salesperson-auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
};
