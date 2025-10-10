import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Beams from '../components/Beams';
import GradientText from '@/components/GradientText';
import logo from '@/assets/aurora_Logo.png';
import { Link } from 'react-router-dom';
import {
  Package,
  Eye,
  X,
  CheckCircle,
  Truck,
  Clock,
  AlertTriangle,
  User,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react';
import ShinyText from '@/components/ShinyText';

interface OrderItem {
  productId: number;
  productName: string;
  productImagePath: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface Order {
  id: number;
  status: number; // OrderStatus enum value
  subtotal: number;
  shippingFee: number;
  grandTotal: number;
  createdAt: string;
  items: OrderItem[];
  cancellationReason?: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
}

const OrderManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    console.log('🔍 Auth check - authLoading:', authLoading);
    console.log('🔍 Auth check - user:', user);

    if (!authLoading && !user) {
      console.log('❌ User not authenticated, redirecting to login');
      window.location.href = '/login';
      return;
    }
    if (!authLoading && user && !user.isSuperAdmin && user.role !== 'admin') {
      console.log('❌ User is not admin, redirecting to dashboard');
      console.log('User role:', user.role);
      console.log('User isSuperAdmin:', user.isSuperAdmin);
      console.log('User object:', JSON.stringify(user, null, 2));
      window.location.href = '/';
      return;
    }
    console.log('✅ User is authenticated and authorized');
  }, [user, authLoading]);

  const fetchOrders = async () => {
    console.log('🚀 fetchOrders called');
    if (!user || (!user.isSuperAdmin && user.role !== 'admin')) {
      console.log('❌ Not authorized to fetch orders');
      console.log('User:', user);
      return;
    }

    try {
      console.log('🔍 Fetching orders from API...');

      // Önce sipariş sayısını kontrol edelim
      const countResponse = await api.get('/api/orders/debug/count');
      console.log('📊 Order count:', countResponse.data);

      // Debug listesini de alalım
      const debugListResponse = await api.get('/api/orders/debug/list');
      console.log('📋 Debug order list:', debugListResponse.data);

      const response = await api.get('/api/orders/admin/all');
      console.log('✅ Orders API response:', response);
      console.log('📦 Orders data:', response.data);
      console.log('📦 Orders data type:', typeof response.data);
      console.log('📦 Orders data length:', Array.isArray(response.data) ? response.data.length : 'not array');
      setOrders(response.data);
      console.log('✅ Orders state updated');
      console.log('📊 Current orders state:', orders);
      console.log('📊 New orders data:', response.data);
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      toast.error('Siparişler yüklenirken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered - authLoading:', authLoading, 'user:', user);
    if (!authLoading && user && (user.isSuperAdmin || user.role === 'admin')) {
      console.log('✅ Conditions met, calling fetchOrders');
      fetchOrders();
    } else if (!authLoading) {
      console.log('❌ Conditions not met for fetchOrders');
      console.log('authLoading:', authLoading);
      console.log('user:', user);
      if (user) {
        console.log('user.isSuperAdmin:', user.isSuperAdmin);
        console.log('user.role:', user.role);
      }
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    console.log('📊 Orders state changed:', orders);
    console.log('📊 Orders length:', orders.length);
  }, [orders]);

  const getStatusBadge = (status: number) => {
    const statusMap = {
      0: { label: 'Bekliyor', color: 'bg-yellow-500' },
      1: { label: 'Ödendi', color: 'bg-blue-500' },
      2: { label: 'Hazırlanıyor', color: 'bg-orange-500' },
      3: { label: 'Gönderildi', color: 'bg-purple-500' },
      4: { label: 'Teslim Edildi', color: 'bg-green-500' },
      5: { label: 'İptal Edildi', color: 'bg-red-500' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: 'Bilinmiyor', color: 'bg-gray-500' };

    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: return <Clock className="w-4 h-4" />;
      case 1: return <DollarSign className="w-4 h-4" />;
      case 2: return <Package className="w-4 h-4" />;
      case 3: return <Truck className="w-4 h-4" />;
      case 4: return <CheckCircle className="w-4 h-4" />;
      case 5: return <X className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    if (!cancelReason.trim()) {
      toast.error('İptal sebebi zorunludur');
      return;
    }

    setCancelLoading(true);
    try {
      await api.post(`/api/orders/${selectedOrder.id}/cancel`, {
        reason: cancelReason
      });

      toast.success('Sipariş başarıyla iptal edildi');
      setShowCancelDialog(false);
      setCancelReason('');
      setSelectedOrder(null);
      fetchOrders(); // Refresh orders
    } catch (error: any) {
      console.error('Error canceling order:', error);
      toast.error(error.response?.data?.message || 'Sipariş iptal edilemedi');
    } finally {
      setCancelLoading(false);
    }
  };

  const canCancelOrder = (status: number) => {
    return status !== 4 && status !== 5; // Not delivered or already canceled
  };

  if (authLoading || loading) {
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

  if (!user) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <Beams beamWidth={3} beamHeight={45} beamNumber={35} lightColor="#D4AF37" speed={2.5} noiseIntensity={1.95} scale={0.2} rotation={20} />
        </div>
        <div className="relative z-10 min-h-screen bg-neutral-950/40 text-neutral-100 flex items-center justify-center">
          <div className="text-xl">Lütfen giriş yapın</div>
        </div>
      </div>
    );
  }

  if (!user.isSuperAdmin && user.role !== 'admin') {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <Beams beamWidth={3} beamHeight={45} beamNumber={35} lightColor="#D4AF37" speed={2.5} noiseIntensity={1.95} scale={0.2} rotation={20} />
        </div>
        <div className="relative z-10 min-h-screen bg-neutral-950/40 text-neutral-100 flex items-center justify-center">
          <div className="text-xl">Bu sayfaya erişim yetkiniz yok</div>
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
                Sipariş Yönetimi
              </GradientText>
            </div>
            <ShinyText
              text={`Toplam ${orders.length} sipariş`}
              disabled={false}
              speed={3}
              className="text-sm md:text-base text-neutral-400"
            />
          </div>
        </header>

        {/* Orders Grid */}
        <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card key={order.id} className="bg-neutral-900/20 backdrop-blur-sm border border-neutral-700/30 hover:bg-neutral-900/30 transition-all duration-300">
            <CardHeader className="pb-3 p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">
                  Sipariş #{order.id}
                </CardTitle>
                {getStatusBadge(order.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-400 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  ₺{order.grandTotal.toFixed(2)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0">
              {/* User Info */}
              {order.userName && (
                <div className="bg-neutral-800/40 backdrop-blur-sm p-3 rounded-lg border border-neutral-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm font-medium text-white">{order.userName}</span>
                  </div>
                  {order.userEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-300">{order.userEmail}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-neutral-300">Ürünler ({order.items.length})</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-neutral-400 truncate">{item.productName}</span>
                      <span className="text-white">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancellation Reason */}
              {order.cancellationReason && (
                <div className="bg-red-900/20 border border-red-700 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">İptal Sebebi</span>
                  </div>
                  <p className="text-sm text-red-300">{order.cancellationReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-neutral-600 text-neutral-300 hover:text-[#C48913]"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detay
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-neutral-900 border-neutral-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        Sipariş #{order.id} Detayları
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Order Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-neutral-400">Durum</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(order.status)}
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-neutral-400">Tarih</Label>
                          <p className="text-white mt-1">
                            {new Date(order.createdAt).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>

                      {/* User Info */}
                      {order.userName && (
                        <div className="bg-neutral-800/40 backdrop-blur-sm p-4 rounded-lg border border-neutral-700/30">
                          <Label className="text-neutral-400">Müşteri Bilgileri</Label>
                          <div className="mt-2 space-y-1">
                            <p className="text-white"><strong>Ad:</strong> {order.userName}</p>
                            <p className="text-white"><strong>Email:</strong> {order.userEmail}</p>
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div>
                        <Label className="text-neutral-400">Ürünler</Label>
                        <div className="mt-2 space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="bg-neutral-800/40 backdrop-blur-sm p-3 rounded-lg border border-neutral-700/30">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-white font-medium">{item.productName}</p>
                                  <p className="text-gray-400 text-sm">
                                    ₺{item.unitPrice.toFixed(2)} x {item.quantity}
                                  </p>
                                </div>
                                <p className="text-[#C48913] font-medium">
                                  ₺{item.lineTotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="bg-neutral-800/40 backdrop-blur-sm p-4 rounded-lg border border-neutral-700/30">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Ara Toplam:</span>
                            <span className="text-white">₺{order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Kargo:</span>
                            <span className="text-white">₺{order.shippingFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t border-gray-600 pt-2">
                            <span className="text-white">Toplam:</span>
                            <span className="text-[#C48913]">₺{order.grandTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cancellation Reason */}
                      {order.cancellationReason && (
                        <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
                          <Label className="text-red-400">İptal Sebebi</Label>
                          <p className="text-red-300 mt-2">{order.cancellationReason}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {canCancelOrder(order.status) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowCancelDialog(true);
                    }}
                  >
                    <X className="w-4 h-4 mr-1 hover:text-[#C40000] transition-colors" />
                    İptal Et
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        </div>

        {/* Cancel Order Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="bg-neutral-900 border-neutral-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Sipariş İptali
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">
              Sipariş #{selectedOrder?.id} iptal edilecektir. İptal sebebi zorunludur.
            </p>
            <div>
              <Label htmlFor="cancelReason" className="text-white">
                İptal Sebebi *
              </Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancelReason(e.target.value)}
                placeholder="İptal sebebini detaylı olarak açıklayın..."
                  className="mt-2 bg-neutral-800/40 backdrop-blur-sm border-neutral-700/30 text-white placeholder-gray-500"
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                  variant="outline"
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancelReason('');
                  setSelectedOrder(null);
                }}
                  className="border-neutral-600 text-white hover:text-[#7A88FF] transition-colors"
              >
                Geri Dön
              </Button>
              <Button
                onClick={handleCancelOrder}
                disabled={cancelLoading || !cancelReason.trim()}
                className="bg-red-600 hover:text-[#C40000] transition-colors"
              >
                {cancelLoading ? 'İptal Ediliyor...' : 'İptal Et'}
              </Button>
            </div>
          </div>
          </DialogContent>
        </Dialog>

        {orders.length === 0 && (
          <div className="p-6">
            <Card className="bg-neutral-900/20 backdrop-blur-sm border border-neutral-700/30">
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-neutral-500 mb-4" />
                <p className="text-neutral-400">Henüz hiç sipariş yok.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
