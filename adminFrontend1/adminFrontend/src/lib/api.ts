import axios from 'axios';

const BASE_URL = 'http://localhost:5270';

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
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
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
}

export async function registerApi(userData: RegisterRequest): Promise<LoginResponse> {
    // Web sitesinden kayıt olan kullanıcılar otomatik admin olacak
    const registerData = {
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`,
        role: 'admin' // Web admin panelinden kayıt olanlar admin
    };
    
    const response = await api.post<LoginResponse>('/auth/register', registerData);
    return response.data;
}