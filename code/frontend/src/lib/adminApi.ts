const API_BASE_URL = 'http://localhost:3001/api';

// 获取token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
};

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
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
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// ============ 认证相关 ============
export const authApi = {
  login: (username: string, password: string) =>
    request<{ user: any; access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, email: string, password: string) =>
    request<{ user: any; access_token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  getProfile: () => request<any>('/auth/profile'),
};

// ============ 业务员管理 ============
export const salespersonApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/salespersons${query ? `?${query}` : ''}`);
  },

  getOne: (id: string) => request<any>(`/salespersons/${id}`),

  create: (data: any) =>
    request<any>('/salespersons', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<any>(`/salespersons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<any>(`/salespersons/${id}`, {
      method: 'DELETE',
    }),
};

// ============ 客户管理 ============
export const customerApi = {
  getAll: (params?: { search?: string; type?: string; salespersonId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/customers${query ? `?${query}` : ''}`);
  },

  getOne: (id: string) => request<any>(`/customers/${id}`),

  create: (data: any) =>
    request<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<any>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<any>(`/customers/${id}`, {
      method: 'DELETE',
    }),

  assignSalesperson: (id: string, salespersonId: string) =>
    request<any>(`/customers/${id}/assign-salesperson`, {
      method: 'PATCH',
      body: JSON.stringify({ salespersonId }),
    }),
};

// ============ 订单管理 ============
export const orderApi = {
  getAll: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/orders${query ? `?${query}` : ''}`);
  },

  getOne: (id: string) => request<any>(`/orders/${id}`),

  create: (data: any) =>
    request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<any>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<any>(`/orders/${id}`, {
      method: 'DELETE',
    }),

  exportOne: (id: string) => {
    const token = getToken();
    window.open(`${API_BASE_URL}/orders/${id}/export?token=${token}`, '_blank');
  },

  exportBatch: (orderIds: string[]) =>
    request<any>('/orders/export-batch', {
      method: 'POST',
      body: JSON.stringify({ orderIds }),
    }),
};

// ============ 产品管理 ============
export const productApi = {
  // 分类
  getCategories: (activeOnly?: boolean) => {
    const query = activeOnly ? '?activeOnly=true' : '';
    return request<any>(`/products/categories${query}`);
  },

  createCategory: (data: any) =>
    request<any>('/products/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (id: string, data: any) =>
    request<any>(`/products/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: string) =>
    request<any>(`/products/categories/${id}`, {
      method: 'DELETE',
    }),

  // 材料
  getMaterials: (activeOnly?: boolean) => {
    const query = activeOnly ? '?activeOnly=true' : '';
    return request<any>(`/products/materials${query}`);
  },

  createMaterial: (data: any) =>
    request<any>('/products/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMaterial: (id: string, data: any) =>
    request<any>(`/products/materials/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteMaterial: (id: string) =>
    request<any>(`/products/materials/${id}`, {
      method: 'DELETE',
    }),

  // 产品组
  getGroups: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/products/groups${query ? `?${query}` : ''}`);
  },

  getGroup: (id: string) => request<any>(`/products/groups/${id}`),

  createGroup: (data: any) =>
    request<any>('/products/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateGroup: (id: string, data: any) =>
    request<any>(`/products/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteGroup: (id: string) =>
    request<any>(`/products/groups/${id}`, {
      method: 'DELETE',
    }),

  // SKU
  getSkus: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/products/skus${query ? `?${query}` : ''}`);
  },

  getSku: (id: string) => request<any>(`/products/skus/${id}`),

  createSku: (data: any) =>
    request<any>('/products/skus', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSku: (id: string, data: any) =>
    request<any>(`/products/skus/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteSku: (id: string) =>
    request<any>(`/products/skus/${id}`, {
      method: 'DELETE',
    }),

  // Excel导入导出
  downloadTemplate: () => {
    const token = getToken();
    window.open(`${API_BASE_URL}/products/skus/export-template?token=${token}`, '_blank');
  },

  exportSkus: (groupId: string) => {
    const token = getToken();
    window.open(`${API_BASE_URL}/products/skus/export?groupId=${groupId}&token=${token}`, '_blank');
  },

  importSkus: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/products/skus/import-excel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Import failed');
    }

    return response.json();
  },
};

// ============ 合作申请管理 ============
export const partnershipApi = {
  getAll: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/partnerships${query ? `?${query}` : ''}`);
  },

  getOne: (id: string) => request<any>(`/partnerships/${id}`),

  update: (id: string, data: any) =>
    request<any>(`/partnerships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<any>(`/partnerships/${id}`, {
      method: 'DELETE',
    }),

  getStatistics: () => request<any>('/partnerships/statistics'),
};

// ============ 系统配置 ============
export const systemApi = {
  getHomepage: () => request<any>('/system/homepage'),
  updateHomepage: (data: any) =>
    request<any>('/system/homepage', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAbout: () => request<any>('/system/about'),
  updateAbout: (data: any) =>
    request<any>('/system/about', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getSite: () => request<any>('/system/site'),
  updateSite: (data: any) =>
    request<any>('/system/site', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ============ 文件上传 ============
export const uploadApi = {
  uploadSingle: async (file: File, type: 'image' | 'document' | 'excel' = 'image') => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/single?type=${type}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  uploadMultiple: async (files: File[], type: 'image' | 'document' | 'excel' = 'image') => {
    const token = getToken();
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await fetch(`${API_BASE_URL}/upload/multiple?type=${type}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  deleteFile: (url: string) =>
    request<any>('/upload', {
      method: 'DELETE',
      body: JSON.stringify({ url }),
    }),
};
