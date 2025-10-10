import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import Beams from '../components/Beams';
import GradientText from '@/components/GradientText';
import { Link } from 'react-router-dom';
import logo from '@/assets/aurora_Logo.png';
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
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <Beams beamWidth={3} beamHeight={45} beamNumber={35} lightColor="#D4AF37" speed={2.5} noiseIntensity={1.95} scale={0.2} rotation={20} />
        </div>
        <div className="relative z-10 min-h-screen bg-neutral-950/40 text-neutral-100 flex items-center justify-center">
          <div className="text-xl">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Beams Background */}
      <div className="fixed inset-0 z-0">
        <Beams beamWidth={3} beamHeight={45} beamNumber={35} lightColor="#D4AF37" speed={2.5} noiseIntensity={1.95} scale={0.2} rotation={20} />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen bg-neutral-950/40 text-neutral-100">
        {/* Header */}
        <header className="border-b border-neutral-800/50 bg-neutral-950/30 backdrop-blur-sm">
          <div className="px-6 h-16 md:h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" aria-label="Ana sayfa" className="inline-flex items-center shrink-0">
                <img src={logo} alt="Aurora" className="h-12 md:h-14 w-auto object-contain" />
              </Link>
              <GradientText
                colors={["#916201", "#D4AF37", "#916201"]}
                animationSpeed={4}
                showBorder={false}
                className="text-2xl md:text-3xl font-['Cinzel'] leading-none select-none"
              >
                Admin Yönetimi
              </GradientText>
            </div>
            {!showRequestForm && pendingRequests.length === 0 && (
              <Button 
                onClick={() => setShowRequestForm(true)}
                className="bg-[#C48913] hover:bg-[#D4AF37] text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Admin Yetkisi İste
              </Button>
            )}
          </div>
        </header>

        <div className="p-6 space-y-6">

      {/* Admin Request Form */}
      {showRequestForm && (
        <Card className="bg-neutral-900/20 backdrop-blur-sm border border-neutral-700/30">
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
                className="w-full bg-neutral-800/40 backdrop-blur-sm border border-neutral-700/30 text-white mt-2 p-3 rounded-md resize-none focus:border-[#C48913] focus:outline-none"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRequestAdmin}
                disabled={requestLoading}
                className="text-white hover:text-[#C48913] transition-colors"
              >
                {requestLoading ? 'Gönderiliyor...' : 'İstek Gönder'}
              </Button>
              <Button
                onClick={() => {
                  setShowRequestForm(false);
                  setRequestReason('');
                }}
                variant="outline"
                className="border-neutral-600 text-white hover:text-[#C40000] transition-colors"
              >
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Admin Requests */}
      {pendingRequests.length > 0 && (
        <Card className="bg-neutral-900/20 backdrop-blur-sm border border-neutral-700/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Bekleyen Admin İstekleri ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-neutral-800/40 backdrop-blur-sm p-4 rounded-lg border border-neutral-700/30">
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
                      <p className="text-neutral-300 text-sm mb-2">{request.email}</p>
                      <p className="text-neutral-400 text-sm mb-2">
                        <strong>Sebep:</strong> {request.adminRequestReason}
                      </p>
                      <p className="text-neutral-500 text-xs">
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
        <Card className="bg-neutral-900/20 backdrop-blur-sm border border-neutral-700/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Mevcut Adminler ({admins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {admins.map((admin) => (
                <div key={admin.id} className="bg-neutral-800/40 backdrop-blur-sm p-4 rounded-lg border border-neutral-700/30">
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
                  <p className="text-neutral-300 text-sm mb-2">{admin.email}</p>
                  <p className="text-neutral-500 text-xs mb-3">
                    Kayıt: {new Date(admin.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  {!admin.isSuperAdmin && (
                    <Button
                      onClick={() => handleRemoveAdmin(admin.id)}
                      disabled={actionLoading === admin.id}
                      size="sm"
                      variant="destructive"
                      className="w-full hover:text-[#C40000] transition-colors"
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
        <Card className="bg-neutral-900/20 backdrop-blur-sm border border-neutral-700/30">
          <CardContent className="text-center py-8">
            <Users className="w-16 h-16 mx-auto text-neutral-500 mb-4" />
            <p className="text-neutral-400">
              Henüz admin verisi yok. Admin yetkisi istemek için yukarıdaki butonu kullanabilirsiniz.
            </p>
          </CardContent>
        </Card>
      )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
