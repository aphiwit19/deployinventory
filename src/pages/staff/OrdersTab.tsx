import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAll } from '../../services/firestore';

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

const OrdersTab = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // โหลดทุกออเดอร์จาก Firestore
        const allOrders = await getAll('orders');
        // แสดงเฉพาะที่ยังไม่ได้เบิก (status = 'รอดำเนินการ')
        const pendingOrders = (allOrders as Order[]).filter(
          (o) => o.status === 'รอดำเนินการ'
        );
        setOrders(pendingOrders);
      } catch (e) {
        console.error('Failed to load orders for staff', e);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        จัดการคำสั่งซื้อ
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        รายการคำสั่งซื้อที่รอการเบิกสินค้า (status = 'รอดำเนินการ')
      </Typography>
      {orders.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          ไม่มีคำสั่งซื้อที่ต้องดำเนินการในขณะนี้
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>เลขที่ออเดอร์</TableCell>
                <TableCell>ลูกค้า</TableCell>
                <TableCell>ที่อยู่</TableCell>
                <TableCell>รายการสินค้า</TableCell>
                <TableCell>ยอดรวม</TableCell>
                <TableCell>จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.fullName}</TableCell>
                  <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {order.address}
                  </TableCell>
                  <TableCell>
                    <Box>
                      {order.items.map((item, index) => (
                        <Typography key={item.id || index} variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {item.name} x{item.quantity}
                        </Typography>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {order.total.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => navigate(`/staff/pick/${order.id}`, { state: { fromStaff: true } })}>
                      เบิกสินค้า
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default OrdersTab;
