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
        setOrders(ordersData as Order[]);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          ประวัติคำสั่งซื้อสินค้า
        </Typography>

        {orders.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }} elevation={1}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              ยังไม่มีประวัติคำสั่งซื้อ
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
              เลือกสินค้าเพิ่ม
            </Button>
          </Paper>
        )}

        {orders.map((order) => (
          <Paper key={order.id} sx={{ p: 3, mb: 3 }} elevation={1}>
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
              <Box sx={{ px: 2, py: 1, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  สถานะ
                </Typography>
                <Typography variant="body2" color="primary">
                  {order.status || 'รอดำเนินการ'}
                </Typography>
              </Box>
              {order.trackingNumber && (
                <Box sx={{ px: 2, py: 1, backgroundColor: '#f3e5f5', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    เลขพัสดุ
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    {order.trackingNumber}
                  </Typography>
                </Box>
              )}
              {order.shippingMethod && (
                <Box sx={{ px: 2, py: 1, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ขนส่ง
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {order.shippingMethod}
                  </Typography>
                </Box>
              )}
              {!order.shippingMethod && (
                <Box sx={{ px: 2, py: 1, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ขนส่ง
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    รอแอดมินยืนยัน
                  </Typography>
                </Box>
              )}
              {!order.trackingNumber && (
                <Box sx={{ px: 2, py: 1, backgroundColor: '#fff3e0', borderRadius: 1 }}>
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
                <Card key={item.id} sx={{ display: 'flex', mb: 2, p: 1 }} elevation={0}>
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
          <Button variant="outlined" onClick={() => navigate('/')}>
            เลือกสินค้าเพิ่ม
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Orders;
