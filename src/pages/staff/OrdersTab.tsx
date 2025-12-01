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
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAll, update } from '../../services/firestore';
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
  assignedTo?: string;
  assignedAt?: any;
}

const OrdersTab = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // รายการที่จะแสดงในหน้าปัจจุบัน
  const displayedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleAssignOrder = async (orderId: string) => {
    // ไปที่หน้าเบิกสินค้าโดยตรง (ไม่ต้องมอบหมายล่วงหน้า)
    navigate(`/staff/pick/${orderId}`, { state: { fromStaff: true } });
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // โหลดทุกออเดอร์จาก Firestore
        const allOrders = await getAll('orders');
        
        // แสดงเฉพาะออเดอร์ที่ยังไม่มีคนรับผิดชอบ
        const unassignedOrders = (allOrders as Order[]).filter(
          (o) => !o.assignedTo && o.status === 'รอดำเนินการ'
        );
        
        setOrders(unassignedOrders);
      } catch (e) {
        console.error('Failed to load orders for staff', e);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // เพิ่มการรีเฟรชทุก 30 วินาทีเพื่ออัปเดตออเดอร์ล่าสุด
    const intervalId = setInterval(() => {
      loadOrders();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      minHeight: 'calc(100vh - 64px)', // เต็มหน้าจอลบ header
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0.5 }}>
          จัดการคำสั่งซื้อ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ออเดอร์ของคุณและออเดอร์ที่รอการรับผิดชอบ
        </Typography>
      </Box>
      
      {orders.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            flex: 1,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            ไม่มีคำสั่งซื้อที่ต้องดำเนินการ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ไม่มีออเดอร์ใหม่ในขณะนี้
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TableContainer 
            sx={{ 
              height: 'auto', // ให้ความสูงปรับตามเนื้อหา
              maxHeight: 'calc(100vh - 200px)', // สูงสูงสุดถ้าข้อมูลเยอะ
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#555',
              },
            }}
          >
          <Table 
            stickyHeader
            sx={{
              borderCollapse: 'separate',
              borderSpacing: 0,
              height: 'auto', // ให้ความสูงปรับตามเนื้อหา
              '& .MuiTableCell-root': {
                borderBottom: 'none', // ไม่มีเส้นโดยค่าเริ่มต้น
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>เลขที่ออเดอร์</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>ลูกค้า</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>ที่อยู่</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>รายการสินค้า</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>ยอดรวม</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>วันที่</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedOrders.map((order) => {
                return (
                  <TableRow 
                    key={order.id}
                    sx={{
                      backgroundColor: 'inherit',
                      '&:hover': {
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      },
                    }}
                  >
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          #{order.id.slice(-6)}
                        </Typography>
                        <span style={{ color: '#10B981', fontSize: '0.75rem' }}>🆕</span>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.fullName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" color="text.secondary">
                        {order.address}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Box sx={{ maxHeight: 100, overflowY: 'auto' }}>
                        {order.items.map((item, index) => (
                          <Typography key={item.id || index} variant="body2" sx={{ fontSize: '0.875rem', py: 0.25 }}>
                            • {item.name} x{item.quantity}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                        ฿{order.total.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" color="text.secondary">
                        {order.createdAt?.toDate?.().toLocaleDateString('th-TH') ||
                          order.createdAt?.toLocaleDateString?.('th-TH') ||
                          new Date().toLocaleDateString('th-TH')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Button 
                        variant="contained" 
                        size="small" 
                        onClick={() => handleAssignOrder(order.id)}
                        sx={{
                          backgroundColor: '#10B981',
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: '#059669',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        รับออเดอร์
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            </Table>
          </TableContainer>
          {orders.length > 5 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              borderTop: '1px solid #E2E8F0',
              py: 2,
              gap: 1,
              mt: 1
            }}>
              <IconButton
                onClick={(e) => handleChangePage(e, page - 1)}
                disabled={page === 0}
                sx={{ 
                  color: page === 0 ? '#ccc' : '#10B981',
                  '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' }
                }}
              >
                {'<'}
              </IconButton>
              
              {Array.from({ length: Math.ceil(orders.length / rowsPerPage) }, (_, index) => (
                <IconButton
                  key={index}
                  onClick={(e) => handleChangePage(e, index)}
                  sx={{
                    color: page === index ? '#10B981' : '#666',
                    backgroundColor: page === index ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                    fontSize: '0.875rem',
                    fontWeight: page === index ? 600 : 400,
                    minWidth: 32,
                    height: 32
                  }}
                >
                  {index + 1}
                </IconButton>
              ))}
              
              <IconButton
                onClick={(e) => handleChangePage(e, page + 1)}
                disabled={page >= Math.ceil(orders.length / rowsPerPage) - 1}
                sx={{ 
                  color: page >= Math.ceil(orders.length / rowsPerPage) - 1 ? '#ccc' : '#10B981',
                  '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' }
                }}
              >
                {'>'}
              </IconButton>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default OrdersTab;
