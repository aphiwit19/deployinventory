import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Divider,
  Card,
  CardMedia,
  CardContent,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { queryDocs } from '../../services/firestore';
import { add } from '../../services/firestore';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  uid: string;
  createdAt?: any;
  items: OrderItem[];
  total: number;
  fullName: string;
  phone: string;
  address: string;
  status?: string; // เช่น 'รอดำเนินการ', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ'
  trackingNumber?: string;
  shippingMethod?: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!currentUser) return;
      try {
        const ordersData = await queryDocs('orders', 'uid', '==', currentUser.uid);
        // Sort orders by date (latest first)
        const sortedOrders = (ordersData as Order[]).sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        setOrders(sortedOrders);
      } catch (e) {
        console.error('Failed to load orders', e);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [currentUser]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F1F5F9 100%)',
            zIndex: -1,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 50%)',
              zIndex: -1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
              zIndex: -1
            }
          }}
        />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F1F5F9 100%)',
          zIndex: -1,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 50%)',
            zIndex: -1
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            zIndex: -1
          }
        }}
      />
      
      <Paper
        sx={{
          p: 4,
          maxWidth: 900,
          mx: 'auto',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          transform: 'perspective(1000px) rotateX(0deg)',
          '&:hover': {
            transform: 'perspective(1000px) rotateX(-1deg) translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
          }
        }}
        elevation={0}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                📋
              </Typography>
            </Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #60A5FA 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(30, 58, 138, 0.1)',
                letterSpacing: 0.5
              }}
            >
              ประวัติคำสั่งซื้อ
            </Typography>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 2,
                boxShadow: '0 4px 12px rgba(96, 165, 250, 0.3)'
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                🛒
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                height: 2, 
                width: 60, 
                background: 'linear-gradient(90deg, transparent, #3B82F6)' 
              }} 
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748B',
                fontWeight: 500,
                px: 2
              }}
            >
              จัดการและติดตามคำสั่งซื้อของคุณ
            </Typography>
            <Box 
              sx={{ 
                height: 2, 
                width: 60, 
                background: 'linear-gradient(90deg, #3B82F6, transparent)' 
              }} 
            />
          </Box>
        </Box>

        {orders.length === 0 && (
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
            }} 
            elevation={0}
          >
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              ยังไม่มีประวัติคำสั่งซื้อ
            </Typography>
          </Paper>
        )}

        {orders.map((order) => (
          <Paper 
            key={order.id} 
            sx={{ 
              p: 3, 
              mb: 3,
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
            }} 
            elevation={0}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                คำสั่งซื้อ #{order.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.createdAt?.toDate?.().toLocaleString('th-TH') ||
                  order.createdAt?.toLocaleString?.('th-TH') ||
                  '-'}
              </Typography>
            </Box>

            {/* Status & Tracking */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(227, 242, 253, 0.8)', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  สถานะ
                </Typography>
                <Typography variant="body2" color="primary">
                  {order.status || 'รอดำเนินการ'}
                </Typography>
              </Box>
              {order.trackingNumber && (
                <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(243, 229, 245, 0.8)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    เลขพัสดุ
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    {order.trackingNumber}
                  </Typography>
                </Box>
              )}
              {order.shippingMethod && (
                <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(232, 245, 232, 0.8)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ขนส่ง
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {order.shippingMethod}
                  </Typography>
                </Box>
              )}
              {!order.shippingMethod && (
                <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(255, 243, 224, 0.8)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ขนส่ง
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    รอแอดมินยืนยัน
                  </Typography>
                </Box>
              )}
              {!order.trackingNumber && (
                <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(255, 243, 224, 0.8)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    เลขพัสดุ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    รอแอดมินยืนยัน
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Product list with images */}
            <Box sx={{ mb: 2 }}>
              {order.items.map((item) => (
                <Card 
                  key={item.id} 
                  sx={{ 
                    display: 'flex', 
                    mb: 2, 
                    p: 1,
                    background: 'rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(3px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }} 
                  elevation={0}
                >
                  {item.imageUrl && (
                    <CardMedia
                      component="img"
                      sx={{ width: 80, height: 80, borderRadius: 1, objectFit: 'cover' }}
                      image={item.imageUrl}
                      alt={item.name}
                    />
                  )}
                  <CardContent sx={{ flex: 1, '&:last-child': { pb: 0 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      จำนวน: {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                      {((item.price || 0) * item.quantity).toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} บาท
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Shipping info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">ที่อยู่จัดส่ง</Typography>
              <Typography variant="body2" textAlign="right" sx={{ maxWidth: '60%' }}>
                {order.fullName} – {order.phone}
                <br />
                {order.address}
              </Typography>
            </Box>

            {/* Total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                ยอดรวม
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {order.total.toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
          </Paper>
        ))}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: '#1E3A8A',
              color: '#1E3A8A',
              '&:hover': {
                borderColor: '#1E40AF',
                background: 'rgba(30, 58, 138, 0.04)'
              }
            }}
          >
            เลือกสินค้าเพิ่ม
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Orders;
