import { createBrowserRouter, Navigate } from "react-router";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import { useAuth } from "@/hooks/useAuth";


function Protected({ children }: { children: React.ReactNode }) {
const { user, loading } = useAuth();
if (loading) return <div className="grid place-items-center h-screen">Loading…</div>;
if (!user) return <Navigate to="/login" replace />;
return <>{children}</>;
}


export const router = createBrowserRouter([
{ path: "/login", element: <Login /> },
{ path: "/register", element: <Register /> },
{
path: "/",
element: (
<Protected>
<Dashboard />
</Protected>
),
},
]);