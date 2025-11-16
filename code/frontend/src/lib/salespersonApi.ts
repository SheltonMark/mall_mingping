const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface LoginRequest {
  accountId: string;
  password: string;
}

interface Salesperson {
  id: string;
  accountId: string;
  chineseName: string;
  englishName: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export const salespersonApi = {
  // 业务员登录
  login: async (data: LoginRequest) => {
    const response = await fetch(`${API_BASE_URL}/salesperson-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('登录失败');
    return response.json(); // { access_token, salesperson }
  },

  // 获取业务员信息
  getProfile: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/salesperson-auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('获取信息失败');
    return response.json();
  },

  // 更新业务员信息
  updateProfile: async (token: string, data: Partial<Salesperson>) => {
    const response = await fetch(`${API_BASE_URL}/salesperson-auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('更新失败');
    return response.json();
  },
};
