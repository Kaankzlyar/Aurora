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

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
}