import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, type LoginResponse } from "@/lib/api";
import { storage } from "@/lib/storage";


export type AuthUser = LoginResponse["user"] | null;


type AuthContextType = {
user: AuthUser;
loading: boolean;
login: (p: { email: string; password: string; remember?: boolean }) => Promise<void>;
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


const logout = () => {
storage.clear();
setUser(null);
};


const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuthCtx() {
const ctx = useContext(AuthContext);
if (!ctx) throw new Error("useAuthCtx must be used within AuthProvider");
return ctx;
}