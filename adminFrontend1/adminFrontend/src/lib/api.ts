import axios from 'axios';

const BASE_URL = 'http://localhost:5270';

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('aurora.accessToken') || sessionStorage.getItem('aurora.accessToken');
    if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

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