import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getAll, add, update, queryDocs } from '../../services/firestore';
import { useAuth } from '../../contexts/AuthContext';

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
  status?: string;
  trackingNumber?: string;
}

const PickingConfirm = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  // ฟังก์ชันดึงชื่อพนักงานจาก Profile
  const getStaffDisplayName = async (staffId: string): Promise<string> => {
    try {
      const staffProfiles = await queryDocs('users', 'uid', '==', staffId);
      const staffProfile = staffProfiles[0] as any;
      
      if (staffProfile && staffProfile.firstName && staffProfile.lastName) {
        return `${staffProfile.firstName} ${staffProfile.lastName}`;
      }
      
      // ถ้าไม่มี Profile ให้ใช้ email
      return currentUser?.email || 'พนักงาน';
    } catch (e) {
      console.error('Failed to get staff display name', e);
      return currentUser?.email || 'พนักงาน';
    }
  };

  const handleBackToOrders = () => {
    // ถ้ามาจากหน้า staff dashboard ให้กลับไปที่เดิมและเลือกแถบคำสั่งซื้อ
    if (location.state?.fromStaff) {
      navigate('/', { state: { tab: 'orders' } });
    } else {
      navigate('/');
    }
  };

  const handleConfirmPick = async () => {
    if (!order || !currentUser) return;
    setConfirming(true);
    try {
      // บันทึกประวัติการเบิกสินค้า
      await add('picking', {
        orderId: order.id,
        staffId: currentUser.uid,
        staffName: await getStaffDisplayName(currentUser.uid),
        items: order.items,
        total: order.total,
        customerInfo: {
          fullName: order.fullName,
          phone: order.phone,
          address: order.address,
        },
        pickedAt: new Date(),
        status: 'แจ้งเบิก',
        trackingNumber: '',
        shippingNotes: '',
      });

      // อัปเดตสถานะออเดอร์เป็น 'กำลังเตรียมสินค้า'
      await update('orders', order.id, {
        status: 'กำลังเตรียมสินค้า',
      });

      handleBackToOrders();
    } catch (e) {
      console.error('Failed to confirm pick', e);
    } finally {
      setConfirming(false);
    }
  };

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      try {
        const allOrders = await getAll('orders');
        const found = (allOrders as Order[]).find((o) => o.id === orderId);
        setOrder(found || null);
      } catch (e) {
        console.error('Failed to load order', e);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          ไม่พบคำสั่งซื้อนี้
        </Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={handleBackToOrders}>
          กลับไปหน้าจัดการคำสั่งซื้อ
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          ยืนยันการเบิกสินค้า: คำสั่งซื้อ #{order.id}
        </Typography>

        {/* Order Info */}
        <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            ข้อมูลลูกค้า
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="ชื่อ-นามสกุล" secondary={order.fullName} />
            </ListItem>
            <ListItem>
              <ListItemText primary="เบอร์โทรศัพท์" secondary={order.phone} />
            </ListItem>
            <ListItem>
              <ListItemText primary="ที่อยู่จัดส่ง" secondary={order.address} />
            </ListItem>
          </List>
        </Paper>

        {/* Order Items */}
        <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            รายการสินค้า
          </Typography>
          <List dense>
            {order.items.map((item, index) => (
              <Box key={item.id || index}>
                <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      จำนวน: {item.quantity} ชิ้น
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {(item.price * item.quantity).toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} บาท
                  </Typography>
                </ListItem>
                {index < order.items.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>

        {/* Order Summary */}
        <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              ยอดรวมทั้งหมด
            </Typography>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              {order.total.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} บาท
            </Typography>
          </Box>
        </Paper>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleBackToOrders}>
            ยกเลิก
          </Button>
          <Button 
            variant="contained" 
            onClick={handleConfirmPick}
            disabled={confirming}
            startIcon={confirming && <CircularProgress size={20} />}
          >
            {confirming ? 'กำลังยืนยัน...' : 'ยืนยันการเบิกสินค้า'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PickingConfirm;
