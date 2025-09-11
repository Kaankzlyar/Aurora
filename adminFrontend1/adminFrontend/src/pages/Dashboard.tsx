import UserProfile from '@/components/UserProfile';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import logo from '@/assets/aurora_Logo.png';
import ShinyText from '@/components/ShinyText';
import SpotlightCard from '@/components/SpotlightCard';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  activeOrders: number;
  totalOrders: number;
  totalAdmins: number;
  pendingAdminRequests: number;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeOrders: 0,
    totalOrders: 0,
    totalAdmins: 0,
    pendingAdminRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Company Logo" className="h-30" />
            <ShinyText
             text= "Admin"
             disabled={false}
              speed={3}
              className="text-5xl font-['Cinzel']"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <UserProfile />
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Welcome Card */}
          <SpotlightCard className="bg-gradient-to-r from-[#C48913]/20 to-[#D4AF37]/20 border border-[#C48913]/30 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-[#C48913] mb-2">Hoşgeldiniz!</h2>
            <p className="text-neutral-300">
              You are successfully logged in as an admin. Web sitesinden kayıt olan kullanıcılar otomatik admin yetkisi alır.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/admin-management'}>
              Admin Paneline Git
            </Button>
            <Button variant="outline" className="mt-4 ml-2" onClick={() => window.location.href = '/order-management'}>
              Sipariş Yönetimine Git
            </Button>

          </SpotlightCard>

          {/* Stats Cards */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-[#C48913]">
              {loading ? '...' : stats.totalUsers.toLocaleString()}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Total Admins</h3>
            <p className="text-3xl font-bold text-[#C48913]">
              {loading ? '...' : stats.totalAdmins}
            </p>
          </div>
        </div>

        {/* Second Row - Orders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Active Orders</h3>
            <p className="text-3xl font-bold text-[#C48913]">
              {loading ? '...' : stats.activeOrders.toLocaleString()}
            </p>
            <p className="text-sm text-neutral-400 mt-1">Paid, Preparing, Shipped</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-[#C48913]">
              {loading ? '...' : stats.totalOrders.toLocaleString()}
            </p>
            <p className="text-sm text-neutral-400 mt-1">All time orders</p>
          </div>
        </div>

        {/* Pending Admin Requests Alert */}
        {stats.pendingAdminRequests > 0 && (
          <div className="mt-6 bg-orange-900/20 border border-orange-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 text-orange-400">Bekleyen Admin İstekleri</h3>
            <p className="text-orange-300">
              {stats.pendingAdminRequests} adet admin isteği onay bekliyor.
            </p>
            <Button 
              variant="outline" 
              className="mt-2 border-orange-600 text-orange-400 hover:bg-orange-900/30" 
              onClick={() => window.location.href = '/admin-management'}
            >
              İstekleri Görüntüle
            </Button>
          </div>
        )}

        {/* Admin Info */}
        <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Admin Privileges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">User Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Product Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Order Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Analytics Access</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}