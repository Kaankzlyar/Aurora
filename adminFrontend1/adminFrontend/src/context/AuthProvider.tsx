import { createContext, useContext, useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
import {
  loginApi,
  registerApi,
  type LoginResponse,
  type RegisterRequest,
} from "@/lib/api";
import { storage } from "@/lib/storage";

export type AuthUser = LoginResponse["user"] | null;

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (p: {
    email: string;
    password: string;
    remember?: boolean;
  }) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // hydrate from storage
    try {
      const raw =
        localStorage.getItem("aurora.user") ||
        sessionStorage.getItem("aurora.user");
      const rawToken =
        localStorage.getItem("aurora.token") ||
        sessionStorage.getItem("aurora.token");
      if (raw) setUser(JSON.parse(raw));
      const { access, refresh } = storage.tokens;
      if (access) setAccessToken(access);
      if (refresh) setRefreshToken(refresh);
    } catch {}
    setLoading(false);
  }, []);

  const login: AuthContextType["login"] = async ({
    email,
    password,
    remember = true,
  }) => {
    const data = await loginApi(email, password);
    storage.saveSession(data, remember);
    setUser(data.user);
    setAccessToken(data.accessToken ?? null);
    setRefreshToken(data.refreshToken ?? null);
  };

  const register: AuthContextType["register"] = async (userData) => {
    const data = await registerApi(userData);
    storage.saveSession(data, true); // Register edilen kullanıcıları hatırla
    setUser(data.user);
    setAccessToken(data.accessToken ?? null);
    setRefreshToken(data.refreshToken ?? null);
  };

  const logout = () => {
    storage.clear();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const value = useMemo(
    () => ({ user, accessToken, refreshToken, loading, login, register, logout }),
    [user, accessToken, refreshToken, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthCtx() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthCtx must be used within AuthProvider");
  return ctx;
}
=======
import { loginApi, registerApi, type LoginResponse, type RegisterRequest } from "@/lib/api";
import { storage } from "@/lib/storage";


export type AuthUser = LoginResponse["user"] | null;


type AuthContextType = {
user: AuthUser;
loading: boolean;
login: (p: { email: string; password: string; remember?: boolean }) => Promise<void>;
register: (userData: RegisterRequest) => Promise<void>;
logout: () => void;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
const [user, setUser] = useState<AuthUser>(null);
const [loading, setLoading] = useState(true);


useEffect(() => {
// hydrate from storage
try {
const raw = localStorage.getItem("aurora.user") || sessionStorage.getItem("aurora.user");
if (raw) setUser(JSON.parse(raw));
} catch {}
setLoading(false);
}, []);


const login: AuthContextType["login"] = async ({ email, password, remember = true }) => {
const data = await loginApi(email, password);
storage.saveSession(data, remember);
setUser(data.user);
};

const register: AuthContextType["register"] = async (userData) => {
const data = await registerApi(userData);
storage.saveSession(data, true); // Register edilen kullanıcıları hatırla
setUser(data.user);
};

const logout = () => {
storage.clear();
setUser(null);
};

const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuthCtx() {
const ctx = useContext(AuthContext);
if (!ctx) throw new Error("useAuthCtx must be used within AuthProvider");
return ctx;
}
>>>>>>> ffcb4278176d55c38840c162d432d16f57abc477
