import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

import UserProfile from "@/components/UserProfile";
import GradientText from "@/components/GradientText";
import SpotlightCard from "@/components/SpotlightCard";
import { Button } from "@/components/ui/button";
import logo from "@/assets/aurora_Logo.png";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { DashboardStats } from "@/lib/api";

// Yeni tip: RegisterChartData
type RegisterChartData = {
  date: string;
  count: number;
};

export default function Dashboard() {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeOrders: 0,
    totalOrders: 0,
    totalAdmins: 0,
    pendingAdminRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [registerDate, setRegisterDate] = useState<string>("");
  const [registerChartData, setRegisterChartData] = useState<RegisterChartData[]>([]);

  useEffect(() => {
    void fetchDashboardStats();
    void fetchUserProfile();
    void fetchRegisterChartData();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get("/api/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Dashboard stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/api/user/profile"); // Header interceptor'dan geliyor
      setRegisterDate(response.data.registerDate);
    } catch (error) {
      console.error("User profile fetch error:", error);
    }
  };

  const fetchRegisterChartData = async () => {
    try {
      const res = await api.get<RegisterChartData[]>("/api/dashboard/register-chart", {
        params: { days: 90 },
      });
      setRegisterChartData(res.data ?? []);
    } catch (error) {
      console.warn("Register chart data fetch error:", error);
      setRegisterChartData([]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Company Logo" className="h-30" />
            <GradientText
              colors={["#6b4a1f", "#b5822a", "#6b4a1f"]}
              animationSpeed={6}
              showBorder={false}
              className="text-5xl font-['Cinzel']"
            >
              Admin
            </GradientText>
          </div>

          <div className="flex items-center space-x-4">
            <UserProfile />
            <button
              onClick={logout}
              className="px-4 py-2 hover:bg-[#ffffff]/20 hover:text-[#C40000] transition-colors rounded-lg text-white font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {registerDate && (
          <div className="mb-6 bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Kullanıcı Kayıt Tarihi</h3>
            <p className="text-xl text-[#C48913]">
              {new Date(registerDate).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SpotlightCard className="bg-gradient-to-r from-[#C48913]/20 to-[#D4AF37]/20 border border-[#C48913]/30 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-[#C48913] mb-2">Hoşgeldiniz!</h2>
            <p className="text-neutral-300">
              You are successfully logged in as an admin. Web sitesinden kayıt olan
              kullanıcılar otomatik admin yetkisi alır.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="outline"
                className="hover:bg-[#C48913]/20 hover:text-[#C48913] transition-colors"
                onClick={() => (window.location.href = "/admin-management")}
              >
                Admin Paneline Git
              </Button>
              <Button
                variant="outline"
                className="hover:bg-[#C48913]/20 hover:text-[#C48913] transition-colors"
                onClick={() => (window.location.href = "/product-management")}
              >
                Ürün Yönetimine Git
              </Button>
              <Button
                variant="outline"
                className="hover:bg-[#C48913]/20 hover:text-[#C48913] transition-colors"
                onClick={() => (window.location.href = "/order-management")}
              >
                Sipariş Yönetimine Git
              </Button>
            </div>
          </SpotlightCard>

          <SpotlightCard className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-[#C48913]">
              {loading ? "..." : stats.totalUsers.toLocaleString()}
            </p>
          </SpotlightCard>
          

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Total Admins</h3>
            <p className="text-3xl font-bold text-[#C48913]">
              {loading ? "..." : stats.totalAdmins}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Active Orders</h3>
            <p className="text-3xl font-bold text-[#C48913]">
              {loading ? "..." : stats.activeOrders.toLocaleString()}
            </p>
            <p className="text-sm text-neutral-400 mt-1">Paid, Preparing, Shipped</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-[#C48913]">
              {loading ? "..." : stats.totalOrders.toLocaleString()}
            </p>
            <p className="text-sm text-neutral-400 mt-1">All time orders</p>
          </div>
        </div>

        {stats.pendingAdminRequests > 0 && (
          <div className="mt-6 bg-orange-900/20 border border-orange-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 text-orange-400">
              Bekleyen Admin İstekleri
            </h3>
            <p className="text-orange-300">
              {stats.pendingAdminRequests} adet admin isteği onay bekliyor.
            </p>
            <Button
              variant="outline"
              className="mt-2 border-orange-600 text-orange-400 hover:bg-orange-900/30"
              onClick={() => (window.location.href = "/admin-management")}
            >
              İstekleri Görüntüle
            </Button>
          </div>
        )}

<Card className="py-4 sm:py-0 mt-8">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
              <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                <CardTitle>Kayıt Olan Kullanıcılar - Zaman Grafiği</CardTitle>
                <CardDescription>
                  Son 3 ayda günlük kayıt olan kullanıcı sayısı
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6 w-full">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={registerChartData}
                    margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("tr-TR", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      tickMargin={8}
                    />
                    <Tooltip
                      cursor={{ stroke: "#444", strokeWidth: 1 }}
                      labelFormatter={(value) => new Date(value as string).toLocaleDateString("tr-TR", { month: "long", day: "numeric", year: "numeric" })}
                      formatter={(value) => [String(value), "Kayıt Sayısı"]}
                    />
                    <Line
                      dataKey="count"
                      type="monotone"
                      stroke="#C48913"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Admin Privileges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["User Management", "Product Management", "Order Management", "Analytics Access"].map((title) => (
              <div key={title} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">{title}</span>
              </div>
            ))}
          </div>
        </div>
        
      </main>
    </div>
  );
}
