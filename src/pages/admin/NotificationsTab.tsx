import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getAll } from '../../services/firestore';

interface LowStockNotification {
  id: string;
  type: 'สต็อกต่ำ';
  productName: string;
  notificationDate: Date;
  remainingStock: number;
  productId: string;
}

interface ProductRow {
  id: string;
  name: string;
  quantity: number;
}

interface NotificationsTabProps {
  onNavigateToProduct: (productId: string) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ onNavigateToProduct }) => {
  const [notifications, setNotifications] = useState<LowStockNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLowStockNotifications();
  }, []);

  const loadLowStockNotifications = async () => {
    try {
      setLoading(true);
      
      // เรียกใช้ฟังก์ชัน checkLowStock (จำลองการทำงาน)
      const allProducts = await getAll('products') as ProductRow[];
      const lowStockItems = allProducts.filter(product => {
        const currentStock = product.quantity || 0;
        const minStockThreshold = Math.ceil(product.quantity * 0.2); // 20% ของจำนวนเดิม
        return currentStock <= minStockThreshold && currentStock > 0; // ต่ำกว่า 20% แต่ยังไม่หมด
      });

      // แปลงข้อมูลเป็นรูปแบบ notifications
      const notificationsData: LowStockNotification[] = lowStockItems.map(product => ({
        id: product.id,
        type: 'สต็อกต่ำ',
        productName: product.name,
        notificationDate: new Date(), // ใช้วันที่ปัจจุบัน
        remainingStock: product.quantity || 0,
        productId: product.id,
      }));

      setNotifications(notificationsData);
    } catch (e) {
      console.error('Failed to load low stock notifications', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (searchTerm && !notification.productName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleRowClick = (notification: LowStockNotification) => {
    // ไปหน้าสินค้าและเลือกสินค้านั้น
    onNavigateToProduct(notification.productId);
  };

  const refreshNotifications = () => {
    loadLowStockNotifications();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        รายการแจ้งเตือน
      </Typography>

      {/* ตัวกรอง */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="ค้นหาชื่อสินค้า"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
          />
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshNotifications}
            sx={{ minWidth: 120 }}
          >
            รีเฟรช
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            พบ {filteredNotifications.length} รายการ
          </Typography>
        </Box>
      </Paper>

      {/* ตารางรายการแจ้งเตือน */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ประเภท</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>ชื่อสินค้า</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>วันที่</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>จำนวนที่เหลือ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNotifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    ไม่พบรายการแจ้งเตือนสต็อกต่ำ
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification) => (
                <TableRow 
                  key={notification.id} 
                  hover 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleRowClick(notification)}
                >
                  <TableCell>{notification.type}</TableCell>
                  <TableCell>{notification.productName}</TableCell>
                  <TableCell>{formatDate(notification.notificationDate)}</TableCell>
                  <TableCell>{notification.remainingStock} ชิ้น</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default NotificationsTab;
