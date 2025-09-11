import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Shield, 
  ShieldCheck,
  UserPlus,
  AlertTriangle
} from 'lucide-react';

interface AdminRequest {
  id: number;
  name: string;
  lastName: string;
  email: string;
  adminRequestReason: string;
  adminRequestDate: string;
  createdAt: string;
}

interface Admin {
  id: number;
  name: string;
  lastName: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

const AdminManagement = () => {
  const [pendingRequests, setPendingRequests] = useState<AdminRequest[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Form state for admin request
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch pending requests
      try {
        const requestsResponse = await api.get('/api/admin/pending-requests');
        setPendingRequests(requestsResponse.data);
      } catch (error: any) {
        if (error.response?.status === 403) {
          // User is not super admin, can't see pending requests
          setPendingRequests([]);
        } else {
          throw error;
        }
      }

      // Fetch admins list
      try {
        const adminsResponse = await api.get('/api/admin/list-admins');
        setAdmins(adminsResponse.data);
      } catch (error: any) {
        if (error.response?.status === 403) {
          // User is not super admin, can't see admins list
          setAdmins([]);
        } else {
          throw error;
        }
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestAdmin = async () => {
    if (!requestReason.trim()) {
      toast.error('Lütfen admin olmak isteme sebebinizi açıklayın');
      return;
    }

    setRequestLoading(true);
    try {
      const response = await api.post('/api/admin/request-admin', { reason: requestReason });
      toast.success(response.data.message);
      setShowRequestForm(false);
      setRequestReason('');
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Error requesting admin:', error);
      toast.error(error.response?.data?.message || 'İstek gönderilirken hata oluştu');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleApproveRequest = async (userId: number, approve: boolean) => {
    setActionLoading(userId);
    try {
      const response = await api.post('/api/admin/approve-request', { 
        userId, 
        approve,
        note: approve ? 'Onaylandı' : 'Reddedildi'
      });
      toast.success(response.data.message);
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Error processing request:', error);
      toast.error(error.response?.data?.message || 'İşlem gerçekleştirilemedi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAdmin = async (userId: number) => {
    if (!confirm('Bu kullanıcının admin yetkisini kaldırmak istediğinizden emin misiniz?')) {
      return;
    }

    setActionLoading(userId);
    try {
      const response = await api.post(`/api/admin/remove-admin/${userId}`);
      toast.success(response.data.message);
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Error removing admin:', error);
      toast.error(error.response?.data?.message || 'İşlem gerçekleştirilemedi');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Admin Yönetimi</h1>
        {!showRequestForm && pendingRequests.length === 0 && (
          <Button 
            onClick={() => setShowRequestForm(true)}
            className="bg-[#C48913] hover:bg-[#D4AF37] text-black"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Admin Yetkisi İste
          </Button>
        )}
      </div>

      {/* Admin Request Form */}
      {showRequestForm && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Admin Yetkisi İsteği
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Neden admin olmak istiyorsunuz?</Label>
              <textarea
                value={requestReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequestReason(e.target.value)}
                placeholder="Admin yetkisi isteme sebebinizi detaylı olarak açıklayın..."
                className="w-full bg-black/20 border border-gray-600 text-white mt-2 p-3 rounded-md resize-none focus:border-[#C48913] focus:outline-none"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRequestAdmin}
                disabled={requestLoading}
                className="bg-[#C48913] hover:bg-[#D4AF37] text-black"
              >
                {requestLoading ? 'Gönderiliyor...' : 'İstek Gönder'}
              </Button>
              <Button
                onClick={() => {
                  setShowRequestForm(false);
                  setRequestReason('');
                }}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Admin Requests */}
      {pendingRequests.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Bekleyen Admin İstekleri ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-black/20 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">
                          {request.name} {request.lastName}
                        </h3>
                        <Badge variant="outline" className="text-orange-400 border-orange-400">
                          Bekliyor
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{request.email}</p>
                      <p className="text-gray-400 text-sm mb-2">
                        <strong>Sebep:</strong> {request.adminRequestReason}
                      </p>
                      <p className="text-gray-500 text-xs">
                        İstek Tarihi: {new Date(request.adminRequestDate).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleApproveRequest(request.id, true)}
                        disabled={actionLoading === request.id}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Onayla
                      </Button>
                      <Button
                        onClick={() => handleApproveRequest(request.id, false)}
                        disabled={actionLoading === request.id}
                        size="sm"
                        variant="destructive"
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Reddet
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Admins */}
      {admins.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Mevcut Adminler ({admins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {admins.map((admin) => (
                <div key={admin.id} className="bg-black/20 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {admin.isSuperAdmin ? (
                        <ShieldCheck className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <Shield className="w-5 h-5 text-blue-400" />
                      )}
                      <h3 className="text-white font-semibold">
                        {admin.name} {admin.lastName}
                      </h3>
                    </div>
                    <Badge 
                      variant={admin.isSuperAdmin ? "default" : "secondary"}
                      className={admin.isSuperAdmin ? "bg-yellow-600" : ""}
                    >
                      {admin.isSuperAdmin ? 'Super Admin' : 'Admin'}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{admin.email}</p>
                  <p className="text-gray-500 text-xs mb-3">
                    Kayıt: {new Date(admin.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  {!admin.isSuperAdmin && (
                    <Button
                      onClick={() => handleRemoveAdmin(admin.id)}
                      disabled={actionLoading === admin.id}
                      size="sm"
                      variant="destructive"
                      className="w-full"
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Admin Yetkisini Kaldır
                    </Button>
                  )}
                  {admin.isSuperAdmin && (
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Kaldırılamaz</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pendingRequests.length === 0 && admins.length === 0 && !showRequestForm && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="text-center py-8">
            <Users className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">
              Henüz admin verisi yok. Admin yetkisi istemek için yukarıdaki butonu kullanabilirsiniz.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminManagement;
