import axios from 'axios';
<<<<<<< HEAD
import { storage } from './storage';

=======
>>>>>>> ffcb4278176d55c38840c162d432d16f57abc477

const BASE_URL = 'http://localhost:5270';

export const api = axios.create({
  baseURL: BASE_URL,
<<<<<<< HEAD
  timeout : 15000,
=======
>>>>>>> ffcb4278176d55c38840c162d432d16f57abc477
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('aurora.accessToken') || sessionStorage.getItem('aurora.accessToken');
    if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

<<<<<<< HEAD
export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  isSuperAdmin: boolean;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user: User;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
};

export type ProfileResponse = {
  name: string;
  lastname: string;
  email: string;
  registerDate: string; // ISO
};

export type DashboardStats = {
  totalUsers: number;
  activeOrders: number;
  totalOrders: number;
  totalAdmins: number;
  pendingAdminRequests: number;
};

=======
export type LoginResponse = {
    accessToken: string;
    refreshToken?: string;
    user: {
        id: string;
        name: string;
        email: string;
        role? : string;
        isSuperAdmin: boolean;
    }
}

export type RegisterRequest = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
}
>>>>>>> ffcb4278176d55c38840c162d432d16f57abc477

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', { email, password });
    return response.data;
}

export async function registerApi(userData: RegisterRequest): Promise<LoginResponse> {
    console.log("🔍 REGISTER API DEBUG:");
    console.log("Input userData:", userData);
    
    // Web sitesinden kayıt olan kullanıcılar otomatik admin olacak
    const registerData = {
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`,
        role: 'admin' // Web admin panelinden kayıt olanlar admin
    };
    
    console.log("📤 Sending to API:", registerData);
    console.log("API URL:", `${BASE_URL}/api/auth/register`);
    
    try {
        const response = await api.post<LoginResponse>('/api/auth/register', registerData);
        console.log("✅ API Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("❌ API Error:", error);
        console.error("Error response:", error?.response?.data);
        console.error("Error status:", error?.response?.status);
        throw error;
    }
}