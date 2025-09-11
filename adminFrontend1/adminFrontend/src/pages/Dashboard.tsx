import UserProfile from '@/components/UserProfile';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Aurora Admin</h1>
            <p className="opacity-70">Dashboard</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-[#C48913]/20 to-[#D4AF37]/20 border border-[#C48913]/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-[#C48913] mb-2">Welcome!</h2>
            <p className="text-neutral-300">
              You are successfully logged in as an admin. Web sitesinden kayıt olan kullanıcılar otomatik admin yetkisi alır.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-[#C48913]">1,234</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Active Orders</h3>
            <p className="text-3xl font-bold text-[#C48913]">567</p>
          </div>
        </div>

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